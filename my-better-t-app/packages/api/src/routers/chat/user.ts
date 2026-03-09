import prisma from "@my-better-t-app/db";
import z from "zod";

import { protectedProcedure } from "../../index";
// import { get } from "http";


// Important : 
//      - protectedProcedure : auto handles auth checks

export const userRouter = {
    /**
     * getCurrentUserInfo : get current user info (id, name, email, image, createdAt, updatedAt)
     * search({ query: string }) : search users by name or email
     */



    // Extract currently logged in user info (id, name, email, image, createdAt, updatedAt)
    current: protectedProcedure
        .handler(async ({ context }) => {
            // Get current user info (id, name, email, image, createdAt, updatedAt)
            const currentUserId = context.session?.user.id;
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
    search : protectedProcedure
        .input(z.object({ text: z.string() }))
        .handler( async ({ input }) => {
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
    search_batch : protectedProcedure
        .input(z.object({ ids: z.array((z.string()) )})) //! USERS LISTS !
        .handler( async ({ input }) => {
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
    getAll : protectedProcedure
        .handler( async ({ }) => {
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





