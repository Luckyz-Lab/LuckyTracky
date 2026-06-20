# LuckyTracky AI - Design System

This document is the visual source of truth for the production app. The Gemini mockup defines the composition and visual language; the existing Next.js, Supabase, and API architecture remains unchanged.

## Product Direction

- Product: household finance tracker with an AI cat advisor.
- Personality: bright, friendly, precise, and encouraging.
- Primary users: Thai households tracking income, expenses, budgets, and savings in THB.
- Visual direction: clean white workspace, vivid orange actions, dark slate text, and compact data-rich layouts.

## Color Tokens

```text
page            #FAF8F5
surface         #FFFFFF
surface-muted   #F8FAFC
border          #F1F5F9
border-strong   #E2E8F0
text            #0F172A
text-muted      #64748B
primary         #F97316
primary-dark    #EA580C
primary-soft    #FFF7ED
income          #10B981
expense         #F43F5E
info            #3B82F6
warning         #F59E0B
```

Category colors must remain visually distinct. Use orange, blue, emerald, rose, violet, cyan, amber, indigo, and slate ramps. Do not collapse categories into one warm color family.

## Typography

| Role | Font | Weight |
|---|---|---|
| Display and headings | Outfit | 600-700 |
| Body and controls | Inter | 400-600 |
| Thai fallback | Noto Sans Thai | 400-700 |
| Financial figures | Inter | 600-700, tabular numerals |

Use 28-32px for page titles, 18-22px for section titles, 14-16px for body text, and 12-13px for captions. Letter spacing stays at zero.

## Layout

- Desktop sidebar: 280px expanded, 78px collapsed.
- Desktop command bar: sticky white surface with breadcrumb, search, status, and quick actions.
- Main background: `#FAF8F5`; content width is fluid and must never create horizontal overflow.
- Mobile: bottom navigation and a compact header replace the desktop sidebar.
- Dashboard: welcome band, four metric cards, advisor panel, score/recommendations, analytics, goals/budgets, and transaction table.

## Surfaces

- Cards: white background, 24px radius, 2px light border, 4px bottom border, restrained shadow.
- Inputs: white background, slate border, 12-16px radius, orange focus ring.
- Primary buttons: solid orange with white text; darken on hover.
- Tables: white surface, subtle row dividers, compact headers, horizontal scrolling only inside the table wrapper.
- Drawers: right-side on desktop and bottom sheet on mobile.

## Component Rules

- Sidebar active item uses orange-50 with an orange left rail.
- Financial metrics use green for income, rose for expense, and slate/orange for balance.
- Category chips and charts use the shared category palette.
- Icon buttons use Lucide icons with accessible labels and tooltips where the icon is not self-explanatory.
- Avoid nested cards. Sections are unframed unless they represent a discrete tool or repeated item.
- Use the mascot only where it provides identity, status, or guidance; it is not generic decoration.

## Theme Architecture

All application chrome uses semantic CSS variables exposed through Tailwind tokens. Components must use `canvas`, `surface`, `surface-muted`, `ink`, `line`, `primary`, `positive`, `negative`, `caution`, and `informative` rather than literal palette colors.

The supported presets are Lucky Orange, Calico, Siamese, Black Cat, and Midnight. User overrides may change primary, canvas, surface, text, card radius, and elevation. Text/surface and primary/button-label combinations must retain at least 4.5:1 contrast. Category colors and external brand colors remain centrally managed and are not user overrides.

Appearance settings live at `/appearance`, preview locally, and persist only after the user selects **Save appearance**. Theme preferences are stored in `profile_preferences.theme`, `theme_mode`, and `theme_overrides`.

## Responsive Rules

- No viewport-wide horizontal overflow at 375px, 768px, 1280px, or 1440px.
- Fixed-format charts, toolbars, and navigation controls must use stable dimensions.
- Long Thai labels wrap or truncate without covering adjacent controls.
- Tables become mobile cards or use an explicitly scrollable table container.
- Modal and drawer actions remain reachable at 375x812.

## Anti-Patterns

- Do not reintroduce the previous claymorphism, terracotta gradients, Fredoka, or Sarabun theme.
- Do not use purple-blue gradients, decorative blobs, glassmorphism, or oversized marketing headings.
- Do not use muted same-family colors for all categories.
- Do not place cards inside cards.
- Do not use `0.0.0.0` in browser-facing callback or redirect URLs; use `localhost` or the production origin.

## Delivery Checklist

- [ ] Dashboard matches the Gemini mockup composition and orange/white visual system.
- [ ] Sidebar, command bar, mobile navigation, and assistant drawer work at all breakpoints.
- [ ] Category colors are distinct and consistent across charts, chips, and transactions.
- [ ] Text hierarchy and THB figures are aligned and use tabular numerals.
- [ ] Authentication redirects use a browser-valid origin.
- [ ] Tests and production build pass.
- [ ] Desktop and mobile layouts have no horizontal overflow.
- [ ] Production database migration is applied before enabling recurring rules, preferences, and achievements.
- [ ] Every preset is checked on `/dashboard`, `/appearance`, and one data-entry modal.
