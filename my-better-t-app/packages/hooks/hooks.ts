import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { orpc } from "../../apps/web/src/utils/orpc";
import type { set } from "zod";

type ORPC = typeof orpc

// =========
// USER 
// =========
export function useUser(orpc: ORPC) {
    // const [getCurrentUserInfo, search, getUsersByIds] = useState('');

    // ---- CURRENT USER INFO ----
    const queryCurrent = useQuery(orpc.user.current.queryOptions());
    const user = {
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
        searchText,
        setSearchText,
        current: user,
        search,
        byIds,
        setIdsList
    }
}

// =========
// Message
// =========
export function useMessages(orpc: ORPC, conversationId: string | null) {
    // Usage : 
    //      const messageApi = useMessage(orpc);
    //      const { messages, isLoading } = messageApi.list(conversationId);

    const [newMessage, setNewMessage] = useState('');
    const message = useQuery(orpc.message.list.queryOptions({ input: { conversationId: conversationId ?? '' } }));
    const queryClient = useQueryClient();


    
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




    const [limit, setLitmit] = useState(20)
    // --- LIST ----
    function list() {
        return {
            messages: message.data?.messages ?? [],
            nextCursor: message.data?.nextCursor ?? null,
            isLoading: conversationId ? message.isLoading : false,
            error: message.error,
            refetch: message.refetch,
        };
    }

    return {
        newMessage,
        setNewMessage,
        list,
        send() {
            addMessage.mutate({ conversationId: conversationId ?? '', text: newMessage });
            setNewMessage('')
        },
    };

}











// =========
// Conversation
// =========
export function useConversations(orpc: ORPC) {
    const { data, isLoading, error, refetch } = useQuery( orpc.conversation.listAll.queryOptions() );
    const [selectedId, setSelectedId] = useState<string | null>(null);

    return {
        conversations: data ?? [],   // empty array fallback if undefined
        selectedId,
        selectConversation: setSelectedId,
        isLoading,
        error,
        refetch,
    };
}

export function useConversationById(orpc: ORPC, conversationId: string | null) {
    if (!conversationId) {
        return {
            conversation: null as null,
            isLoading: false,
            error: null as null,
            refetch: () => {},
        };
    }
    // Valid conversationId
    const query = useQuery( orpc.conversation.getById.queryOptions({ input: { id: conversationId } }) );
    return {
        conversation: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}

export function useCreateConversation(orpc: ORPC) {
    const mutation = useMutation( orpc.conversation.create.mutationOptions() );
    return {
        create: mutation.mutate,
        createAsync: mutation.mutateAsync,
        isCreating: mutation.isPending,
        error: mutation.error,
    };
}

export function useMarkConversationRead(orpc: ORPC) {
    const mutation = useMutation( orpc.conversation.markRead.mutationOptions() );
    return {
        markRead: mutation.mutate,
        markReadAsync: mutation.mutateAsync,
        isMarking: mutation.isPending,
        error: mutation.error,
    };
}


export function useConversation(orpc: ORPC) {
    // const list = useSuspenseQuery( orpc.conversation.listAll.queryOptions())
    const send = useMutation( orpc.message.send.mutationOptions() );
    // return { list, send}
}

// list = useConversationList(orpc);