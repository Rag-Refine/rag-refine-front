# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project Overview

RAG-Refine is a SaaS platform for converting messy PDFs, tables, and web documents into clean, RAG-ready Markdown and structured formats. Built with Next.js 16 (App Router), React 19, Supabase, and Tailwind CSS v4.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build (forces Webpack, not Turbopack) |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

No test framework is configured yet.

## Architecture

- **Next.js 16 App Router** — routes live in `app/`. Route groups use parenthesized folders (e.g., `(auth)/`).
- **Supabase backend** — auth and database. Two client factories:
  - `utils/supabase/client.ts` — browser-side (`createBrowserClient`)
  - `utils/supabase/server.ts` — server-side (`createServerClient`) with cookie-based sessions
- **Reusable UI components** live in `app/components/ui/`.
- **Animations** use `motion/react` (Framer Motion v12 equivalent). Icons from `lucide-react`.

## Styling

Tailwind CSS v4 with a custom dark-first theme defined inline in `app/globals.css` via `@theme inline`. Key design tokens:

- Surface hierarchy: `surface-lowest` through `surface-highest`
- Primary: blue (`#adc6ff` / `#4d8eff`), Secondary: teal (`#4edea3`)
- Font: Inter for sans, system monospace for mono
- Glass-morphism effects (backdrop blur, transparency) are used throughout

Use existing color tokens (`bg-surface-high`, `text-primary`, etc.) rather than hardcoded colors.

## Environment Variables

Defined in `.env.local` (not committed):
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` — Supabase public anon key

## Domain Context

RAG-Refine solves the "Garbage In, Garbage Out" problem in RAG pipelines. Companies fail at RAG because documents (PDFs, Docs) are converted to messy unstructured text. This tool is a specialized ETL engine that produces LLM-optimized Markdown with structural integrity (tables, headers, lists reconstructed), noise filtering (page numbers, footers removed), and semantic optimization for vector database retrieval.

**Target market:** B2B — developer teams and AI teams (international).

**Core domain entities:**
- `Job` — a single conversion process (`status`, `input_url`, `output_markdown`, `metadata`). Processing is async; UI must handle `pending`, `processing`, `completed`, `failed` states.
- `Credits/Quota` — usage-based billing model (pages processed vs. plan limit).
- `API Key` — programmatic access tokens for external pipeline integrations.

**Processing worker** (FastAPI/Python) is a **separate future project** — do not scaffold or implement worker-side code in this repo. Integration will be added later.

**Security constraint:** All file uploads must be private and scoped to the user's ID in Supabase Storage.

**Language constraint:** All code, comments, variable names, and UI strings must be in **English**.

## Key Conventions

- TypeScript strict mode is enabled.
- Path alias `@/*` maps to the project root.
- Build explicitly disables Turbopack (`NEXT_TURBOPACK=0 NEXT_FORCE_WEBPACK=1`).
- ESLint uses the flat config format (`eslint.config.mjs`) with `core-web-vitals` and `typescript` presets.
