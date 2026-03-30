// prisma/seed.ts
import type { Prisma } from './generated/client';


// do not use hooks, use orpc instead
// import { useUser,useMessages, useConversations } from '@my-better-t-app/hooks'; 

// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { orpc, queryClient } from "../../apps/web/src/utils/orpc";


import prisma from '../src/index'
import { auth } from '@my-better-t-app/auth'
import { createRouterClient } from "@orpc/server"
import { appRouter } from "../../api/src/routers/index"



const api = createRouterClient(appRouter, {
  context: async () => ({
    session: {
      session: {
        id: 'seed-session-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'u1',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
        token: 'seed-token',
      },
      user: {
        id: 'u1',
        name: 'Alice',
        email: 'alice@example.com',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }
  })
})


// Create user with Better-Auth API (handles password hashing automatically)
await auth.api.signUpEmail({
  body: {
    email: 'alice@example.com',
    password: 'password123',
    name: 'Alice',
  }
})




await user.create
await api.conversation.create({ userIds: ['u2', 'u3'] })
await api.message.send({ conversationId: 'c1', text: 'Hello' })






















//! DIRECT prisma calls
// import prisma from '../src/index'

// // CREATE CONVERSATION
// await prisma.conversation.create({
//   data: {
//     participants: {
//       create: [
//         { userId: 'u1' },
//         { userId: 'u2' }
//       ]
//     }
//   }
// })

// // SEND MESSAGE
// await prisma.message.create({
//   data: {
//     conversationId: 'conv-id',
//     senderId: 'u1',
//     text: 'Hello',
//     type: 'text'
//   }
// })


