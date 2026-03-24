# Architectural Patterns

Patterns observed across the codebase. Follow these when building new features.

## 1. Supabase Client Factory Split

Two separate client factories enforce the server/client boundary:

- **Server-side** (`utils/supabase/server.ts`): Async factory using `createServerClient` from `@supabase/ssr`. Reads/writes cookies via `next/headers`. Used in Server Actions and Server Components.
- **Browser-side** (`utils/supabase/client.ts`): Synchronous factory using `createBrowserClient`. Used in Client Components.
- **Middleware** (`proxy.ts`): Third instantiation for middleware context — bridges request/response cookies and calls `supabase.auth.getUser()` to refresh sessions.

**Rule:** Always `await createClient()` on server. Never import the server factory in a `"use client"` file.

## 2. Server Actions with useActionState

Auth forms use React 19's `useActionState` to bridge Server Actions and client UI:

1. Server Action exports a state type and async handler — see `app/(auth)/signup/actions.ts:6-14`
2. Handler returns `{ error?, formKey?, fields? }` — never throws
3. Client calls `useActionState(action, {})` for `[state, formAction, pending]` — see `app/(auth)/signup/page.tsx:10`
4. `formKey` (timestamp) resets `<form key={}>` on error; field values preserved via `defaultValue={state.fields?.x}`
5. On success, the action calls `redirect()` — does not return state

**Rule:** Validation happens server-side. Errors returned in state, not thrown.

## 3. Glass-Morphism UI Pattern

Reusable translucent panel style applied inline:

```
bg-surface-lowest/60 backdrop-blur-xl border border-white/5 rounded-2xl
```

See `app/page.tsx:8-10` (`GlassPanel`). Used for cards, panels, and overlays. Combines surface color tokens with backdrop blur and subtle borders.

## 4. Motion Animation Conventions

All animations use `motion/react` (Framer Motion v12). Three recurring patterns:

- **Entry:** `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}` — see `app/page.tsx:53-56`
- **Scroll-triggered:** `whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}` — see `app/page.tsx:168-172`
- **Interactive:** `whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}` — see `app/components/ui/button.tsx:31-32`

**Rule:** Always set `viewport={{ once: true }}` on scroll-triggered animations to prevent re-triggering.

## 5. Page-Scoped Helper Components

Single-use UI components are defined as plain functions at the bottom of the page file:

- `SocialButton`, `InputField`, `Separator`, `GoogleGlyph` — `app/(auth)/signup/page.tsx:120-182`
- `GlassPanel` — `app/page.tsx:8-10`

**Rule:** Extract to `app/components/` only when reused across multiple pages.

## 6. Route Group Layouts

Auth pages live under `app/(auth)/` with a shared layout (`app/(auth)/layout.tsx:3-12`) providing dark background with radial gradient overlays and centered content. The parenthesized folder is a Next.js route group — does not affect URL.

## 7. Database Auto-Provisioning via Triggers

User sign-up auto-creates account and membership via PostgreSQL triggers:

- `handle_new_user()` — `supabase/migrations/20260323220001_create_triggers.sql:19-46`: On `auth.users` INSERT, creates `accounts` row and links user as `owner` in `account_members`
- `handle_updated_at()` — `supabase/migrations/20260323220001_create_triggers.sql:2-16`: Auto-updates `accounts.updated_at` on every UPDATE

All tables have RLS enabled (`supabase/migrations/20260323220002_create_rls_policies.sql`). Data access scoped through `account_members` junction table.

## 8. Button Variant System

`app/components/ui/button.tsx:18-26` defines three variants:

- `primary` — gradient background for CTAs
- `secondary` — surface background with border
- `ghost` — transparent for navigation

Conditionally wraps in `<Link>` when `href` is provided (`button.tsx:41`), making it dual-purpose for navigation and form submission.

## 9. Color Token System

Tailwind theme tokens defined in `app/globals.css` via `@theme inline`:

- **Surface hierarchy:** `surface-lowest` → `surface-low` → `surface-container` → `surface-high` → `surface-highest`
- **Text:** `on-surface` (primary), `on-surface-variant` (secondary)
- **Accent:** `primary` (blue), `secondary` (teal), `error` (red)

**Rule:** Use token names (`bg-surface-high`, `text-primary`) — never hardcoded hex values.
