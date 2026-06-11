# Build Plan: Money Management Web App

## Goal

Build a full-stack money management web app for tracking income and expenses through natural-language chat, shared household accounts, dashboards, category budgets, LINE integration, and receipt image parsing.

Use the existing LINE bot project at:

`C:\Users\MSI GF75\Downloads\managemoney-main\managemoney-main`

as the source reference for:

- Thai natural-language transaction parsing
- Gemini prompt/rules
- category logic
- date and money parsers
- auto-save vs confirmation behavior
- LINE webhook behavior

## Tech Stack

- Framework: Next.js full-stack
- Database/Auth: Supabase
- AI Parser: Gemini
- Deployment target: Vercel + Supabase
- UI target: Desktop dashboard plus mobile-friendly chat flow

## Core Product Requirements

1. Users can log in and belong to a shared household.
2. Household members can record income/expenses into the same shared account.
3. Users can type natural Thai messages such as:
   - `กินข้าว 80`
   - `เงินเดือน 25000`
   - `เมื่อวานค่าน้ำ 300`
   - `โอน 500`
4. The system parses messages into:
   - item
   - amount
   - type: income or expense
   - category
   - date
   - confidence
5. If confidence is high and required fields exist, auto-save immediately.
6. If the message is ambiguous, show a confirmation card before saving.
7. Users can edit, delete, search, and filter transactions.
8. Dashboard shows current month overview.
9. Users can set monthly budgets by category.
10. Dashboard shows insight such as overspending warnings or top spending categories.
11. LINE bot and web app should share the same transaction database.
12. Users can upload receipt/slip images. AI/OCR should extract a draft transaction, then the user reviews before saving.
13. Users can export data as CSV/Excel.
14. Assistant reply style should be configurable in Settings.

## Pages / App Structure

### Dashboard

Primary landing screen after login.

Show:

- total income this month
- total expenses this month
- net balance
- budget usage by category
- top expense categories
- income sources
- recent transactions
- AI-generated insight summary

### Chat Panel

Desktop:

- right-side persistent chat panel

Mobile:

- dedicated chat screen or bottom drawer

Chat states:

- normal input
- parsing/loading
- saved transaction card
- confirmation card
- missing field prompt
- error state

### Transactions

Show a searchable and filterable transaction table.

Required actions:

- create manually
- edit transaction
- delete transaction
- search by item/category
- filter by date range
- filter by income/expense
- filter by category

### Budgets

Allow household budget setup per month/category.

Fields:

- household_id
- category_id
- month
- limit_amount

Dashboard should compare actual spending against budget.

### Categories

Start with categories from the existing LINE bot.

Allow:

- add category
- edit category
- hide category
- manage keywords
- separate income and expense categories

### Receipts

Flow:

1. User uploads receipt/slip image.
2. Server sends image to AI/OCR parser.
3. System returns draft transaction.
4. User reviews and edits draft.
5. User saves transaction.

Do not auto-save receipt results in v1.

### Settings

Include:

- household members
- member roles
- LINE account linking
- assistant tone preference
- export CSV/Excel
- category settings

## Database Model

Use Supabase Auth and Row Level Security.

Suggested tables:

### households

- id
- name
- created_by
- created_at

### profiles

- id
- auth_user_id
- display_name
- created_at

### household_members

- id
- household_id
- profile_id
- role: owner | member
- created_at

### transactions

- id
- household_id
- created_by
- item
- amount
- type: income | expense
- category_id
- date
- source: web_chat | manual | line | receipt
- confidence
- raw_input_optional
- created_at
- updated_at

### categories

- id
- household_id nullable for default/global categories
- name
- type: income | expense
- keywords
- is_active
- created_at

### budgets

- id
- household_id
- category_id
- month
- limit_amount
- created_at
- updated_at

### pending_confirmations

- id
- household_id
- profile_id
- parsed_payload
- raw_input
- expires_at
- created_at

### line_accounts

- id
- household_id
- profile_id
- line_user_id
- linked_at

### receipt_drafts

- id
- household_id
- profile_id
- image_url
- parsed_payload
- status: draft | saved | discarded
- created_at

## API Requirements

### POST /api/chat

Input:

- message
- household_id

Behavior:

- parse using Gemini
- sanitize result
- fallback to rule parser if Gemini fails
- apply auto-save rules
- return one of:
  - saved transaction
  - confirmation required
  - missing fields
  - summary response
  - error

### POST /api/chat/confirm

Input:

- pending_confirmation_id
- action: confirm | cancel
- optional edited transaction fields

Behavior:

- confirm saves transaction
- cancel clears pending confirmation

### /api/transactions

Support:

- GET list
- POST create
- PATCH update
- DELETE delete

### GET /api/dashboard

Input:

- household_id
- month

Return:

- total income
- total expenses
- net balance
- category breakdown
- budget status
- recent transactions
- insight

### POST /api/receipts

Input:

- image file

Return:

- parsed draft transaction

### POST /api/line/webhook

Adapt existing LINE webhook behavior to write into the same Supabase schema.

## Existing Code To Reuse

From the LINE bot project:

- `src/services/geminiService.js`
  - reuse Gemini parsing flow
  - convert CommonJS to TypeScript/ES modules if needed
- `src/constants/prompts.js`
  - reuse Thai system prompt
  - update schema to match web transaction model
- `src/constants/categories.js`
  - use as default seed categories and keyword rules
- `src/utils/dateParser.js`
  - reuse Thai date parsing
- `src/utils/moneyParser.js`
  - reuse amount extraction
- `src/utils/transactionRules.js`
  - reuse auto-save and ambiguous transaction rules
- `src/handlers/messageHandler.js`
  - use as behavior reference, but rewrite for web API response objects instead of LINE messages
- `src/messages/*`
  - convert LINE Flex responses into web UI components:
    - transaction result card
    - summary card
    - confirmation card
    - missing field message

## Main User Workflow

1. User logs in.
2. User selects household.
3. User opens Dashboard.
4. User types a transaction into chat.
5. Server parses the message.
6. If clear, transaction is saved immediately.
7. If ambiguous, user confirms or edits first.
8. Dashboard updates.
9. User can correct the transaction later from Transactions.
10. Household members and linked LINE accounts see the same shared data.

## Receipt Workflow

1. User uploads slip image.
2. AI/OCR extracts possible fields.
3. System creates a draft only.
4. User reviews:
   - amount
   - item/store
   - category
   - date
   - type
5. User saves draft as transaction.

## LINE Integration Workflow

1. User links LINE account from Settings.
2. Store `line_user_id` mapped to profile and household.
3. LINE webhook receives text.
4. Existing parse logic runs.
5. Transaction is saved to same `transactions` table.
6. Web dashboard shows LINE-created transactions.

## Security Requirements

- Use Supabase Auth.
- Use RLS on all household-owned tables.
- Users can only read/write rows for households where they are members.
- Only owner can manage household members.
- Do not expose Gemini API key to frontend.
- Receipt images should use private or signed URLs if stored.

## Testing Plan

### Unit Tests

Test:

- money parser
- Thai date parser
- category classifier
- confidence rules
- ambiguous transfer detection

### API Tests

Test:

- clear transaction auto-save
- ambiguous transaction confirmation
- missing amount prompt
- transaction CRUD
- dashboard aggregation
- household data isolation

### Example Test Messages

- `กินข้าว 80`
- `ข้าวมันไก่ 80`
- `กาแฟ 45`
- `เงินเดือน 25000`
- `โบนัส 3000`
- `ขายของได้ 1200`
- `เมื่อวานค่าน้ำ 300`
- `ค่าแท็กซี่ 150`
- `โอน 500`
- `เงิน 800`

### UI Tests

Check:

- desktop dashboard layout
- right-side chat panel
- mobile chat layout
- transaction edit/delete
- budget warning state
- receipt upload review flow

## Implementation Phases

### Phase 1: Project Setup

- Create Next.js app
- Configure Supabase client/server helpers
- Add environment variables
- Add base layout and auth shell

### Phase 2: Database

- Create Supabase schema
- Add RLS policies
- Seed default categories from existing bot

### Phase 3: Parser Migration

- Port Gemini parser
- Port prompt builder
- Port date/money/category/rule utilities
- Return structured web-safe parse results

### Phase 4: Chat + Transactions

- Build chat API
- Build confirmation flow
- Build transaction CRUD
- Build web transaction cards

### Phase 5: Dashboard + Budgets

- Build monthly dashboard queries
- Build charts/cards
- Build budget setup and warning logic
- Add insight generation

### Phase 6: LINE Integration

- Add LINE webhook route
- Link LINE user IDs to web profiles
- Ensure LINE and web share the same household data

### Phase 7: Receipt Upload

- Build upload UI
- Add AI/OCR parser
- Create receipt draft review flow
- Save approved drafts as transactions

### Phase 8: Export + Polish

- Add CSV/Excel export
- Add responsive QA
- Add loading/error/empty states
- Deploy to Vercel

## Defaults / Assumptions

- Use Next.js, Supabase, Gemini, and Vercel.
- Use shared household accounts from v1.
- Keep LINE integration active.
- Use auto-save only when confidence is high.
- Ask for confirmation on ambiguous transactions.
- Do not auto-save receipt OCR results.
- Store transaction results and metadata, not full chat history by default.
- Recurring transactions are not required in v1, but schema should not block adding them later.
