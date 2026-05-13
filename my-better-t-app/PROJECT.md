# Project Description & Goals


### **Goal:** 
Build a full-stack, centralized messaging app with authentication and client-server communication using the course stack. Later, the system can be extended toward a trust-minimized or decentralized architecture.



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



### Backend Model
```
User
 └─ conversations: ConversationParticipant[]

Conversation
 └─ participants: ConversationParticipant[]

ConversationParticipant
 ├─ userId
 ├─ conversationId
```
User HAS conversations.
Conversations HAS participants.
Participants HAS Users



## Setup :

### Start db :
>> pnpm run db:start
>> pnpm run db:push
>> pnpm run db:generate

### Prisma DB push reset :
Make sure to be in the correct `/db` folder :
>> npx prisma db push --force-reset

### Launch app :
>> pnpm run dev



### Restart TS server dependencies :
> (Ctrl+Shift+P) : >Typescript:Restart TS Server

### Use Hooks package : 
Install the package in the web and native folder : 
> pnpm add '@my-better-t-app/hooks@workspace:'
> pnpm install



## DONE :
- db models with prisma are done
- routers are done
- hooks too (useUser, useMessages, UseConversation)


### web ui :
- database seeding via UI (this only for web is enough)
- connecting via multiple users and sending messages
- searchbar conv search
- lastread bubble and last message timestamp






## TODO :  
- add dockerizing of the entire app
- SOCKETS : make sent messages appear immediately to the recipient.
- read bubbles etc make all optimistic updates 
- Prisma script seeding
- Create New conversation window
- Create a welcome page with good referencing and respect preloader and prefetching for good SEO
- do expo/native/mobile version of app
- add a unique mobile feature of mobile to the app (gps, camera, ...)





### UI :
- Emojis
- User Avatar/Image
- User Settings
- Share files (pdf, images, videos,... )



