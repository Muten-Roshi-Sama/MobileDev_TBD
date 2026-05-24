// packages/api/src/routers/websocket/dev_start_server.ts


import { config } from "dotenv";

config({ path: new URL("../../../../../.env", import.meta.url) });

const debugEnabled = process.env.VITE_WS_DEBUG !== "false";
const debug = (...args: unknown[]) => {
    if (debugEnabled) console.log("[ws:dev]", ...args);
};

debug("booting websocket server");

const { createWebSocketServer } = await import("./websocket");
createWebSocketServer();