import prisma from "@my-better-t-app/db";
import z from "zod";
// import { TRPCError } from "@trpc/server";

import { publicProcedure } from "../../index";


// Important :
//      - Check if user is authenticated in every procedure, 
//      - Validate that user is a participant of the conversation before sending or listing messages
//      - 
//      TODO : use TRPCError with proper error codes instead of generic Errors.


const sendErrorMsg = "Forbidden: Not a participant of the conversation. Cannot send message, create conversation first.";
const listErrorMsg = "Forbidden: Not a participant of the conversation. Cannot list messages, join conversation first.";



export const messageRouter = {
    /**
     * message.send({ conversationId, text }) : send message in conversation
     * message.list({ conversationId, cursor?, limit?} ) : list messages in conversation with pagination
     * 
     */


    // ====== Send message ======
    //      1. check if authenticated
    //      2. check if user is participant of conversation
    //      3. Create message in db AND update conversation's updatedAt to now (in a transaction for atomicity)
    send: publicProcedure
        .input(z.object({ conversationId: z.string(), text: z.string().min(1) }))
        .handler(async ({ input, context }) => {
            // 1. check if authenticated
            const senderId = context.session?.user.id;
            if (!senderId) {throw new Error("Not authenticated");}

            // 2. check if user is participant of conversation
            const isParticipant = await prisma.conversationParticipant.findUnique({
                where: {
                    conversationId_userId: {
                        conversationId: input.conversationId, 
                        userId : senderId
                    }
                }
            });
            if (!isParticipant) {throw new Error(sendErrorMsg);}

            // 2. Create message in db AND update conversation's updatedAt to now (in a transaction for atomicity)
            const [message] = await prisma.$transaction([
                prisma.message.create({
                    data: {
                        conversationId: input.conversationId,
                        senderId,
                        text: input.text,
                    },
                }),
                
                // Update conversation's updatedAt to now
                prisma.conversation.update({
                    where: { id: input.conversationId },
                    data: { updatedAt: new Date() },
                }),
            ]);

            return message;
        }),


    // ====== List messages in conversation with pagination ======
    //      1. check if authenticated
    //      2. check if user is participant of conversation
    //      3. Fetch messages with pagination (cursor-based)
    list: publicProcedure
        .input(z.object({ 
            conversationId: z.string(), 
            cursor: z.string().nullish(), 
            limit: z.number().min(1).max(100).default(20) 
        }))
        .handler(async ({ input, context }) => {
            // 1. check if authenticated
            const currentUserId = context.session?.user.id;
            if (!currentUserId) {throw new Error("Not authenticated");}

            // 2. check if user is participant of conversation
            const isParticipant = await prisma.conversationParticipant.findUnique({
                where: {
                    conversationId_userId: {
                        conversationId: input.conversationId, 
                        userId : currentUserId
                    }
                }
            });
            if (!isParticipant) {throw new Error(listErrorMsg);}


            // 3. Fetch messages with pagination
            const messages = await prisma.message.findMany({
                where: { conversationId: input.conversationId },
                orderBy: { createdAt: "desc" },
                take: input.limit + 1, // fetch one extra to check if there's a next page
                cursor: input.cursor ? { id: input.cursor } : undefined,
                skip: input.cursor ? 1 : 0, // skip the cursor itself
            });

            // 4. Prepare next cursor
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






// End