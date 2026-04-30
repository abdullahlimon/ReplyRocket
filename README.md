# ReplyRocket

AI reply assistant for Gmail, Outlook, LinkedIn, Slack, WhatsApp Web, and X. Highlight any message, click a button, get 3 high-quality drafts in your voice.

## Monorepo layout

```
apps/
  web/          Next.js 15 dashboard + API routes
  extension/    Plasmo Chrome extension
packages/
  shared/       Shared TypeScript types + constants
supabase/
  migrations/   SQL migrations (run via Supabase CLI)
```

## Stack

- **Frontend / API:** Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **AI:** Claude 3.5 Sonnet via `@anthropic-ai/sdk`
- **DB + Auth:** Supabase (PostgreSQL + Supabase Auth)
- **Extension:** Plasmo

## Setup

```bash
pnpm install
cp .env.example .env.local         # fill in keys
pnpm dev:web                       # http://localhost:3000
pnpm dev:ext                       # loads unpacked extension into chrome://extensions
```

Run migrations against your Supabase project:

```bash
supabase db push
# or
psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql
```

## Branches

Active dev branch: `claude/build-replyrocket-mvp-kmwhj`
