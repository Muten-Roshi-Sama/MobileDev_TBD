import React, { useState, useEffect, useRef } from "react";
import { client } from "@/utils/orpc"; // adjust import as needed
import { createFileRoute } from "@tanstack/react-router";

//UI
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";


// ex .
// await client.message.sendMsg({ recipientId, text });
// await client.message.getCurrentUserInfo();
// await client.message.checkInbox();
// await client.message.loadAllMsg();

export const Route = createFileRoute("/messaging")({
    component: Messaging,
});


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

export default function Messaging() {
    const [user, setUser] = useState<User | null>(null);
    const [recipientId, setRecipientId] = useState("");
    const [text, setText] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    

    // Load current user info
    useEffect(() => {
        client.message.getCurrentUserInfo().then(setUser);
    }, []);

    // Load all messages for current user
    useEffect(() => {
        client.message.loadAllMsg().then(setMessages);
    }, []);

    // // For MVP, send to self
    // useEffect(() => {
    //     if (user) setRecipientId(user.id);
    // }, [user]);

    // Create CONVERSATION
    const currentUserId = user?.id;
    const conversations = React.useMemo(() => {
    const convoMap: { [userId: string]: Message[] } = {};
    messages.forEach(msg => {
        const otherUserId = msg.senderId === currentUserId ? msg.recipientId : msg.senderId;
        if (!convoMap[otherUserId]) convoMap[otherUserId] = [];
        convoMap[otherUserId].push(msg);
    });
    return convoMap;
    }, [messages, currentUserId]);

    // Conv list
    const conversationList = Object.entries(conversations).map(([userId, msgs]) => {
    const lastMsg = msgs[msgs.length - 1];
    return {
        userId,
        lastMsg,
        messages: msgs,
    };
    });



    // SENDING
    const handleSend = async () => {
        if (!text) return;
        await client.message.sendMsg({ recipientId, text });
        setText("");
        // Reload messages
        client.message.loadAllMsg().then(setMessages);
    };




    // UI
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    // =====================================================
        <div className="flex h-[80vh]">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 border-r overflow-y-auto">
        {conversationList.map(convo => (
          <div
            key={convo.userId}
            className={`p-4 cursor-pointer ${selectedUserId === convo.userId ? "bg-blue-100" : ""}`}
            onClick={() => setSelectedUserId(convo.userId)}
          >
            <div className="font-bold">{convo.userId}</div>
            <div className="text-sm text-gray-600 truncate">{convo.lastMsg.text}</div>
          </div>
        ))}
      </div>
      {/* Main chat area */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">

        <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
            {selectedUserId &&
                conversations[selectedUserId]?.map(msg => (
                <div key={msg.id} className={`mb-2 ${msg.senderId === currentUserId ? "text-right" : "text-left"}`}>
                    <span className={`inline-block px-3 py-2 rounded-lg ${msg.senderId === currentUserId ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
                    {msg.text}
                    </span>
                </div>
                ))}
            </div>
            {/* Input bar here */}
            </div>
        </div>
    </div>
}
