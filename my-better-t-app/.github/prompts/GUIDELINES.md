
```md
---
description: "Read-only mode: the AI can only read files, never edit or run anything."

tools:
  - search/readFile
  - search/fileSearch
  - runNotebooks/getNotebookSummary
  - runNotebooks/readNotebookCellOutput
---

# 🧠 Project Context (Messaging App)

## ⚠️ Rules
- Read-only: NEVER edit or run anything
- Only suggest code snippets / diffs
- Keep answers short and precise
- Respect architecture (no shortcuts)

---

# 📦 Tech Stack

- Monorepo: Turborepo + pnpm
- Web: TanStack Start
- Native: Expo + Unistyles
- Backend: TanStack Start (fullstack)
- API: oRPC
- DB: PostgreSQL (Docker)
- ORM: Prisma
- Auth: better-auth

---

# 🧱 Architecture

```

UI (React)
↓
Hooks (React Query + oRPC client)
↓
API (oRPC routers)
↓
Prisma (DB)

```

## Rules
- UI → hooks only
- Hooks → data fetching + mapping + optimistic updates
- API → business logic ONLY
- Prisma → persistence ONLY

❌ Never use hooks outside React  
❌ Never use oRPC client in backend/seed  
❌ Never map data inside API  

---

# 📁 Folder Structure (simplified)

```

apps/
web/        → frontend (TanStack Start) (main file : apps/web/src/routes/messaging.tsx)
native/     → Expo app (not implemented yet. Discard for now)


packages/
db/         → Prisma schema + client
hooks/      → shared React hooks
src/routers/chat → API (oRPC routers)

````

---

# 🗄️ Core Models (Prisma)
Read files at /packages/db/prisma/schema for all schemas.
## Conversation
```ts
id, createdAt, updatedAt
participants[]
messages[]
````

## ConversationParticipant

```ts
cid, userId
lastReadAt, joinedAt
@@id([cid, userId])
```

## Message

```ts
id, cid, senderId, text
createdAt, updatedAt
editedAt?, deletedAt?
type ("text")
```

---

# 🧠 Key Logic

## Unread messages

Computed ONLY (never stored):

```
message.createdAt > participant.lastReadAt
```


---

# ⚙️ Hooks Responsibilities

## useConversations

* compute:

  * lastMessage
  * unreadCount

## useMessages

* fetch messages
* optimistic updates
* filter `deletedAt`
* handle pagination

---

# 🔄 Pagination

Backend:

```
take: limit + 1
cursor: id
skip: 1
```

Frontend:

* store `cursor`
* fetch next batch
* append messages

# 🎯 Goal

Build a centralized messaging system (MVP first), later extendable to decentralized + E2E encryption.

---

# END

```

