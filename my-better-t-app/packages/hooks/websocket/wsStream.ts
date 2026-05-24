// packages/hooks/websocket/wsStream.ts
import type { ConversationEvent } from "../../api/src/routers/websocket/websocket";

const WS_URL =
  typeof import.meta !== "undefined" && (import.meta as any)?.env?.VITE_WS_URL
    ? (import.meta as any).env.VITE_WS_URL
    : "ws://localhost:4001";






// ---------- Websocket class manager ---------- 
class WSManager {
  ws: WebSocket | null = null;                                            // Socket instance holder.
  listeners = new Map<string, Set<(ev: ConversationEvent) => void>>();   // map of conversationId → Set<callbacks>.
  reconnectAttempts = 0;                                                // exponential backoff state.
  reconnectTimer: number | null = null;

  // ---
  connect() {
    // 1. Connect to ws if ws open.
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;
    this.ws = new WebSocket(WS_URL);

    // 2. Re-subscribe to any conversationIds.
    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      // re-subscribe to active convs
      for (const convId of this.listeners.keys()) {
        this.send({ op: "subscribe", conversationId: convId });
      }
    };

    // 3. Parse incoming frame.
    this.ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg?.type === "event" && msg.event?.conversationId) {
          const convId = msg.event.conversationId;
          const set = this.listeners.get(convId);
          if (set) for (const cb of Array.from(set)) cb(msg.event);
        }
      } catch {}
    };

    this.ws.onclose = () => { this.scheduleReconnect(); };
    this.ws.onerror = () => { try { this.ws?.close(); } catch {} };
  }

  //---
  scheduleReconnect() {
    //  schedule a reconnect with exponential backoff: 500ms * 2^attempt, capped at 30000ms
    if (this.reconnectTimer) return;
    const delay = Math.min(30000, 500 * 2 ** this.reconnectAttempts);
    this.reconnectAttempts++;
    // use globalThis so TS won't complain about `window`
    this.reconnectTimer = (globalThis as any).setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay) as unknown as number;
  }

  // ---
  send(payload: any) {
    // Stringify payload and send if socket is open.
    const data = JSON.stringify(payload);
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.connect();
      return;
    }
    try { this.ws.send(data); } catch {}
  }

  // ---
  subscribe(conversationId: string, cb: (e: ConversationEvent) => void) {
    // Add callback to Set for this conversationId.
    let set = this.listeners.get(conversationId);
    if (!set) {
      set = new Set();
      this.listeners.set(conversationId, set);
      this.send({ op: "subscribe", conversationId });
    }
    set.add(cb);
    this.connect();

    return () => {
      const s = this.listeners.get(conversationId);
      s?.delete(cb);
      if (!s || s.size === 0) {
        this.listeners.delete(conversationId);
        this.send({ op: "unsubscribe", conversationId });
      }
    };
  }
}

export const wsManager = new WSManager();