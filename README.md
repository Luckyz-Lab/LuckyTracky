# LuckyTracky

A full-stack household money tracker. Log income and expenses through natural-language Thai chat, manage shared household accounts, view dashboards and reports, set category budgets, upload receipts, and use the LINE bot — all sharing one database.

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Database / Auth:** Supabase (Postgres + RLS)
- **AI:** Google Gemini (text parsing + receipt vision)
- **UI:** Tailwind CSS, Recharts, Lucide icons
- **Deploy target:** Vercel + Supabase

## Features

- Natural-language Thai transaction parsing (`กินข้าว 80`, `เงินเดือน 25000`)
- Auto-save when confident, confirmation card when ambiguous
- Shared households with auto-created personal household + invite codes
- Multi-household membership with a household switcher
- Dashboard: monthly totals, category breakdown, budget usage, rule-based insights + on-demand AI summary
- Reports: 6-month trend chart + month-over-month category comparison
- Transactions CRUD with search/filter
- Category & keyword management
- Monthly budgets per category with overspend warnings
- Receipt/slip upload → Gemini Vision draft → review → save (web and LINE)
- LINE bot: text logging, image receipts, confirm/cancel via postback
- CSV / Excel export
- Email, Google, and LINE login

## Getting Started

### 1. Install

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project API settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key (used by the LINE webhook). Never expose to the client. |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | Google Gemini API key and model |
| `LINE_CHANNEL_ACCESS_TOKEN` / `LINE_CHANNEL_SECRET` | LINE Messaging API channel (the bot) |
| `LINE_LOGIN_CHANNEL_ID` / `LINE_LOGIN_CHANNEL_SECRET` | LINE Login channel (web sign-in) |
| `NEXT_PUBLIC_SITE_URL` | Public site URL, used for invite links |

### 3. Set up the database

In the Supabase SQL editor, run the contents of `supabase/schema.sql`. This creates all tables, enums, RLS policies, the new-user trigger (auto profile + household + invite code + seeded categories), and the `join_household_by_code` RPC.

### 4. Configure auth providers (optional)

- **Google:** enable the Google provider in Supabase Auth and set the redirect URL to `<site>/auth/callback`.
- **LINE Login:** create a LINE Login channel, enable the email permission, and set the callback URL to `<site>/api/auth/line/callback`.

### 5. Configure the LINE bot (optional)

Point your LINE Messaging API channel webhook to `<site>/api/line/webhook`. Users link their LINE account by signing in with LINE on the web, then choose a default household in **Settings**.

### 6. Run

```bash
npm run dev       # http://localhost:3000
npm run test      # parser unit tests
npm run build     # production build
```

## Project Structure

```
src/
  app/
    (app)/            # authenticated pages: dashboard, transactions, budgets, reports, categories, receipts, settings
    api/              # route handlers (chat, transactions, dashboard, reports, line/webhook, auth/line, ...)
    login/            # auth screen
    auth/             # OAuth callback + signout
  components/         # client UI (ChatPanel, charts, views, switcher)
  lib/
    parser/           # ported Thai parser: categories, money, date, rules, prompts, gemini
    supabase/         # client/server/admin helpers + DB types
    chat-handler.ts   # shared chat logic (web + LINE)
    dashboard.ts      # dashboard aggregation
    reports.ts        # trend + comparison aggregation
supabase/schema.sql   # database schema, RLS, triggers, seed
```

## Notes

- The Thai parser was ported from an existing LINE bot and reused across the web chat and the LINE webhook.
- Currency defaults to THB but a `currency` column exists for future multi-currency support.
- Receipt OCR results are never auto-saved; the user always reviews a draft first.
