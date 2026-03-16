import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { use, useState } from "react";
import { orpc, queryClient } from "../../apps/web/src/utils/orpc";
import type { set } from "zod";

type ORPC = typeof orpc

// =========
// USER 
// =========
export function useUser(orpc: ORPC) {
    // const {currentUserInfo, searchText, setSearchText} = useUser(orpc)

    // ---- CURRENT USER INFO ----
    const queryCurrent = useQuery(orpc.user.current.queryOptions());
    const currentUserInfo = {
        user: queryCurrent.data ?? null,
        isLoading: queryCurrent.isLoading,
        isAuthenticated: !!queryCurrent.data,
        error: queryCurrent.error,
        refetch: queryCurrent.refetch,
    }


    // ---- SEARCH USERS ----
    const [searchText, setSearchText] = useState('');
    const enabledSearch= searchText.trim().length > 1
    const searchQuery = useQuery(orpc.user.search.queryOptions({
            input: { text: searchText },
            enabled: enabledSearch,
        })
    )
    const search = {
            users: searchQuery.data ?? [],
            isLoading: searchQuery.isLoading,
            error: searchQuery.error,
    }



    // ---- GET USERS BY IDS (BATCH) ----
    const [idsList, setIdsList] = useState<string[]>([]);
    const enabledByIds = idsList.length > 0
    const queryByIds  = useQuery(
    orpc.user.search_batch.queryOptions({
        input: { ids: idsList },
        enabled: enabledByIds,
        })
    )
    const byIds = {
        users: queryByIds .data ?? [],
        isLoading: queryByIds .isLoading,
        error: queryByIds .error,
    }
    

    return {
        currentUserInfo,

        searchText,
        setSearchText,
        search,
        
        byIds,
        setIdsList
    }
}

// =========
// Message
// =========
export function useMessages(orpc: ORPC, conversationId: string | null) {
    const [newMessage, setNewMessage] = useState('');
    const message = useQuery(orpc.message.list.queryOptions({ input: { conversationId: conversationId ?? '' } }));
    const queryClient = useQueryClient();


    // --- SEND MESSAGE ---
    const addMessage = useMutation(orpc.message.send.mutationOptions({
        onMutate: () => {
            queryClient.setQueryData(
                orpc.message.list.queryKey({ input: { conversationId: conversationId! } }),
                (oldData) => ({...oldData, messages: [...(oldData?.messages ?? []), { id: '', createdAt: new Date(), text: newMessage, senderId: 'me', timestamp: new Date().toISOString(), conversationId: conversationId! }], nextCursor: null})
            )
        },
        // AUTO DONE :
        // onSettled: () => {
        //     queryClient.invalidateQueries(
        //         orpc.message.list.key({ conversationId: conversationId ?? '' }),
        //     );
        // }
    }))


    // --- LIST MESSAGES ----
    const [limit, setLitmit] = useState(20);
    const listMessages = {
            messages: message.data?.messages ?? [],
            nextCursor: message.data?.nextCursor ?? null,
            isLoading: conversationId ? message.isLoading : false,
            error: message.error,
            refetch: message.refetch,
        };

    return {
        newMessage,
        setNewMessage,
        
        send() {
            addMessage.mutate({ conversationId: conversationId ?? '', text: newMessage });
            setNewMessage('')
        },
        //
        limit,
        setLitmit,
        list() {

        },
    };

}

// TODO: 
//      - change conversationId to number, and store it as selectedConversation in the url
//      - remove interfaces and replace by inferred types from Prisma or inherit them directly

//      - SOCKETS : 
//      - Prisma script seeding




// =========
// Conversation
// =========
export function useConversations(orpc: ORPC) {
    const { data, isLoading, error, refetch } = useQuery( orpc.conversation.listAll.queryOptions() );
    // const [selectedId, setSelectedId] = useState<string | null>(null);


    // -- LIST ALL ---
    //      - includes last message (for sidebar display) ?
    //      - compute unread count based on lastReadAt of participant and messages createdAt.
    const convs = data?.map(cv => {
        const lastReadAt = cv.participants.find(p => p.userId === 'me')!.lastReadAt!;
        const count = cv.messages.filter(msg => msg.createdAt >= lastReadAt).length;
        return {
            id: cv.id,
            participants: cv.participants.map(p => ({ userId: p.userId })), // list of all participants userIds
            lastMessage: cv.messages[0] ? {
                text: cv.messages[0].text,                // display last msg text in sidebar
                senderId: cv.messages[0].senderId,        // display who sent last msg in sidebar
                createdAt: cv.messages[0].createdAt,      // display when last msg was sent in sidebar
            } : null,
            unreadCount: count,                                     // display unread count bubble in sidebar    
        };
    }
    )

    // --- CREATE CONVERSATION ---
    const createConversation = useMutation(orpc.conversation.create.mutationOptions({
        onMutate: async ({ userIds }) => {
            // Optimistically add a new conversation to the list with a temporary ID
            // const tempId = `temp-${Date.now()}`;
            queryClient.setQueryData(
                orpc.conversation.listAll.queryKey(),
                (oldData) => [...(oldData ?? []), {
                    id: Date.now(),
                    participants: userIds.map(id => ({ userId: id })),
                    lastMessage: null,
                    unreadCount: 0,
                }]
            );
            // return tempId; // Return the temporary ID for later reference
        },
        // Cache invalidation AUTO DONE...
    }))


    // --- markRead ---
    const markAsRead = useMutation(orpc.conversation.markRead.mutationOptions({
        onMutate: async ({ conversationId }) => {
            // Optimistically update the conversation's lastReadAt for the current user
            queryClient.setQueryData(
                orpc.conversation.listAll.queryKey(),
                (oldData) => oldData?.map(cv => {
                    if (cv.id === conversationId) {
                        return {
                            ...cv, lastReadAt: new Date(), unreadCount: 0,   // update the lastReadAt and reset unreadCount to 0
                        };
                    }
                    return cv;
                }
            )
        )
        },
        // Cache invalidation AUTO DONE...
    }))

    // --- getById ---


    return {
        conversations: convs ?? [],   // empty array fallback if undefined
        isLoading,
        error,
        refetch,
        // selectedId,
        // selectConversation: setSelectedId,
        createConversation: (userIds: string[]) => {
            createConversation.mutate({ userIds });
        },
        markAsRead: (conversationId: string) => {
            markAsRead.mutate({ conversationId });
        }
    };
}




