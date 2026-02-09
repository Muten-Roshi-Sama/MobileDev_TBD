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

    search : publicProcedure
        .input(z.object({ text: z.string() }))
        .handler( async ({ input, context }) => {
            const currentUserId = context.session?.user.id;
            if (!currentUserId) {throw new Error("Not authenticated");}
            const users = await prisma.user.findMany({
                where: {
                    OR: [
                        { name: { contains: input.text, mode: "insensitive" } },
                        { email: { contains: input.text, mode: "insensitive" } },
                    ]
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    createdAt: true,
                    updatedAt: true,
                },
                take: 10, // Limit results
            });
            return users;
        }),


}





