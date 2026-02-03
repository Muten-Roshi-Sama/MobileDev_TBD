import React, { useState, useEffect } from "react";
import { client } from "@/utils/orpc"; // adjust import as needed
import { createFileRoute } from "@tanstack/react-router";


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

    // For MVP, send to self
    useEffect(() => {
        if (user) setRecipientId(user.id);
    }, [user]);

    const handleSend = async () => {
        if (!text) return;
        await client.message.sendMsg({ recipientId, text });
        setText("");
        // Reload messages
        client.message.loadAllMsg().then(setMessages);
    };

    return (
        <div style={{ padding: 24 }}>
        <h2>Messaging App</h2>
        <div>
            <label>
            Recipient ID:
            <input
                value={recipientId}
                onChange={e => setRecipientId(e.target.value)}
                disabled
            />
            </label>
        </div>
        <div>
            <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type your message..."
            />
            <button onClick={handleSend}>Send</button>
        </div>
        <div>
            <h3>Messages</h3>
            <ul>
            {messages.map(msg => (
                <li key={msg.id}>
                <b>{msg.senderId === user?.id ? "You" : msg.senderId}:</b> {msg.text}
                </li>
            ))}
            </ul>
        </div>
        </div>
    );
}
