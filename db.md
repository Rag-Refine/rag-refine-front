# Database Schema — rag-refine

Schema: `public` | All tables have RLS enabled.

---

## `accounts`

| Coluna | Tipo | Nullable | Default |
|--------|------|----------|---------|
| `id` | `uuid` | — | `gen_random_uuid()` |
| `account_name` | `text` | — | — |
| `avatar_url` | `text` | ✓ | — |
| `plan` | `text` | — | `'free'` |
| `created_at` | `timestamptz` | ✓ | `now()` |
| `updated_at` | `timestamptz` | ✓ | `now()` |

**PK:** `id`

**Referenced by:**
- `account_members.account_id` → `accounts.id`
- `jobs.account_id` → `accounts.id`
- `api_keys.account_id` → `accounts.id`

---

## `account_members`

| Coluna | Tipo | Nullable | Default |
|--------|------|----------|---------|
| `id` | `uuid` | — | `gen_random_uuid()` |
| `account_id` | `uuid` | — | — |
| `user_id` | `uuid` | — | — |
| `role` | `text` | — | `'owner'` |
| `created_at` | `timestamptz` | ✓ | `now()` |

**PK:** `id`

**FKs:**
- `account_id` → `public.accounts.id`
- `user_id` → `auth.users.id`

---

## `jobs`

| Coluna | Tipo | Nullable | Default | Check |
|--------|------|----------|---------|-------|
| `id` | `uuid` | — | `gen_random_uuid()` | — |
| `account_id` | `uuid` | — | — | — |
| `user_id` | `uuid` | — | — | — |
| `file_name` | `text` | — | — | — |
| `file_size` | `bigint` | — | `0` | — |
| `file_type` | `text` | — | `'application/pdf'` | — |
| `storage_path` | `text` | ✓ | — | — |
| `status` | `text` | — | `'pending'` | `pending\|processing\|completed\|failed` |
| `page_count` | `integer` | ✓ | `0` | — |
| `output_markdown` | `text` | ✓ | — | — |
| `error_message` | `text` | ✓ | — | — |
| `created_at` | `timestamptz` | ✓ | `now()` | — |
| `updated_at` | `timestamptz` | ✓ | `now()` | — |

**PK:** `id`

**FKs:**
- `account_id` → `public.accounts.id`
- `user_id` → `auth.users.id`

---

## `api_keys`

| Coluna | Tipo | Nullable | Default |
|--------|------|----------|---------|
| `id` | `uuid` | — | `gen_random_uuid()` |
| `account_id` | `uuid` | — | — |
| `user_id` | `uuid` | — | — |
| `key_display` | `text` | — | — |
| `key_hash` | `text` | — | — |
| `name` | `text` | — | `'Default'` |
| `last_used_at` | `timestamptz` | ✓ | — |
| `created_at` | `timestamptz` | ✓ | `now()` |

**PK:** `id`

**FKs:**
- `account_id` → `public.accounts.id`
- `user_id` → `auth.users.id`

---

## `profiles`

| Coluna | Tipo | Nullable | Default |
|--------|------|----------|---------|
| `id` | `uuid` | — | — |
| `full_name` | `text` | ✓ | — |
| `avatar_url` | `text` | ✓ | — |
| `preferred_language` | `text` | — | `'en'` |
| `created_at` | `timestamptz` | — | `now()` |
| `updated_at` | `timestamptz` | — | `now()` |

**PK:** `id`

**FKs:**
- `id` → `auth.users.id`

---

## `support_tickets`

| Coluna | Tipo | Nullable | Default |
|--------|------|----------|---------|
| `id` | `uuid` | — | `uuid_generate_v4()` |
| `user_id` | `uuid` | — | — |
| `subject` | `text` | — | — |
| `message` | `text` | — | — |
| `status` | `text` | — | `'open'` |
| `created_at` | `timestamptz` | — | `now()` |

**PK:** `id`

**FKs:**
- `user_id` → `auth.users.id`

---

## `waitlist`

| Coluna | Tipo | Nullable | Default |
|--------|------|----------|---------|
| `id` | `uuid` | — | `uuid_generate_v4()` |
| `email` | `text` | — | — (unique) |
| `created_at` | `timestamptz` | ✓ | `now()` |

**PK:** `id`

**FKs:** none
