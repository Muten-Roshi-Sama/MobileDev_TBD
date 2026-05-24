// packages/api/src/websocket.ts
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import { auth } from "@my-better-t-app/auth";


// Server : runs this file
// Clients (web and naive) : connects to server using the WebSocket API : new WebSocket(url)



const PORT = Number(process.env.WS_PORT ?? 4001);
const subs = new Map<string, Set<WebSocket>>();    // In-memory subscriptions: conversationId as Set<ws> id


// DEBUG PRINT
const debugEnabled = process.env.VITE_WS_DEBUG !== "false";
const debug = (...args: unknown[]) => { if (debugEnabled) console.log("[ws:server]", ...args);};


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
    } catch { return null; }
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
    debug("broadcastConversationEvent()", {
        conversationId,
        type: event.type,
        listeners: set?.size ?? 0,
    });

    if (!set || set.size === 0) return;

    const payload = JSON.stringify({ type: "event", event });

    for (const client of Array.from(set)) {
        debug("sending websocket payload", {
        conversationId,
        readyState: client.readyState,
        });

        if (client.readyState === WebSocket.OPEN) {
        try {
            client.send(payload);
            debug("websocket payload sent", { conversationId });
        } catch (error) {
            console.error("[ws:server] websocket send failed", { conversationId, error });
        }
        } else {
        debug("skipping non-open client", {
            conversationId,
            readyState: client.readyState,
        });
        }
    }
}

export function createWebSocketServer(port = PORT) {
    // Creates a plain HTTP server, then a WebSocketServer bound to that server.

    debug("starting server", { port });
    const server = http.createServer();
    const wss = new WebSocketServer({ server });

    wss.on("connection", async (ws, req) => {
        debug("connection received");

        // 1; Authenticate using your existing auth helper (cookie-based for web)
        const headers = (req && (req as any).headers) || {};
        const session = await auth.api.getSession({ headers } as any).catch(() => null);

        if (!session?.user) {
            debug("unauthorized connection");
            try { ws.send(JSON.stringify({ type: "control", action: "unauthorized" })); } catch {}
            ws.close(4003, "Unauthorized");
            return;
        }
        debug("authenticated connection", { userId: session.user.id });

        // 2. Message handling: { op: 'subscribe'|'unsubscribe', conversationId: '...' }
        ws.on("message", (raw) => {
            const msg = safeParse(raw);
            if (!msg || typeof msg.op !== "string") return;
            debug("message received", msg);

            // Case : Subscribe
            if (msg.op === "subscribe" && typeof msg.conversationId === "string") {
                // TODO: verify the user is allowed to subscribe (participant) — recommended
                debug("subscribe", { conversationId: msg.conversationId, userId: session.user.id });
                subscribeSocketToConversation(ws, msg.conversationId);
            
            // Case : Unsubscribe
            } else if (msg.op === "unsubscribe" && typeof msg.conversationId === "string") {
                debug("unsubscribe", { conversationId: msg.conversationId, userId: session.user.id });
                unsubscribeSocketFromConversation(ws, msg.conversationId);
            }
        });

        // 3. avoid leakage :  removes the ws from all sets when the socket closes/errors
        const cleanup = () => {
            debug("cleanup socket");
            for (const [convId, set] of subs.entries()) {
                if (set.has(ws)) {
                set.delete(ws);
                if (set.size === 0) subs.delete(convId);
                }
            }
        };

    ws.on("close", () => { debug("socket closed"); cleanup(); });
    ws.on("error", (error) => { debug("socket error", error); cleanup(); });
    });

    // 4. Start listening.
    server.listen(port, () => {
        debug("listening", { url: `ws://localhost:${port}` });
        console.log(`[ws] listening on ws://localhost:${port}`);
    });

    return { server, wss };
}

const globalForWs = globalThis as typeof globalThis & {
    __wsServerStarted?: boolean;
};

export function ensureWebSocketServer(port = PORT) {
    if (globalForWs.__wsServerStarted) return;
    globalForWs.__wsServerStarted = true;
    createWebSocketServer(port);
}



// If run directly, start server (dev convenience)
// if (require.main === module) {
//   createWebSocketServer();
// }