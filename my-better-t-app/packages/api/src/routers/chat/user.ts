import prisma from "@my-better-t-app/db";
import z from "zod";

import { publicProcedure } from "../../index";
import { get } from "http";




export const userRouter = {
    /**
     * getCurrentUserInfo : get current user info (id, name, email, image, createdAt, updatedAt)
     * search({ query: string }) : search users by name or email
     */

    // Extract currently logged in user info (id, name, email, image, createdAt, updatedAt)
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

    // Search users by name or email (case insensitive, partial match), excluding current user
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


    // Fetch batch of users by ids (for conversation participants info, etc.)
    getUsersByIds : publicProcedure
        .input(z.object({ ids: z.array((z.string()) )})) //! USERS LISTS !
        .handler( async ({ input, context }) => {
            // Auth
            const currentUserId = context.session?.user.id;
            if (!currentUserId) {throw new Error("Not authenticated");}
            // Prism query
            const users = await prisma.user.findMany({
                where: { id: {in : input.ids} },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            return users;
        }),


    // TODO: bad for performance
    getAll : publicProcedure
        .handler( async ({ context }) => {
            // Auth
            const currentUserId = context.session?.user.id;
            if (!currentUserId) {throw new Error("Not authenticated");}
            // Prism query
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            return users;
            // optionally exclude current user if you want
            // return users.filter(u => u.id !== currentUserId);
        }),

}





