import prisma from "@my-better-t-app/db";
import z from "zod";

import { publicProcedure } from "../../index";


/**
 * 
 * 1. SENDER functions:
 *      sendMessage(recipientId, text): authenticated users can send msg to other users.
 * 
 * 
 * 
 * 
 * 2. RECEIVER functions:
 *      checkInbox() : poll inbox for new messages (msg with readAt=null). 
 *      markMessageAsRead(messageId): authenticated users can mark msg as read.
 *      loadAllMsg(userId): load all msgs between current user and userId.
 * 
 * 3. COMMON functions:
 *      deleteMessage(messageId): authenticated users can delete their own msgs.
 *      edit
 *      search
 *      
 *      
 *      
 *      
 * 
 * 
 */




export const messageRouter = {
    // 1. SENDER functions
    // 2. RECEIVER functions
    // =============================

    // ------------- COMMON -----------
    getCurrentUserInfo: publicProcedure
    .handler(async ({ context }) => {
        // Get current user info (id, name, email, image, createdAt, updatedAt)
        const currentUserId = context.session?.user.id;
        if (!currentUserId) {throw new Error("Not authenticated");}
        const user = await prisma.user.findUnique({
        where: { id: currentUserId },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
            updatedAt: true,
        },
        });
        return user;
    }),
    
    loadAllMsg: publicProcedure
    .handler(async ({ context }) => {
        // 1. check if authenticated
        // 2. findAll msg where user is sender or recipient
        const currentUserId = context.session?.user.id;
        if (!currentUserId) {throw new Error("Not authenticated");}
        return await prisma.message.findMany({
            where: {
                    OR: [
                        { senderId: currentUserId },
                        { recipientId: currentUserId },
                    ],
                },
            orderBy: { createdAt: "asc" }, // or "desc" for newest first
        });
    }),



    // ------------- SENDER -----------------
    sendMsg: publicProcedure
        // 1. ZOD : recipientId == string, text == string minLength = 1
        .input(z.object({ recipientId: z.string(), text: z.string().min(1) })) 
        .handler(async ({ input, context }) => {
        // 2. check if authenticated
        // 
            const senderId = context.session?.user.id;
            if (!senderId) {throw new Error("Not authenticated");}
        // CREATE msg in db 
        return await prisma.message.create({
            data: {
            senderId,
            recipientId: input.recipientId,
            text: input.text,
            },
        });
    }),


    // ------------- RECEIVER -----------------
    checkInbox: publicProcedure
        .handler(async ({ context }) => {
        const currentUserId = context.session?.user.id;
        if (!currentUserId) {
            throw new Error("Not authenticated");
        }

        return await prisma.message.findMany({
            where: {
                recipientId: currentUserId,
                readAt: null,                   // FIND unread messages
            },
        });
    }),
    
    
    markMsgAsRead: publicProcedure
        .input(z.object({ messageId: z.string() }))
        .handler(async ({ input, context }) => {
            const currentUserId = context.session?.user.id;
            if (!currentUserId) {throw new Error("Not authenticated");}
            const result = await prisma.message.updateMany({
                where: {
                        id: input.messageId,
                        recipientId: currentUserId,    // only recipient can mark as read
                    },
                    data: {
                        readAt: new Date(),
                    },
            });
            return { updated: result.count };
        }),
    
    




    getMsgWithUser: publicProcedure
        .input(z.object({ userId: z.string() }))
        .handler(async ({ input, context }) => {
        const currentUserId = context.session?.user.id;
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
