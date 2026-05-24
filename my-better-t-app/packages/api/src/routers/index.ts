import type { RouterClient } from "@orpc/server";

import { protectedProcedure, publicProcedure } from "../index";
import { messageRouter } from "./chat/message";
import { userRouter } from "./chat/user";
import { conversationRouter } from "./chat/conversation";
import { $Enums } from "../../../db/prisma/generated/client";

import { createTanstackQueryUtils } from "@orpc/tanstack-query";


// import { streamRouter } from "./sse"; // Sockets

// Main API router: register all your routers here (messageRouter, etc).
// This is the entrypoint for the app's API endpoints.


export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "This is private",
      user: context.session?.user,
    };
  }),
  // Router registration
  user: userRouter,
  message: messageRouter,
  conversation: conversationRouter,
  // stream: streamRouter

};




export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;



export function createAppOrpcutils(client: AppRouterClient){
  return createTanstackQueryUtils(client);
}


export type AppOrpcUtils = ReturnType<typeof createAppOrpcutils>;



