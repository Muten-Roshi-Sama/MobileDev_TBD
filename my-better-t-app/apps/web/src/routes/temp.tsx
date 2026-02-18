// import React, { useState, useEffect, useRef } from "react";
// import { createFileRoute } from "@tanstack/react-router";
// import { orpc, client } from "@/utils/orpc";

// // Hooks
// import {
//   useCurrentUser,
//   useUserSearch,
//   useUsersByIds,
// } from "@my-better-t-app/hooks";
// import { useMessages, useSendMessage } from "@my-better-t-app/hooks";
// import {
//   useConversations,
//   useConversationById,
//   useCreateConversation,
//   useMarkConversationRead,
// } from "@my-better-t-app/hooks";

// //UI
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Send } from "lucide-react";
// import { ModalPage } from "@/components/ModalPage";

// export const Route = createFileRoute("/messaging")({
//   component: MessagingPage,
// });


// // ===== Main Page =====
// export default function MessagingPage() {
//     const { user } = useCurrentUser(orpc);
//     const { conversations, selectedId, selectConversation } = useConversations(orpc);
//     const { messages, send } = useMessages(orpc, selectedId);

//     if (!user) return <div>Loading user...</div>;

//     return (
//         <ChatLayout>
//         <ConversationList
//             conversations={conversations}
//             selectedId={selectedId}
//             onSelect={selectConversation}
//         />
//         <ChatWindow messages={messages} onSend={send} />
//         </ChatLayout>
//     );
// }

// function ChatLayout({
//     children: [sidebar, chat],
//     }: {
//     children: [React.ReactNode, React.ReactNode]; // represents anything React can render (<> tags, strings, bools, arrays...)
//     }) {
//     return (
//         <div className="flex h-screen">
//         <div className="w-80 border-r flex flex-col">{sidebar}</div>
//         <div className="flex-1 flex flex-col">{chat}</div>
//         </div>
//     );
// }

// function SideBar({
    
// })



// // ======= API Functions ============
// // user.ts :
// //      user.getCurrentUserInfo();
// //      user.search({ text: "alice" });
// //
// // message.ts :
// //      message.sendMsg({ recipientId: "user-id", text: "Hello!" });
// //      message.list();
// //
// // conversation.ts :
// //      conversation.listAll();
// //      conversation.create({ userIds: ["user-id-1", "user-id-2"] });
// //      conversation.markRead({ conversationId: "convo-id" });
// //      conversation.getById({ conversationId: "convo-id" });
// //

// // =====================================================
// export default function MessagingPage() {
//   const { user } = useCurrentUser(orpc); // et current user info
//   const { conversations, selectedId, selectConversation, refetch } =
//     useConversations(orpc); // list all conv for this user (for sidebar)
//   const { messages, send } = useMessages(orpc, selectedId); // get all messages for selected conv.
//   const [input, setInput] = useState(""); // text input for form

//   // Find all users based on all conversations participants list.
//   const allUserIds = Array.from(
//     new Set(
//       conversations.flatMap((conv) => conv.participants.map((p) => p.userId)),
//     ),
//   );
//   const { users } = useUsersByIds(orpc, allUserIds); // find users

//   // auto scroll to bottom when new messages arrive
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // Create New conv
//   const { createAsync, isCreating } = useCreateConversation(orpc);
//   const handleCreateConversation = async (selectedUserIds: string[]) => {
//     if (selectedUserIds.length === 0) return;

//     try {
//       const newConversation = await createAsync({ userIds: selectedUserIds });
//       selectConversation(newConversation.id);
//       refetch();
//       setModalOpen(false);
//     } catch (err) {
//       console.error("Failed to create conversation", err);
//     }
//   };
//   const [isModalOpen, setModalOpen] = useState(false);
//   const toggleModal = () => {
//     setModalOpen((prev) => !prev);
//   };

//   // ======================================
//   return (
//     <div className="h-screen flex">
//       {/* LEFT PANEL */}

//       <div className="w-80 border-r flex flex-col">
//         <div className="p-4 font-bold border-b flex justify-between items-center">
//           <span>Conversations</span>
//           <Button onClick={() => setModalOpen(true)} size="sm">
//             + New
//           </Button>

//           {/* Modal component */}
//           <ModalPage
//             isOpen={isModalOpen}
//             onClose={() => setModalOpen(false)}
//             users={users}
//             onCreate={handleCreateConversation}
//             isCreating={isCreating}
//           />
//         </div>

//         <div className="flex-1 overflow-y-auto">
//           {conversations?.map((conv) => (
//             <div
//               key={conv.id}
//               onClick={() => selectConversation(conv.id)}
//               className={`p-4 cursor-pointer hover:bg-muted ${
//                 selectedId === conv.id ? "bg-muted" : ""
//               }`}
//             >
//               {/* {conv.participants?.map(p => p.user.name).join(", ") ?? "Conversation"} */}
//               {conv.participants
//                 ?.map((p) => users.find((user) => user.id === p.userId)?.name)
//                 .join(", ") ?? "Conversation"}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* RIGHT PANEL */}
//       <div className="flex-1 flex flex-col">
//         {/* Messages Area */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-3">
//           {!selectedId ? (
//             <div className="text-muted-foreground">Select a conversation</div>
//           ) : messages?.length === 0 ? (
//             <div className="text-muted-foreground">No messages yet</div>
//           ) : (
//             messages.map((message) => (
//               <div
//                 key={message.id}
//                 className={`max-w-xs p-3 rounded-lg ${
//                   message.senderId === user?.id
//                     ? "ml-auto bg-primary/20"
//                     : "bg-secondary/20"
//                 }`}
//               >
//                 {message.text}
//               </div>
//             ))
//           )}
//           <div ref={messagesEndRef} />
//         </div>

//         {/* Input */}
//         {selectedId && (
//           <form
//             onSubmit={(e) => {
//               e.preventDefault();
//               if (!input.trim()) return;
//               // Use callback send function
//               send(input);
//               setInput("");
//             }}
//             className="border-t p-4 flex gap-2"
//           >
//             <Input
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               placeholder="Type a message..."
//               className="flex-1"
//             />
//             <Button type="submit" size="icon" disabled={!input.trim()}>
//               <Send size={18} />
//             </Button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// }



// function Messages({ conversationId }: { conversationId: string }) {}


// // =========================================

// // ===== UI Components =====
// // function ChatLayout({ children }: { children: React.ReactNode }) {
// //     return <div style={{ display: "flex", height: "100vh" }}>{children}</div>;
// // }

// // function ConversationList({
// //         conversations,
// //         selectedId,
// //         onSelect,
// //     }: {
// //         conversations: any[];
// //         selectedId: string | null;
// //         onSelect: (id: string) => void;
// //     }) {
// //     return (
// //         <aside style={{ width: 300, borderRight: "1px solid #eee" }}>
// //         {conversations.map((conv) => (
// //             <div
// //             key={conv.id}
// //             style={{
// //                 padding: 16,
// //                 background: conv.id === selectedId ? "#f0f0f0" : "transparent",
// //                 cursor: "pointer",
// //             }}
// //             onClick={() => onSelect(conv.id)}
// //             >
// //             {conv.lastMessage
// //                 ? `${conv.lastMessage.senderId}: ${conv.lastMessage.text}`
// //                 : conv.id}
// //             {conv.unreadCount > 0 && (
// //                 <span style={{ float: "right", fontWeight: "bold" }}>
// //                 {conv.unreadCount}
// //                 </span>
// //             )}
// //             </div>
// //         ))}
// //         </aside>
// //     );
// // }

// // function ChatWindow({ messages, onSend, }:
// //         { messages: any[]; onSend: (text: string) => void;}) {
// //     const [text, setText] = useState("");
// //     return (
// //         <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
// //         <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
// //             {messages.map((msg) => (
// //             <div key={msg.id} style={{ marginBottom: 8 }}>
// //                 <b>{msg.senderId}</b>: {msg.text}
// //             </div>
// //             ))}
// //         </div>
// //         <form
// //             style={{ display: "flex", padding: 16, borderTop: "1px solid #eee" }}
// //             onSubmit={(e) => {
// //             e.preventDefault();
// //             if (text.trim()) {
// //                 onSend(text);
// //                 setText("");
// //             }
// //             }}
// //         >
// //             <input
// //             value={text}
// //             onChange={(e) => setText(e.target.value)}
// //             style={{ flex: 1, marginRight: 8 }}
// //             placeholder="Type a message..."
// //             />
// //             <button type="submit">Send</button>
// //         </form>
// //         </main>
// //     );
// // }


