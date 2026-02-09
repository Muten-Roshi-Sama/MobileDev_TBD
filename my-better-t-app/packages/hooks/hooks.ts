import { useQuery } from "@tanstack/react-query";
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
// export function useUserSearch(orpc: ORPC, query: string) {
//     const enabled = query.trim().length > 1;
//     const search = useQuery(
//         orpc.user.search.queryOptions(
//         { text: query }
//         )
//     );
//     return {
//         users: search.data ?? [],
//         isLoading: search.isLoading,
//         error: search.error,
//     };
// }


// =========
// Message
// =========
// function useMessages(orpc: ORPC, conversationId: string | null) {
//     const { data, isLoading } = orpc.message.list.useQuery(
//         conversationId ? { conversationId } : undefined,
//         { enabled: !!conversationId }
//     );
//     const mutation = orpc.message.send.useMutation();

//     return {
//         messages: data ?? [],
//         send: (text: string) =>
//         mutation.mutate({ conversationId: conversationId!, text }),
//         isLoading,
//     };
// }



// =========
// Conversation
// =========
// function useConversations(userId: string) {
//     const { data, isLoading, error } = useQuery(orpc.conversation.listAll.queryOptions());
//     const [selectedId, setSelectedId] = useState<string | null>(null);

//     return {
//         conversations: data ?? [],
//         selectedId,
//         selectConversation: setSelectedId,
//         isLoading,
//         error
//     };
// }


