# RAG-Refine

B2B SaaS platform that converts messy documents (PDFs, web docs) into LLM-optimized Markdown for RAG systems. Solves the "Garbage In, Garbage Out" problem by providing high-fidelity ETL with structural integrity, noise filtering, and semantic optimization.

**Status:** Early MVP — auth and landing page built; dashboard, file processing, and payments are planned.

See `PROJECT_CONTEXT.md` for full business context, domain entities, and development constraints.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS 4 (theme tokens in `app/globals.css`) |
| Animation | Motion (Framer Motion v12) via `motion/react` |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| Auth | Supabase Auth (email/password; OAuth-ready) |
| Supabase SDK | `@supabase/ssr` (server/client split) |
| Planned | Stripe (payments), FastAPI Python worker (doc processing) |

## Project Structure

```
app/                        Next.js App Router pages and layouts
  (auth)/                   Auth route group (signup, login) — shared dark layout
  components/ui/            Shared reusable components (Button)
utils/supabase/             Supabase client factories (server.ts, client.ts)
supabase/migrations/        PostgreSQL migrations (accounts, triggers, RLS)
proxy.ts                    Middleware for Supabase session refresh
```

**Path alias:** `@/*` maps to project root (`tsconfig.json`).

## Commands

```bash
npm run dev       # Start dev server
npm run build     # Production build (Webpack, Turbopack disabled)
npm run start     # Start production server
npm run lint      # ESLint
```

No test framework configured yet.

## Key Conventions

- **Server/Client boundary:** Server Actions use `await createClient()` from `utils/supabase/server.ts`. Client Components use `createClient()` from `utils/supabase/client.ts`. Never cross-import.
- **Form handling:** Server Actions return `{ error?, formKey?, fields? }` — never throw. Client uses `useActionState` hook. On success, actions call `redirect()`.
- **Component extraction:** Page-scoped helpers stay in the page file. Extract to `app/components/` only when reused across pages.
- **Color tokens:** Use Tailwind theme tokens (`bg-surface-high`, `text-primary`) — never hardcoded hex. See `app/globals.css:8-27`.
- **Language:** All code, comments, UI strings, and docs must be in English.
- **Database:** RLS enabled on all tables. Users access data only through `account_members` junction. Auto-provisioning via PostgreSQL triggers on signup.

## Database Schema

Two tables in `public` schema (see `supabase/migrations/`):
- `accounts` — id, account_name, avatar_url, plan (default: 'free'), timestamps
- `account_members` — links users to accounts with role (default: 'owner'), unique on (account_id, user_id)

Triggers auto-create account + membership on `auth.users` INSERT.

## MCP Servers

Configured in `.mcp.json`:
- **Supabase** — database operations, migrations, edge functions
- **Next DevTools** — Next.js development utilities

## Adding New Features or Fixing Bugs
**IMPORTANT**: When you work on a new feature or bug, create a git branch first.
Then  work on changes in that branch for the ramainder of the session

## Additional Documentation

Check these files when working on related areas:

| File | When to check |
|------|--------------|
| `.claude/docs/architectural_patterns.md` | Building new features, UI components, or database changes |
| `PROJECT_CONTEXT.md` | Understanding business requirements, domain entities, or constraints |
| `AGENTS.md` | Next.js agent-specific rules |
