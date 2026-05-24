// packages/hooks/websocket/wsStream.ts
import type { ConversationEvent } from "../../api/src/routers/websocket/websocket";

const WS_URL =
  typeof import.meta !== "undefined" && (import.meta as any)?.env?.VITE_WS_URL
    ? (import.meta as any).env.VITE_WS_URL
    : "ws://localhost:4001";


// DEBUG PRINTS
const debugPrint =
  typeof import.meta !== "undefined" &&
  (import.meta as any)?.env?.VITE_WS_DEBUG !== "false";

const log = (...args: unknown[]) => { if (debugPrint) console.log("[ws:client - wsStream.ts]", ...args); };




// ---------- Websocket class manager ---------- 
class WSManager {
  ws: WebSocket | null = null;                                            // Socket instance holder.
  listeners = new Map<string, Set<(ev: ConversationEvent) => void>>();   // map of conversationId → Set<callbacks>.
  reconnectAttempts = 0;                                                // exponential backoff state.
  reconnectTimer: number | null = null;

  // ---
  connect() {
    log("connect()", {
      url: WS_URL,
      readyState: this.ws?.readyState,
      listeners: Array.from(this.listeners.keys()),
    });
    // 1. Connect to ws if ws open.
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      log("connect skipped (already open/connecting)", { readyState: this.ws.readyState });
      return;
    }
    this.ws = new WebSocket(WS_URL);
    log("socket created");

    // 2. Re-subscribe to any conversationIds.
    this.ws.onopen = () => {
      log("open", {
        readyState: this.ws?.readyState,
        listeners: Array.from(this.listeners.keys()),
      });
      this.reconnectAttempts = 0;
      // re-subscribe to active convs
      for (const convId of this.listeners.keys()) {
        log("resubscribe on open", { conversationId: convId });
        this.send({ op: "subscribe", conversationId: convId });
      }
    };

    // 3. Parse incoming frame.
    this.ws.onmessage = (ev) => {
      log("raw message", ev.data);

      try {
        const msg = JSON.parse(ev.data);
        log("parsed message", msg);

        if (msg?.type === "event" && msg.event?.conversationId) {
          const convId = msg.event.conversationId;
          log("dispatching event", {
            convId,
            type: msg.event.type,
          });

          const set = this.listeners.get(convId);
          log("listener lookup", {convId, listenerCount: set?.size ?? 0,});
          if (set) for (const cb of Array.from(set)) cb(msg.event);
        }
      } catch (error) {
        console.error("[ws:client - wsStream.ts] parse error", error);
      }
    };

    this.ws.onclose = (event) => {
      log("close", {code: event.code, reason: event.reason, wasClean: event.wasClean, });
      this.scheduleReconnect();
    };

    this.ws.onerror = (event) => {
      log("error", event);
      try {
        this.ws?.close();
      } catch (error) {
        log("close-after-error failed", error);
      }
    };
  }

  //---
  scheduleReconnect() {
    //  schedule a reconnect with exponential backoff: 500ms * 2^attempt, capped at 30000ms
    if (this.reconnectTimer) return;

    const delay = Math.min(30000, 500 * 2 ** this.reconnectAttempts);
    log("scheduleReconnect()", { delay, attempt: this.reconnectAttempts });

    this.reconnectAttempts++;
    this.reconnectTimer = (globalThis as any).setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay) as unknown as number;
  }

  // ---
  send(payload: any) {
    // Stringify payload and send if socket is open.
    const data = JSON.stringify(payload);
    log("send()", { payload, socketState: this.ws?.readyState, });

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      log("send deferred - socket not open yet", { socketState: this.ws?.readyState,});
      this.connect();
      return;
    }

    try {
      this.ws.send(data);
      log("send ok", { data });
    } catch (error) {
      log("send failed", error);
    }
  }

  // ---
  subscribe(conversationId: string, cb: (e: ConversationEvent) => void) {
    log("subscribe()", {
      conversationId,
      listenerCountBefore: this.listeners.get(conversationId)?.size ?? 0,
    });

    let set = this.listeners.get(conversationId);
    if (!set) {
      set = new Set();
      this.listeners.set(conversationId, set);
      log("created listener bucket", { conversationId });

      this.send({ op: "subscribe", conversationId });
    }

    set.add(cb);

    log("listener added", {
      conversationId,
      listenerCountAfter: set.size,
    });

    this.connect();

    return () => {
      log("unsubscribe()", {
        conversationId,
      });

      const s = this.listeners.get(conversationId);
      s?.delete(cb);

      log("listener removed", {
        conversationId,
        listenerCountAfter: s?.size ?? 0,
      });

      if (!s || s.size === 0) {
        this.listeners.delete(conversationId);
        log("sending unsubscribe frame", { conversationId });
        this.send({ op: "unsubscribe", conversationId });
      }
    };
  }
}

export const wsManager = new WSManager();