import type { RouterClient } from "@orpc/server";

import { protectedProcedure, publicProcedure } from "../index";
import { messageRouter } from "./chat/message";
import { userRouter } from "./chat/user";
import { conversationRouter } from "./chat/conversation";

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


};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
