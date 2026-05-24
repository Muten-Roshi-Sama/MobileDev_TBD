// packages/api/src/routers/websocket/dev_start_server.ts


import { config } from "dotenv";

config({ path: new URL("../../../../../.env", import.meta.url) });

const { createWebSocketServer } = await import("./websocket");
createWebSocketServer();