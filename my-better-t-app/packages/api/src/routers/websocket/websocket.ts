// packages/api/src/websocket.ts
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import { auth } from "@my-better-t-app/auth";


// Server : runs this file
// Clients (web and naive) : connects to server using the WebSocket API : new WebSocket(url)



const PORT = Number(process.env.WS_PORT ?? 4001);
const subs = new Map<string, Set<WebSocket>>();    // In-memory subscriptions: conversationId as Set<ws> id



// Events shape
export type ConversationEvent = {
    type: string;
    conversationId?: string;
    message?: any;
    [k: string]: any;
};

// Helper
function safeParse(data: WebSocket.Data) {
    try {
        if (typeof data === "string") return JSON.parse(data);
        if (data instanceof Buffer) return JSON.parse(data.toString("utf8"));
        return null;
    } catch {
        return null;
    }
}



function subscribeSocketToConversation(ws: WebSocket, conversationId: string) {
    // TODO: verify client is allowed to subscribe (participant) before calling this.

    let set = subs.get(conversationId);
    if (!set) {
        set = new Set();
        subs.set(conversationId, set);
    }
    set.add(ws);
}

function unsubscribeSocketFromConversation(ws: WebSocket, conversationId: string) {
    // Removes ws from the specified set and deletes the set if empty.

    const set = subs.get(conversationId);
    if (!set) return;
    set.delete(ws);
    if (set.size === 0) subs.delete(conversationId);
}



export function broadcastConversationEvent(conversationId: string, event: ConversationEvent) {
    // Broadcast helper (exported so other server code can import and call)
    //  iterates the set for the given conversationId and send the event to each open client socket

    const set = subs.get(conversationId);
    if (!set || set.size === 0) return;
    const payload = JSON.stringify({ type: "event", event });
    for (const client of Array.from(set)) {
        if (client.readyState === WebSocket.OPEN) {
        try { client.send(payload); } catch {}
        }
    }
}

export function createWebSocketServer(port = PORT) {
    // Creates a plain HTTP server, then a WebSocketServer bound to that server.


    const server = http.createServer();
    const wss = new WebSocketServer({ server });

    wss.on("connection", async (ws, req) => {
        // 1; Authenticate using your existing auth helper (cookie-based for web)
        const headers = (req && (req as any).headers) || {};
        const session = await auth.api.getSession({ headers } as any).catch(() => null);

        if (!session?.user) {
            try { ws.send(JSON.stringify({ type: "control", action: "unauthorized" })); } catch {}
            ws.close(4003, "Unauthorized");
            return;
        }

        // 2. Message handling: { op: 'subscribe'|'unsubscribe', conversationId: '...' }
        ws.on("message", (raw) => {
            const msg = safeParse(raw);
            if (!msg || typeof msg.op !== "string") return;

            // Case : Subscribe
            if (msg.op === "subscribe" && typeof msg.conversationId === "string") {
                // OPTIONAL: verify the user is allowed to subscribe (participant) — recommended
                subscribeSocketToConversation(ws, msg.conversationId);
            
            // Case : Unsubscribe
            } else if (msg.op === "unsubscribe" && typeof msg.conversationId === "string") {
                unsubscribeSocketFromConversation(ws, msg.conversationId);
            }
        });

        // 3. avoid leakage :  removes the ws from all sets when the socket closes/errors
        const cleanup = () => {
        for (const [convId, set] of subs.entries()) {
            if (set.has(ws)) {
            set.delete(ws);
            if (set.size === 0) subs.delete(convId);
            }
        }
        };

        ws.on("close", cleanup);
        ws.on("error", cleanup);
    });

    // 4. Start listening.
    server.listen(port, () => {
        // eslint-disable-next-line no-console
        console.log(`[ws] listening on ws://localhost:${port}`);
    });

    return { server, wss };
}

// If run directly, start server (dev convenience)
// if (require.main === module) {
//   createWebSocketServer();
// }