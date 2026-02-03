# Copilot Instructions for my-better-t-app

⚠️ Important: Do not directly modify any files. Always provide small, clear code snippets showing exactly what to change/add and where, instead of making edits.

## Project Overview
- **Monorepo** using Turborepo and pnpm workspaces.
- Built with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack):
  - Web: React + TanStack Start (SSR, routing)
  - Mobile: React Native + Expo
  - API: oRPC (type-safe, contract-driven)
  - Database: PostgreSQL via Prisma
  - Auth: better-auth
- All code is TypeScript-first and type sharing is encouraged across packages.

## Key Directories
- `apps/web/`: Web app (SSR, TanStack Start, main entrypoint)
- `apps/native/`: Mobile app (Expo, React Native)
- `packages/api/`: oRPC routers, API contracts, shared business logic
- `packages/auth/`: Auth config and logic
- `packages/db/`: Prisma schema, DB utilities
- `.ruler/PROJECT.md`: Project goals, requirements, and architecture (always reference for context)

## Developer Workflows
- **Install:** `pnpm install` (from repo root)
- **Dev servers:** `pnpm run dev` (all), `pnpm run dev:web`, `pnpm run dev:native`
- **Database:**
  - Edit schema in `packages/db/prisma/schema/`
  - Push: `pnpm run db:push`
  - Studio: `pnpm run db:studio`
- **Type safety:** Types are shared between API and clients via packages.
- **Auth:** Config in `packages/auth/`, client in each app's `lib/auth-client.ts`.

## Project Conventions
- Use oRPC for all client-server communication (no REST/GraphQL).
- Validate all API inputs with Zod.
- Store secrets and DB config in `.env` files (never commit to git).
- Keep UI basic for MVP; prioritize functionality.
- Passwords must be hashed before storage.
- End-to-end encryption is planned but not yet implemented.

## Integration Patterns
- Web and native apps both consume oRPC APIs from `packages/api/`.
- Auth logic is shared but each app has its own client wrapper.
- Database access is only from the API layer (never directly from apps).

## Examples
- See `packages/api/src/routers/` for API endpoint patterns.
- See `apps/web/src/routes/` and `apps/native/app/` for UI and data flow.

## Reference
- For project goals, always check `.ruler/PROJECT.md`.
- For rules and scripts, see `.ruler/bts.md`.

---

If you are unsure about a workflow or pattern, reference the files above or ask for clarification in your PR/issue.
