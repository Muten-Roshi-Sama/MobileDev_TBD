import prisma from "@my-better-t-app/db";
import z from "zod";

import { publicProcedure } from "../index";

export const messageRouter = {
  sendMessage: publicProcedure
    .input(z.object({ recipientId: z.string(), text: z.string().min(1) }))
    .handler(async ({ input, ctx }) => {
      const senderId = ctx.session?.user.id;
      if (!senderId) {
        throw new Error("Not authenticated");
      }

      return await prisma.message.create({
        data: {
          senderId,
          recipientId: input.recipientId,
          text: input.text,
        },
      });
    }),

  getMessagesWithUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .handler(async ({ input, ctx }) => {
      const currentUserId = ctx.session?.user.id;
      if (!currentUserId) {
        throw new Error("Not authenticated");
      }

      return await prisma.message.findMany({
        where: {
          OR: [
            { senderId: currentUserId, recipientId: input.userId },
            { senderId: input.userId, recipientId: currentUserId },
          ],
        },
      });
    }),
};
