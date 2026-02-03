# Project Description & Goals


### **Goal:** 
Build a full-stack, centralized messaging app with authentication and client-server communication using the course stack. Later, the system can be extended toward a trust-minimized or decentralized architecture.

### Backend :
- handles user auth (better-auth)
- store users and messages in postgreSQL via Prisma
- Validate inputs via Zod.
- Expose API endpoints via oRPC :
	- login(email, password)
	- signup(email, password)
	- sendMsg(senderId, recipientId, payload, metadata)
	- fetchMsg(userId)

- Database schema example :
```prisma
model User {
  id       String @id @default(cuid())
  email    String @unique
  password String
  createdAt DateTime @default(now())
}

model Message {
  id         String   @id @default(cuid())
  senderId   String
  recipientId String
  text       String
  createdAt  DateTime @default(now())
}
```


### Frontend (Web  + mobile) :
- Login/signup forms
- UI to see and send messages.
- need to be instant.


### Features & Requirements :
- Monorepo
- MVP prioritized, basic UI at first
- Centralized server at first, open to decentralization later
- Hashed password storage.
- End-to-end encryption (last priority)



### Tech Stack :
Web Frontend : Tanstack start
Native Frontend : Expo + unwind
Backend : Fullstack TanStack Start
Runtime : None
API : oRPC
Database : PostgreSQL
ORM : Prisma
DB Setup : Docker
Web Deploy : None
Auth : better-auth
Payments : None
Package Manager : pnpm
Addons : turborepo, Ruler
