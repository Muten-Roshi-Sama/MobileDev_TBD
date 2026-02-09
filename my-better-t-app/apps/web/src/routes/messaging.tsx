import { orpc, client } from "@/utils/orpc"; // adjust import as needed
import React, { useState, useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";


import { useCurrentUser } from "@my-better-t-app/hooks";


//UI
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export const Route = createFileRoute("/messaging")({
    component: MessagingPage,
});


// ======= API Functions ============
// user.ts :
//      user.getCurrentUserInfo();
//      user.search({ text: "alice" });
//
// message.ts :
//      message.sendMsg({ recipientId: "user-id", text: "Hello!" });
//      message.list();
//
// conversation.ts :
//      conversation.listAll();
//      conversation.create({ userIds: ["user-id-1", "user-id-2"] });
//      conversation.markRead({ conversationId: "convo-id" });
//      conversation.getById({ conversationId: "convo-id" });
//




function ChatLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ display: "flex", height: "100vh" }}>
        {children}
        </div>
    );
}

function ConversationList({ conversations, selectedId, onSelect }: any) {
    return (
        <aside style={{ width: 300, borderRight: "1px solid #eee" }}>
        {conversations.map((conv: any) => (
            <div
            key={conv.id}
            style={{
                padding: 16,
                background: conv.id === selectedId ? "#f0f0f0" : "transparent",
                cursor: "pointer",
            }}
            onClick={() => onSelect(conv.id)}
            >
            {conv.title || conv.id}
            </div>
        ))}
        </aside>
    );
}

function ChatWindow({ messages, onSend }: any) {
    const [text, setText] = useState("");
    return (
        <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            {messages.map((msg: any) => (
            <div key={msg.id} style={{ marginBottom: 8 }}>
                <b>{msg.senderId}</b>: {msg.text}
            </div>
            ))}
        </div>
        <form
            style={{ display: "flex", padding: 16, borderTop: "1px solid #eee" }}
            onSubmit={e => {
            e.preventDefault();
            if (text.trim()) {
                onSend(text);
                setText("");
            }
            }}
        >
            <input
            value={text}
            onChange={e => setText(e.target.value)}
            style={{ flex: 1, marginRight: 8 }}
            placeholder="Type a message..."
            />
            <button type="submit">Send</button>
        </form>
        </main>
    );
}



type User = {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
};

type Message = {
    id: string;
    senderId: string;
    recipientId: string;
    text: string;
    createdAt: Date;
    readAt?: Date | null;
};



// Main page
export default function MessagingPage() {}
// export default function MessagingPage() {
//     const user = useCurrentUser();
//     const conv = useConversations(user?.id);
//     const msgs = useMessages(conv.selectedId);

//     return (
//         <ChatLayout>
//         <ConversationList
//             conversations={conv.conversations}
//             selectedId={conv.selectedId}
//             onSelect={conv.selectConversation}
//         />
//         <ChatWindow
//             messages={msgs.messages}
//             onSend={msgs.send}
//         />
//         </ChatLayout>
//     );
// }





