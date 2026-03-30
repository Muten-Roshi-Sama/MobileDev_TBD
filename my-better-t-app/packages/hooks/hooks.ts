import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { use, useState } from "react";
import { orpc, queryClient } from "../../apps/web/src/utils/orpc";
import type { set } from "zod";
import type { get } from "http";

type ORPC = typeof orpc

// =========
// USER 
// =========
export function useUser(orpc: ORPC) {
    
    // DESCRIPTION :
    //      - GET current user data
    //      - SEARCH users by name/email
    //      - FETCH batch of users by ids (for conversation participants info, etc.)
    

    //* ---- CURRENT USER INFO ----
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
        currentUserInfo,    // returns User info (user, isLoading, isAuthenticated, error)

        searchText,         // input (what the user typed)
        setSearchText,      // updates the searchText input
        search,             // cleaned output of searchQuery (for UI)

        idsList,            //
        setIdsList,         //
        byIds,               // cleaned output of queryByIds (for UI)
        
    }
}

// =========
// Message
// =========
export function useMessages(orpc: ORPC, conversationId: string | null) {


    // DESCRIPTION :
    //      - GET messages from a conversation ID.
    //      - LOAD next messages batch when scrolling (cursor).
    //      - ADD message to a conversation.   
    
    
    //* Params : conversationId (Note : as a fn param, when it changes, it auto refetches this function too !)

    const queryClient = useQueryClient();  // cache controller
    const { currentUserInfo } = useUser(orpc);
    const currentUserId = currentUserInfo.user?.id;

    // --- SEND MESSAGE ---
    const [newMessage, setNewMessage] = useState('');  // Local UI state for chatInput 
    const addMessage = useMutation(orpc.message.send.mutationOptions({
        onMutate: () => {
            if (!conversationId || !currentUserId) return; // ignore if undefined

            const tempMessage = {
                id: `temp-${Date.now()}`,
                conversationId,
                senderId: currentUserId,
                text: newMessage,
                createdAt: new Date(),
                updatedAt: new Date(),
                editedAt: null,
                deletedAt: null,
                type: "text",
            };

            queryClient.setQueryData(
                orpc.message.list.queryKey({ input: { conversationId } }),
                (oldData) => {
                    if (!oldData) return oldData;

                    return {
                        ...oldData,
                        messages: [...oldData.messages, tempMessage],
                    };
                }
            );
        },
        // INVALIDATION - AUTO DONE :
        // onSettled: () => {
        //     queryClient.invalidateQueries(
        //         orpc.message.list.key({ conversationId: conversationId ?? '' }),
        //     );
        // }
    }))

    // ----- LOAD NEXT MESSAGES -----
    const [cursor, setCursor] = useState<string | undefined>(undefined);   // load next batch of messages using cursor(id of last loaded msg) when user is scrolling up.

    // --- LIST MESSAGES ----
    const [limit, setLitmit] = useState(20);
    const messages = useQuery(orpc.message.list.queryOptions({   // fetch all messages from a conversation
        input: { conversationId: conversationId!, limit, cursor }, 
        enabled: !!conversationId 
    }));
    const listMessages = {
            messages: messages.data?.messages.filter(msg => !msg.deletedAt) ?? [], // TODO: filters out deleted messages here or in backend ?
            nextCursor: messages.data?.nextCursor ?? null,
            isLoading: conversationId ? messages.isLoading : false,
            error: messages.error,
            refetch: messages.refetch,
    };


    return {
        newMessage,
        setNewMessage,
        
        send() {
            addMessage.mutate({ conversationId: conversationId ?? '', text: newMessage });  // params to pass to orpc send API
            setNewMessage('')  // clear curr input
        },
        //
        limit,
        setLitmit,
        cursor,
        setCursor,
        listMessages,
    };
}





// =========
// Conversation
// =========
export function useConversations(orpc: ORPC, conversationId?: string) {

    // DESCRIPTION :
    //      - GET all conversation where current user is a participant.
    //      - CREATE conversation with current user and other users.
    //      - UPDATE current conversation (mark as Read).
    //      - GET conversation by ID.
    // 

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
        queryClient.setQueryData(
            orpc.conversation.listAll.queryKey(),
            (oldData) => [
            ...(oldData ?? []),
            {
                id: "temp-id",
                participants: userIds.map((userId) => ({  // participants expect these fields
                    userId,
                    conversationId: "temp-id",
                    lastReadAt: null,
                    joinedAt: new Date(),
                })),
                messages: [], // empty array is OK
                lastMessage: null,
                unreadCount: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            ]
        );
        },
        // Cache invalidation AUTO DONE...
    })
    );

    // --- markRead --  const { conversationId } = Route.useSearch();  // useParam ? No : conversationId is a query param, not a url/path param.

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
    const getById = useQuery(orpc.conversation.getById.queryOptions({
        input: { id: conversationId ?? '' },            // store the current conv Id in the functions params.
        enabled: !!conversationId,                      // only fetch if conversationId exists
    }))
    


    return {
        // listAll
        conversations: convs ?? [],   // empty array fallback if undefined
        isLoading,
        error,
        refetch,

        // getById
        getById,                // contains { data, isLoading, error }

        // Mutations
        createConversation: (userIds: string[]) => {
            createConversation.mutate({ userIds });
        },
        markAsRead: (conversationId: string) => {
            markAsRead.mutate({ conversationId });
        }
    };
}




