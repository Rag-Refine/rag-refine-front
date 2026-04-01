# RAG-Refine

B2B SaaS platform that converts messy documents (PDFs, web docs) into LLM-optimized Markdown for RAG systems. Solves the "Garbage In, Garbage Out" problem by providing high-fidelity ETL with structural integrity, noise filtering, and semantic optimization.

**Status:** Active development — auth, landing page, dashboard, file upload, job history, API key management, settings, and support are built; Python processing engine integration is in progress; payments are planned.

See `PROJECT_CONTEXT.md` for full business context, domain entities, and development constraints.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.1 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS 4 (theme tokens in `app/globals.css`) |
| Animation | Motion (Framer Motion v12) via `motion/react` |
| Database | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Auth | Supabase Auth (email/password; OAuth-ready) |
| Supabase SDK | `@supabase/ssr` (server/client split) |
| i18n | next-intl (`messages/en.ts`, `i18n/request.ts`) |
| Toasts | sonner (`toast.success()`, `toast.error()`) |
| In progress | FastAPI Python worker (doc processing, `feat/python-engine-integration`) |
| Planned | Stripe (payments) |

## Project Structure

```
app/
  (auth)/                     Auth route group — shared dark layout
    login/                    Login page + server action
    signup/                   Signup page + server action
  (dashboard)/                Protected route group — sidebar + header layout
    layout.tsx                Sidebar + header shell
    dashboard/                Main dashboard
      page.tsx                File upload, recent activity, API key widget
      actions.ts              Server actions: upload, delete, API key CRUD
      api-keys/               API key management page
      history/                Job history with real-time updates
      settings/               Profile, preferences, account deletion
      support/                Contact form + FAQ
    jobs/[id]/                Job detail — side-by-side PDF viewer + markdown output
  components/
    dashboard/                header.tsx, sidebar.tsx, file-dropzone.tsx,
                              recent-activity-table.tsx, sidebar-history.tsx,
                              api-key-card.tsx
    ui/                       button.tsx, badge.tsx, modal.tsx, usage-bar.tsx
  globals.css                 Tailwind theme tokens
  layout.tsx                  Root layout (next-intl, metadata)
  page.tsx                    Landing page
utils/
  hash.ts                     SHA-256 hashing via Web Crypto API (browser + Node 18+)
  supabase/
    server.ts                 Async server client (`createServerClient`)
    client.ts                 Browser client (`createBrowserClient`)
supabase/migrations/          8 migration files (see Database Schema)
messages/en.ts                All i18n strings
i18n/request.ts               next-intl middleware config
proxy.ts                      Session refresh middleware
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

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Supabase anon key |
| `PDF_ENGINE_URL` | Python FastAPI engine URL (defaults to `http://localhost:8000`) |

## Key Conventions

- **Server/Client boundary:** Server Actions use `await createClient()` from `utils/supabase/server.ts`. Client Components use `createClient()` from `utils/supabase/client.ts`. Never cross-import.
- **Form handling:** Server Actions return `{ error?, formKey?, fields? }` — never throw. Client uses `useActionState` hook. On success, actions call `redirect()`.
- **Component extraction:** Page-scoped helpers stay in the page file. Extract to `app/components/` only when reused across pages.
- **Color tokens:** Use Tailwind theme tokens (`bg-surface-high`, `text-primary`) — never hardcoded hex. See `app/globals.css:8-27`.
- **i18n:** All UI strings live in `messages/en.ts`. Access via `useTranslations()` in Client Components and `getTranslations()` in Server Components/Actions. Never hardcode visible strings.
- **Toasts:** Use sonner for user feedback in Client Components — `toast.success()` for success, `toast.error()` for failures.
- **File deduplication:** SHA-256 hash computed in the browser via `utils/hash.ts` before upload. Server checks for an existing completed job with the same hash and skips re-processing if found.
- **Real-time:** Supabase Realtime subscriptions via `supabase.channel()` for live job status updates (see `sidebar-history.tsx`).
- **Storage paths:** Files stored at `{account_id}/{job_id}.pdf` in the private `user_uploads` bucket (50 MB limit, PDF only).
- **API key format:** `rr_live_` prefix + 32 random hex bytes. Only the hash is stored in the database; the UI displays `rr_live_xxxx...xxxx`.
- **Database:** RLS enabled on all tables. Users access data only through `account_members` junction. Auto-provisioning via PostgreSQL triggers on signup.
- **Language:** All code, comments, UI strings, and docs must be in English.

## Database Schema

Six tables in `public` schema (see `supabase/migrations/`):

- `accounts` — id, account_name, avatar_url, plan (`free`/`pro`), timestamps
- `account_members` — account_id, user_id, role (`owner`); unique on (account_id, user_id)
- `jobs` — id, account_id, user_id, file_name, file_type, file_size, status (`pending`/`processing`/`completed`/`failed`), file_hash, storage_path, page_count, output_markdown, error_message, timestamps
- `api_keys` — id, user_id, account_id, name, key_hash, key_display, last_used_at, created_at
- `profiles` — id (→ auth.users), full_name, avatar_url, preferred_language, timestamps
- `support_tickets` — id, user_id, subject, message, status (`open`), created_at

Storage bucket: `user_uploads` (private, 50 MB limit, PDF only). Triggers auto-create account + membership + profile on `auth.users` INSERT.

## MCP Servers

Configured in `.mcp.json`:
- **Supabase** — database operations, migrations, edge functions

## Adding New Features or Fixing Bugs

**IMPORTANT**: When you work on a new feature or bug, create a git branch first.
Then work on changes in that branch for the remainder of the session.

## Additional Documentation

Check these files when working on related areas:

| File | When to check |
|------|--------------|
| `.claude/docs/architectural_patterns.md` | Building new features, UI components, or database changes |
| `PROJECT_CONTEXT.md` | Understanding business requirements, domain entities, or constraints |
| `AGENTS.md` | Next.js agent-specific rules |
