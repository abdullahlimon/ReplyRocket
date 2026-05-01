# ReplyRocket

AI reply assistant for Gmail, Outlook, LinkedIn, Slack, WhatsApp Web, and X.
Highlight any message, click a button, get 3 high-quality drafts in your voice.

## Monorepo layout

```
apps/
  web/          Next.js 15 dashboard + API routes
  extension/    Plasmo Chrome extension (MV3)
packages/
  shared/       TypeScript types + constants used by both
supabase/
  migrations/   SQL migrations
```

## Stack

- **Frontend / API:** Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **AI:** Claude 3.5 Sonnet via `@anthropic-ai/sdk`
- **DB + Auth:** Supabase (PostgreSQL + Supabase Auth, RLS on every table)
- **Extension:** Plasmo, Chrome MV3, single content-script scoped to the 6 platforms

## What's built

### Web (`apps/web`)
- Landing page, pricing, privacy, terms
- Login (Google OAuth + magic link via Supabase)
- 3-step onboarding flow that captures voice samples and runs `/api/voice/rebuild`
- Dashboard, history list + detail, settings, voice management
- Extension auth bridge at `/auth/extension` issuing long-lived bearer tokens

### API (`apps/web/app/api`)
| Route | Purpose |
|---|---|
| `POST /api/generate` | Claude generation, quota enforcement, persists `replies` + `usage_events` |
| `GET /api/me` | Profile, settings, voice profile |
| `PATCH /api/settings` | Update defaults |
| `GET /api/replies` | Paginated history |
| `GET /api/replies/[id]` | Single reply |
| `POST /api/replies/[id]/select` | Mark inserted draft + feed edited text into voice samples |
| `POST /api/replies/[id]/feedback` | Thumbs up/down |
| `GET /api/voice` | Voice profile + samples |
| `POST /api/voice/samples` | Add samples |
| `POST /api/voice/rebuild` | Re-extract voice profile from latest samples |
| `POST /api/auth/extension` | Issue bearer token for extension |
| `DELETE /api/auth/extension` | Revoke token |

All routes accept either a Supabase cookie session OR `Authorization: Bearer <token>`.

### Extension (`apps/extension`)
- `contents/selection.tsx` — listens for `mouseup`/`keyup`, anchors a 🚀 button when text is selected on a supported site
- `components/popover.tsx` — tone/goal chips, generate, 3 drafts with Insert/Copy, skeleton loader, quota display
- `background.ts` — proxies API, holds token in `chrome.storage.local`, handles cross-origin auth handshake from the web app
- `lib/adapters/{gmail,outlook,linkedin,slack,whatsapp,x}.ts` — per-platform `findReplyBox` + `insertText`

### Database (`supabase/migrations/0001_init.sql`)
7 tables, `handle_new_user` trigger, `increment_usage` RPC, RLS on every table.

## Setup

```bash
pnpm install
cp .env.example .env.local                         # Anthropic + Supabase keys

# Run the migration against your Supabase project
psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql

pnpm dev:web                                       # http://localhost:3000
pnpm dev:ext                                       # → load apps/extension/build/chrome-mv3-dev as unpacked extension
```

## Build & ship

```bash
pnpm build                          # both apps
cd apps/extension && pnpm package   # → build/chrome-mv3-prod.zip ready for Chrome Web Store
```

Verified clean: `pnpm typecheck` and `pnpm build` for both apps.

## Branches

Active dev branch: `claude/build-replyrocket-mvp-kmwhj`
