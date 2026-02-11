import prisma from "@my-better-t-app/db";
import z from "zod";

import { publicProcedure } from "../../index";




export const conversationRouter = {
    /**
     * 1. List all conversations for sidebar. (see Mockup : last message, unread count bubble, )
     * 2. Create/get a conversation.
     * 3. Update read/unread status.
     * 
     * conversation.list() : list all conversations for current user
     * conversation.create({ userIds: string[] }) : create a conv for multiple users.
     * conversation.markRead({ conversationId }) : mark conversation as read for current user
     * conversation.get({ id }) : get conversation by id
     * 
     * .list() & .get() : id, participants, lastMessage: { text, senderId, createdAt } | null, unreadCount
     * 
     */

    listAll : publicProcedure
        //* Find all Conversations where current user is a participant.
        .handler( async ({ context }) => {
            // 1. check if authenticated
            const currentUserId = context.session?.user.id;
            if (!currentUserId) {throw new Error("Not authenticated");}
            // 2. Prisma Query : findAll conversations where user is participant
            const conversations = await prisma.conversation.findMany({
                where: {
                    participants: {some: { userId: currentUserId }}
                },
                include: {
                    participants: true,
                    messages: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                    }
                },
            });

            // 3. Map to desired output
            return conversations.map(conversation => {
                // Find lastReadAt for current user && Count unread messages for current user
                const lastReadAt = conversation.participants.find(p => p.userId === currentUserId)!.lastReadAt!;
                const count = conversation.messages.filter(msg => msg.createdAt >= lastReadAt).length;
                return {
                    id: conversation.id,
                    participants: conversation.participants.map(p => ({ userId: p.userId })), // list of all participants userIds
                    lastMessage: conversation.messages[0] ? {
                        text: conversation.messages[0].text,                // display last msg text in sidebar
                        senderId: conversation.messages[0].senderId,        // display who sent last msg in sidebar
                        createdAt: conversation.messages[0].createdAt,      // display when last msg was sent in sidebar
                    } : null,
                    unreadCount: count,                                     // display unread count bubble in sidebar    
                };
            });
        }),

    create : publicProcedure
        .input(z.object({ userIds: z.array(z.string()).min(1) }))
        .handler( async ({ input, context }) => {
            // 1. check if authenticated
            const currentUserId = context.session?.user.id;
            if (!currentUserId) {throw new Error("Not authenticated");}

            // 2. Create conversation with participants
            const allUserIds = Array.from(new Set([...input.userIds, currentUserId]));
            const conversation = await prisma.conversation.create({
                data: {
                    participants: {create: allUserIds.map(userId => ({userId,})),},
                },
                include: {
                    participants: true,
                    messages: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                    }
                },
            });

            return conversation;
        }),

    markRead : publicProcedure
        .input(z.object({ conversationId: z.string() }))
        .handler( async ({ input, context }) => {
            // 1. check if authenticated
            const currentUserId = context.session?.user.id;
            if (!currentUserId) {throw new Error("Not authenticated");}

            // 2. Update lastReadAt for participant
            await prisma.conversationParticipant.updateMany({
                where: {
                    conversationId: input.conversationId,
                    userId: currentUserId,
                },
                data: {
                    lastReadAt: new Date(),
                },
            });

            return { success: true };
        }),

    getById : publicProcedure
        .input(z.object({ id: z.string() }))
        .handler( async ({ input, context }) => {
            // 1. check if authenticated
            const currentUserId = context.session?.user.id;
            if (!currentUserId) {throw new Error("Not authenticated");}

            // 2. Find conversation by id
            const conversation = await prisma.conversation.findUnique({
                where: { id: input.id },
                include: {
                    participants: true,
                    messages: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                    }
                },
            });

            if (!conversation) {
                throw new Error("Conversation not found");
            }

            const lastReadAt = conversation.participants.find(p => p.userId === currentUserId)!.lastReadAt!;
            const count = conversation.messages.filter(msg => msg.createdAt >= lastReadAt).length;

            return {
                id: conversation.id,
                participants: conversation.participants.map(p => p.userId),
                lastMessage: conversation.messages[0] ? {
                    text: conversation.messages[0].text,
                    senderId: conversation.messages[0].senderId,
                    createdAt: conversation.messages[0].createdAt,
                } : null,
                unreadCount: count,
            };
        }), 
}


