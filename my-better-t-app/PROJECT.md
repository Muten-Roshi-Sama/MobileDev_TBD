# Project Description & Goals


### **Goal:** 
Build a full-stack, centralized messaging app with authentication and client-server communication using the course stack. Later, the system can be extended toward a trust-minimized or decentralized architecture.



### Features & Requirements :
- Monorepo
- Centralized server at first, open to decentralization later
- Hashed password storage.
- End-to-end encryption



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


### Launch the apps
Launch Web, Native and Websocket server (attached to web) :
```bash
# Option 1. Start db with docker and web/native with pnpm
docker compose up -d postgres
pnpm run dev

# Option 2. Start all with docker (not working for native yet)
docker compose up -d #at root folder
```


### DB :
Reset the db and re-generate prisma schemas :
>> pnpm run db:fresh


### Restart TS server dependencies :
> (Ctrl+Shift+P) : >Typescript:Restart TS Server

### Use Hooks package : 
Install the package in the web and native folder : 
> pnpm add '@my-better-t-app/hooks@workspace:'
> pnpm install


## Web


## Mobile
### Native structure
```bash
apps/native/
├── app/                    # Expo Router routes/screens
├── assets/                 # images/icons/splash assets
├── components/             # reusable UI components
├── contexts/               # React contexts like theme
├── lib/                    # auth/client helpers
├── utils/                  # ORPC client, query client, helpers
├── global.css              # shared styling entry
├── metro.config.js         # Metro + Uniwind config
├── app.json                # Expo app config
├── package.json            # native dependencies/scripts
├── tsconfig.json           # TS config + path aliases
├── polyfills.js            # web/runtime polyfills
└── expo-env.d.ts           # Expo types
```




## DONE :
- db models with prisma are done
- routers are done
- hooks too (useUser, useMessages, UseConversation)

### web ui :
- database seeding via UI (this only for web is enough)
- connecting via multiple users and sending messages
- searchbar conv search
- lastread bubble and last message timestamp


### Mobile :

--- 

## TODO :  
+ add dockerizing of the entire app
+ SOCKETS : make sent messages appear immediately to the recipient.
+ read bubbles etc make all optimistic updates (3 vs)

+ Native app
+ add a unique mobile feature of mobile to the app (gps, camera, ...)


+ Create a welcome page with good referencing and respect preloader and prefetching for good SEO
+ Create New conversation window



### UI :
- Emojis
- User Avatar/Image
- User Settings
- Share files (pdf, images, videos,... )



