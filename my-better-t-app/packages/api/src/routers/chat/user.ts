import prisma from "@my-better-t-app/db";
import z from "zod";

import { publicProcedure } from "../../index";




export const userRouter = {
    /**
     * getCurrentUserInfo : get current user info (id, name, email, image, createdAt, updatedAt)
     * search({ query: string }) : search users by name or email
     */

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
}


export const conversationRouter = {
    /**
     * 1. List all conversations for sidebar.
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


}

export const messageRouter = {
    /**
     * message.send({ conversationId, text }) : send message in conversation
     * message.list({ conversationId, cursor?, limit?} ) : list messages in conversation with pagination
     * 
     */




}

