import { useQuery, useMutation } from "@tanstack/react-query";
import type { orpc } from "../../apps/web/src/utils/orpc";

type ORPC = typeof orpc

// =========
// USER 
// =========
export function useCurrentUser(orpc: ORPC) {
    const query = useQuery(
        orpc.user.getCurrentUserInfo.queryOptions()
    );
    return {
        user: query.data ?? null,
        isLoading: query.isLoading,
        isAuthenticated: !!query.data,
        error: query.error,
        refetch: query.refetch,
    };
}
export function useUserSearch(orpc: ORPC, query: string) {
    const enabled = query.trim().length > 1;
    const search = useQuery(
        orpc.user.search.queryOptions({
        input: { text: query },
        enabled
        })
    );
    return {
        users: search.data ?? [],
        isLoading: search.isLoading,
        error: search.error,
    };
}


// =========
// Message
// =========
export function useMessages( orpc: ORPC, conversationId: string | null, limit = 20 ) {
    // A Conversation selected required to query
    if (!conversationId) {
        return {
        messages: [] as const,
        nextCursor: null as string | null,
        isLoading: false,
        error: null,
        refetch: () => {},
        };
    }

    const query = useQuery(
        orpc.message.list.queryOptions({
        input: {
            conversationId,
            limit,
        },
        })
    );

    return {
        messages: query.data?.messages ?? [],
        nextCursor: query.data?.nextCursor ?? null,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}
export function useSendMessage(orpc: ORPC) {
    const mutation = useMutation(
        orpc.message.send.mutationOptions()
    );

    return {
        send: mutation.mutate,
        sendAsync: mutation.mutateAsync,
        isSending: mutation.isPending,
        error: mutation.error,
    };
}




// =========
// Conversation
// =========
export function useConversations(orpc: ORPC) {
    const query = useQuery( orpc.conversation.listAll.queryOptions() );
    return {
        conversations: query.data ?? [],  // empty array fallback if undefined
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
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


