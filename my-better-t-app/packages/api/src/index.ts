import { ORPCError, os } from "@orpc/server";
import type { Context } from "./context";


// oRPC setup: context + base procedures for all API endpoints.
// Declare publicProcedure/protectedProcedure.
// Don't declare routers here!


export const o = os.$context<Context>();
export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return next({
    context: {
      session: context.session,
    },
  });
});

export const protectedProcedure = publicProcedure.use(requireAuth);








