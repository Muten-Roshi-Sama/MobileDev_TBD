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
- Crucial pages can be rendered on the server* :  todo SSR on welcome page
- Crucial data present on first render : //
- Less crucial data is deferred : app mostly defers chat and user data to client fetches, which is acceptable for a messaging app.
- Waterfalls are avoided : todo add some preloading ?



---

# Assessment (Mobile)





