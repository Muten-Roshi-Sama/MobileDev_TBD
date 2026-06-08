# Project Description & Goals


### **Goal:** 
Build a full-stack, centralized messaging app with authentication and client-server communication using the course stack. Later, the system can be extended toward a trust-minimized or decentralized architecture later.

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
docker compose up -d # at root folder, this will launch web + db production-style
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

Mains dispaly flow :
1. `/web/src/routes/__root.tsx` renders the main document.
    - Header.
    - Body.


3. Dashboard : redirects to /login if no user session exists.





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

### Database, Schemas and Architecture :
- db models with prisma : done
- routers and API functions : done
- hooks (useUser, useMessages, UseConversation)
- Dockerization : can start postrgres db and web directly using docker.
- SOCKETS : make sent messages appear immediately to the recipient.

#### Hooks :
see api functions : `/packages/api/src/routers/chat`
see hooks : `/packages/hooks/hooks.ts`

Hooks use the API functions and centralize them inside useUser, use Message and useConversation.
Those hooks are reused inside web and mobile. 


1. Optimistic updates : example inside `hooks.ts` with useMessage when `const addMessage`.




### Web  :
- database seeding via UI.
- connecting via multiple users and sending messages
- searchbar conv search
- lastread bubble and last message timestamp
- Welcome page with SEO referencing.

#### Dev automated database seeding :
see `/apps/web/src/dev/dev-seed.tsx`
--> Automated database seeding using a simple Prima authClient script.
- Reset and re-generate the database by running `pnpm run db:fresh`

#### Websockets
see api websocket definition :`/packages/api/src/routers/websocket/websocket.ts`
see hooks implementation : `/packages/hooks/websocket`
- starts a websocket server on port 4001 (docker must also expose this port)
- API functions directly implement WS functions to subscribe to sockets so they can be notified when a specifi event happens (message_sent...)
- it is started inside : `/apps/web/src/routes/api/rpc/$.ts`



### Mobile :
- Fully implemented, similar UI as web.
- Websocket, sending messages, conversation id persistence in url..
- Mobile Specific Feature : Can share location inside conversations on the press of a button !

#### Mobile Feature : 
see `/apps/native/utils/location.ts`
- Added `expo-location` inside apps.json within native folder.




--- 

## TODO :  
-  Create New conversation window to add new conversations by searching for users email.
- Create QR-code scanner to add new conversations.



### UI :
- Emojis
- User Avatar/Image
- User Settings
- Share files (pdf, images, videos,... )



