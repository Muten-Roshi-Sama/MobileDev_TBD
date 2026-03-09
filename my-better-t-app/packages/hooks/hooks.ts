import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { orpc } from "../../apps/web/src/utils/orpc";

type ORPC = typeof orpc

// =========
// USER 
// =========
export function useUser(orpc: ORPC) {
    // const [getCurrentUserInfo, search, getUsersByIds] = useState('');
    function current() {
        const query = useQuery(
        orpc.user.current.queryOptions()
    )
        return {
        user: query.data ?? null,
        isLoading: query.isLoading,
        isAuthenticated: !!query.data,
        error: query.error,
        refetch: query.refetch,
        }
    }

    function search(text: string) {
        const enabled = text.trim().length > 1
        const query = useQuery(
        orpc.user.search.queryOptions({
            input: { text },
            enabled,
        })
        )
        return {
            users: query.data ?? [],
            isLoading: query.isLoading,
            error: query.error,
    }
    }

    function byIds(ids: string[]) {
        const enabled = ids.length > 0

        const query = useQuery(
        orpc.user.search_batch.queryOptions({
            input: { ids },
            enabled,
        })
        )

        return {
        users: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
        }
    }

    return {
        current,
        search,
        byIds,
    }
}



// =========
// Message
// =========
type Message = { id: string; senderId: string; recipientId: string; text: string; createdAt: Date; readAt?: Date | null; };
export function useMessages(orpc: ORPC, conversationId: string | null, limit = 20) {
    // Return if no conversation selected
    if (!conversationId) {
        return {
            messages: [] as Message[],        // mutable array
            nextCursor: null as string | null,
            isLoading: false,
            error: null,
            refetch: () => {},
            send: (_text: string) => {},      // dummy send
        };
    }
    // List all messages based on selected conversationId
    const query = useQuery(
        orpc.message.list.queryOptions({
        input: { conversationId, limit },
        })
    );

    // Define a mutation callback function to expose a send() function 
    const mutation = useMutation(orpc.message.send.mutationOptions());

    return {
        messages: query.data?.messages ?? [],
        nextCursor: query.data?.nextCursor ?? null,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
        send: (text: string) => mutation.mutate({ conversationId, text }),
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