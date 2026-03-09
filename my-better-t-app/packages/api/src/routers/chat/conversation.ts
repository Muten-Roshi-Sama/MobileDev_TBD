import prisma from "@my-better-t-app/db";
import { TRPCError } from "@trpc/server";
import z from "zod";

import { protectedProcedure } from "../../index";

// Important :
    // - Avoid duplicate conversations between 2 users. (check if a conversation with same participants already exists before creating a new one.)
    // - DELETE logic : conversation deletion should be soft delete (mark as deletedAt, archived) to avoid breaking message history for other participants. Only hard delete when all participants have deleted the conversation.
    // - Metadata : track edited messages, deleted messages, reactions, attachements...
    // - Performance : optimize getLastmessage, unreadCount, loading of other participants info

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


    // Find all Conversations where current user is a participant.
    //      - includes last message (for sidebar display), and 
    //      - compute unread count based on lastReadAt of participant and messages createdAt.
    //      - TODO : fix unreadcount computation (currently is boolean ?)
    listAll : protectedProcedure
        .handler( async ({ context }) => {
            const currentUserId = context.session?.user.id;
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


    // Create new conversation using the provided userIds list. 
    //      - (Adds current user id automatically,
    //      - TODO : avoids duplicate convos between same users)
    create : protectedProcedure
        .input(z.object({ userIds: z.array(z.string()).min(1) }))
        .handler( async ({ input, context }) => {
            // 1. check if authenticated
            const currentUserId = context.session?.user.id;

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



    // Mark conversation as read for current user (update lastReadAt to now)
    //     - TODO : validation that conversation exists
    //     - TODO : validation that user is a participant
    
    markRead : protectedProcedure
        .input(z.object({ conversationId: z.string() }))
        .handler( async ({ input, context }) => {
            // 1. check if authenticated
            const currentUserId = context.session?.user.id;
            // if (!currentUserId) {throw new Error("Not authenticated");}

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



    // Find conversation by id, including participants, last message and unread count for current user.
    //     - TODO : validation that conversation exists
    //     - TODO : validation that user is a participant
    getById : protectedProcedure
        .input(z.object({ id: z.string() }))
        .handler( async ({ input, context }) => {
            // 1. check if authenticated
            const currentUserId = context.session?.user.id;
            // if (!currentUserId) {throw new Error("Not authenticated");}

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

// --- Helpers -----
async function ensureParticipant(prismaClient: typeof prisma, conversationId: string, userId: string) {
    const isParticipant = await prismaClient.conversationParticipant.findFirst({
        where: { conversationId, userId },
    });

    if (!isParticipant) {
        throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Not a participant of the conversation.',
        });
    }
}
