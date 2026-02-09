import prisma from "@my-better-t-app/db";
import z from "zod";

import { publicProcedure } from "../../index";



export const messageRouter = {
    /**
     * message.send({ conversationId, text }) : send message in conversation
     * message.list({ conversationId, cursor?, limit?} ) : list messages in conversation with pagination
     * 
     */

    send: publicProcedure
        .input(z.object({ conversationId: z.string(), text: z.string().min(1) }))
        .handler(async ({ input, context }) => {
            // 1. check if authenticated
            const senderId = context.session?.user.id;
            if (!senderId) {throw new Error("Not authenticated");}
            // 2. Create message in db
            const message = await prisma.message.create({
                data: {
                    conversationId: input.conversationId,
                    senderId,
                    text: input.text,
                },
            });
            // 3. Update conversation's updatedAt to now
            await prisma.conversation.update({
                where: { id: input.conversationId },
                data: { updatedAt: new Date() },
            });
            return message;
        }),

    list: publicProcedure
        .input(z.object({ conversationId: z.string(), cursor: z.string().nullish(), limit: z.number().min(1).max(100).default(20) }))
        .handler(async ({ input, context }) => {
            // 1. check if authenticated
            const currentUserId = context.session?.user.id;
            if (!currentUserId) {throw new Error("Not authenticated");}

            // 2. Fetch messages with pagination
            const messages = await prisma.message.findMany({
                where: { conversationId: input.conversationId },
                orderBy: { createdAt: "desc" },
                take: input.limit + 1, // fetch one extra to check if there's a next page
                cursor: input.cursor ? { id: input.cursor } : undefined,
                skip: input.cursor ? 1 : 0, // skip the cursor itself
            });

            // 3. Prepare next cursor
            let nextCursor: string | null = null;
            if (messages.length > input.limit) {
                const nextItem = messages.pop();
                nextCursor = nextItem!.id;
            }

            return {
                messages: messages.reverse(), // reverse to return in ascending order
                nextCursor,
            };
        }),



}



// OLD : discard code below 
    // getCurrentUserInfo: publicProcedure
    // .handler(async ({ context }) => {
    //     // Get current user info (id, name, email, image, createdAt, updatedAt)
    //     const currentUserId = context.session?.user.id;
    //     if (!currentUserId) {throw new Error("Not authenticated");}
    //     const user = await prisma.user.findUnique({
    //     where: { id: currentUserId },
    //     select: {
    //         id: true,
    //         name: true,
    //         email: true,
    //         image: true,
    //         createdAt: true,
    //         updatedAt: true,
    //     },
    //     });
    //     return user;
    // }),
    
    // loadAllMsg: publicProcedure
    // .handler(async ({ context }) => {
    //     // 1. check if authenticated
    //     // 2. findAll msg where user is sender or recipient
    //     const currentUserId = context.session?.user.id;
    //     if (!currentUserId) {throw new Error("Not authenticated");}
    //     return await prisma.message.findMany({
    //         where: {
    //                 OR: [
    //                     { senderId: currentUserId },
    //                     { recipientId: currentUserId },
    //                 ],
    //             },
    //         orderBy: { createdAt: "asc" }, // or "desc" for newest first
    //     });
    // }),



    // // ------------- SENDER -----------------
    // sendMsg: publicProcedure
    //     // 1. ZOD : recipientId == string, text == string minLength = 1
    //     .input(z.object({ recipientId: z.string(), text: z.string().min(1) })) 
    //     .handler(async ({ input, context }) => {
    //     // 2. check if authenticated
    //     // 
    //         const senderId = context.session?.user.id;
    //         if (!senderId) {throw new Error("Not authenticated");}
    //     // CREATE msg in db 
    //     return await prisma.message.create({
    //         data: {
    //         senderId,
    //         recipientId: input.recipientId,
    //         text: input.text,
    //         },
    //     });
    // }),


    // // ------------- RECEIVER -----------------
    // checkInbox: publicProcedure
    //     .handler(async ({ context }) => {
    //     const currentUserId = context.session?.user.id;
    //     if (!currentUserId) {
    //         throw new Error("Not authenticated");
    //     }

    //     return await prisma.message.findMany({
    //         where: {
    //             recipientId: currentUserId,
    //             readAt: null,                   // FIND unread messages
    //         },
    //     });
    // }),
    
    
    // markMsgAsRead: publicProcedure
    //     .input(z.object({ messageId: z.string() }))
    //     .handler(async ({ input, context }) => {
    //         const currentUserId = context.session?.user.id;
    //         if (!currentUserId) {throw new Error("Not authenticated");}
    //         const result = await prisma.message.updateMany({
    //             where: {
    //                     id: input.messageId,
    //                     recipientId: currentUserId,    // only recipient can mark as read
    //                 },
    //                 data: {
    //                     readAt: new Date(),
    //                 },
    //         });
    //         return { updated: result.count };
    //     }),
    
    




    // getMsgWithUser: publicProcedure
    //     .input(z.object({ userId: z.string() }))
    //     .handler(async ({ input, context }) => {
    //     const currentUserId = context.session?.user.id;
    //     if (!currentUserId) {
    //         throw new Error("Not authenticated");
    //     }

    //     return await prisma.message.findMany({
    //         where: {
    //         OR: [
    //             { senderId: currentUserId, recipientId: input.userId },
    //             { senderId: input.userId, recipientId: currentUserId },
    //         ],
    //         },
    //     });
    // }),