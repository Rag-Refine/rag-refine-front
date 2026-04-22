This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Supabase Migrations

Migration files live in `supabase/migrations/`. The CLI reads them in filename order and tracks what has been applied in the remote `supabase_migrations.schema_migrations` table.

```bash
# One-time: log in and link the local repo to the remote project
npx supabase login
npx supabase link --project-ref <project-ref>

# Day-to-day
npx supabase migration list                          # diff local vs remote
npx supabase migration new <name>                    # scaffold a new migration
npx supabase db push                                  # apply pending migrations to the linked remote
npx supabase db push --include-all                    # re-check and push every local migration
npx supabase db reset                                  # wipe + replay all migrations on the local stack
```

> Running `db push` targets the **linked remote** project. Double-check `supabase projects list` (the linked row is marked with `●`) before pushing so you don't apply migrations to the wrong environment.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
