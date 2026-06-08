# Assessment (Web)
## User Experience /2
- Appearance : dark mode, coherent color-scheme, badges, profile pictures...
- Mobile-first, responsive design* : ?
- Reloading keeps the state as much as possible : cid state stored in the URL, keep user logged in
- Interactive* : Search, conversation selection, message sending, mark-as-read, websocket updates, and dev seed buttons on the home page


## Project scope and complexity /4

## Data fetching /4
- Race conditions : mainly handled by React Query and built-in cache
- Loading state and errors boundaries : ?
- Caching, deduping, and invalidation : automated invalidation in orpc.ts, invalidation on websocket events too.
- Optimistic updates when appropriate : `hooks.ts` useMessage(temp message with onMutate), useConversations (createConv and markAsRead)


## Code quality and DX /4
- Client/server communications are typesafe* : types inferred from prisma, same everywhere.
- Queries to the DB should be typesafe : Prisma types and zod validation.
- Codebase is type safe : 
- Use consistent conventions : good separation between db, hooks, web and app.
- Good use of the Component architecture : main function is broken down (ChatLayout, SideBar...) and easily readable
- Good use of React hooks : useUser, useMessages, useConversations, and useConversationStream are doing the heavy lifting


## Deployment /2
- The database can run via Docker or equivalent : yes with postgresql
- Web server runs via Docker or equivalent* : to fix
- Basic orchestration (e.g. via docker-compose) : to fix
- Serves a production bundle : to do (add native too)


## Security /2
- Authentication : APi functions requires user to be authenticated. dashboard redirect unauth users,
- Client/Server communications are validated* : zod validation used in routers.
- Authenticated routes and API are protected* : API function have auth check and WebSocket auth check the session before allowing a connection.
- Secrets are not exposed : .env based configs, passwords are hashed in db.


## SEO /2
- Crucial pages can be rendered on the server* : welcome page is static and SSR-ready through TanStack Start/root document
- Crucial data present on first render : //
- Less crucial data is deferred : app mostly defers chat and user data to client fetches, which is acceptable for a messaging app.
- Waterfalls are avoided : todo add some preloading ? (dashboard preloads session before UI appears)



---

# Assessment (Mobile)


## User Experience /2
- Appearance : Dark-mode, clean component separation (ChatLayout, ChatWindow, ConversationList), Native UI components
- Mobile-first, responsive design* : web-style split-view but adapted for mobile.
- Interactive* : Message sending with optimistic updates, WebSocket updates, Conversation URL params (cid), Search + mark-as-read + conversation selection, Location sharing feature.

## Project scope and complexity /4
- Full messaging system
- WebSocket integration
- Optimistic updates
- Conversation system
- Search system
- Cross-platform shared hooks (web + mobile)
- Location-based message feature



## Data fetching /4
- Race conditions : React Query handles most of it well, WebSocket + query sync is good
- Loading state and errors boundaries : conditional rendering (messages.length > 0), isLoading flags in hooks
- Caching, deduping, and invalidation : React Query caching, ORPC-driven query keys, Auto invalidation system, WebSocket updates complement cache
- Optimistic updates when appropriate : (+rollback) useMessages.onMutate temporary message, useConversations.createConversation optimistic insert, markAsRead optimistic unread reset


## Code quality and DX /4
- Client/server communications are typesafe* : Strong ORPC integration, Prisma types + zod validation, Shared hooks between web/mobile
- Codebase is type safe : typed hooks, typed query inputs, shared API layer, zod validation
- Use consistent conventions : hooks centralized, UI split into components, consistent ORPC usage, consistent query pattern
- Good use of the Component architecture : good component segregation : ChatLayout, SideBar, ChatWindow, ...
- Good use of React hooks : useUser, useMessages, useConversations, useConversationStream


## Security /2
- Authentication : ORPC authenticated calls, WebSocket auth handshake, protected routes logic implied
- Client/Server communications are validated* : Zod validation via ORPC
- Authenticated routes and API are protected* : auth across hooks and WS
- Secrets are not exposed : env usage, no client leakage


## Mobile feature /4
`Location sharing feature`

What's implemented:
- Expo Location API
- Permission handling (for location access).
- Google Maps link generation
- Integration into message system via same send() pipeline




