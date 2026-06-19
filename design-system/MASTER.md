# LuckyTracky — Design System MASTER

> Generated using the **UI UX Pro Max** methodology (product reasoning → style → color → typography → anti-patterns → checklist).
> This is the global source of truth. Page-specific overrides live in `design-system/pages/*.md`.

---

## 1. Product Reasoning

| Attribute | Value |
|---|---|
| **Product type** | Personal Finance Tracker (household income/expense, budgets, savings goals) |
| **Personality** | Warm, friendly, cozy, trustworthy — anchored by a cat mascot ("Lucky") |
| **Primary users** | Couples / households tracking daily spending in THB |
| **Emotional goal** | Make money tracking feel calm and encouraging, not stressful |

### Chosen Style (from 67)
**Primary: Claymorphism (#9)** + **Soft UI Evolution (#19)** — soft, puffy, tactile rounded surfaces. Perfect match for a cute mascot app and the warm muted palette.
**Layout: Bento Box Grid (#21)** — organizes dashboard metrics cleanly.

> Direction name: **"Cozy Clay"** — a warm, claymorphic finance tracker in a terracotta / dusty-rose / taupe palette with a friendly cat companion.

---

## 2. Color System — "Color Set 018"

Source palette (from PowerPoint Color Set 018):

| Token | Hex | Role |
|---|---|---|
| accent1 | `#F7E6E1` | Blush cream |
| accent2 | `#F0D0CC` | Soft pink |
| accent3 | `#E6A9A3` | **Dusty rose / terracotta (PRIMARY)** |
| accent4 | `#9C7F7B` | Mauve taupe |
| accent5 | `#756359` | Coffee taupe (text) |
| accent6 | `#ABA8A2` | Warm gray |

### Brand ramp — `clay` (replaces `lucky`)
```
clay-50:  #FBF4F1   ← page tints, hover bg
clay-100: #F7E6E1   ← accent1, soft surfaces
clay-200: #F0D0CC   ← accent2, borders
clay-300: #E6A9A3   ← accent3, PRIMARY accent / active nav
clay-400: #D98E86   ← interpolated
clay-500: #C57168   ← button gradient base (deeper terracotta)
clay-600: #9C7F7B   ← accent4, secondary text
clay-700: #756359   ← accent5, body text
clay-800: #5A4D45   ← strong text
clay-900: #3D342E   ← headings (darkest)
```

### Neutrals — `sand`
```
sand-50:  #FAF7F5
sand-100: #F2EDEA
sand-200: #E7E6E6   ← lt2
sand-300: #D8D4D0
sand-400: #ABA8A2   ← accent6 warm gray
sand-500: #8A8681
```

### Semantic (harmonized warm — NO neon)
```
income  (positive): #7E9B74   muted sage green
expense (negative): #C0685E   warm terracotta-red
warning            : #D9A45B  warm amber
info               : #8FA3B0  dusty slate
```

### Category palette (replaces random rainbow)
Harmonized warm analogous set so the donut chart reads as one family:
```
#E6A9A3  terracotta   |  #C57168  brick      |  #D9A45B  amber
#9C7F7B  mauve        |  #7E9B74  sage       |  #B98A6E  caramel
#C99CA0  rose-taupe   |  #A89178  khaki      |  #8FA3B0  dusty slate
```

---

## 3. Typography

| Role | Font | Notes |
|---|---|---|
| **Display** | `Fredoka` | Rounded, friendly — matches clay (keep) |
| **Body** | `Sarabun` | Thai + Latin support (keep) |
| Numbers | Fredoka 600 | Tabular feel for money figures |

Scale: page-title 28–32px / section-title 18px / body 14–15px / caption 12px. Line-height generous (1.5–1.6) for warmth.

---

## 4. Surfaces & Effects (Claymorphism)

- **Cards**: `bg-clay-50/90`, radius `1.75rem`, dual shadow — soft light highlight top-left + warm shadow bottom-right.
- **Clay shadow**:
  ```
  shadow-clay: 0 10px 24px -10px rgba(117,99,89,.28), inset 0 2px 4px rgba(255,255,255,.55), inset 0 -3px 6px rgba(117,99,89,.10)
  ```
- **Buttons (primary)**: gradient `clay-300 → clay-500`, white text, soft press (`active:scale-95`), warm glow ring on focus.
- **Background**: warm gradient mesh — `sand-50` base + radial glows of `clay-100`, `clay-200`, subtle `clay-300`.
- **Borders**: `clay-200` at 60–80% opacity. No harsh lines.

---

## 5. Component Map

| Component | Change |
|---|---|
| Sidebar | Soft cream `clay-50` surface; active item = clay-300→clay-500 pill; coffee-taupe labels |
| Stat cards | Clay surfaces; income=sage, expense=terracotta-red, balance=clay |
| Donut chart | Harmonized warm category palette |
| Mascot pod | Clay "bowl" the cat sits in |
| Chat panel | Frosted clay; bubbles use clay-100 (bot) / clay-300 (user) |
| Empty states | CatDecor + warm copy |

---

## 6. Anti-Patterns (MUST avoid)

- No AI purple/pink gradients (we are warm terracotta).
- No random rainbow category colors — always use the harmonized set above.
- No neon / saturated greens & reds — semantic colors stay muted.
- No pure-white `#FFF` cards on the warm bg — use `clay-50` tints.
- Keep ≥ 4.5:1 contrast for text (coffee-taupe `#756359`+ on cream = pass).
- Don't lose income/expense distinction — sage vs terracotta-red.

---

## 7. Dark Mode

Warm dark, not cold slate:
```
bg:      #241F1C  (warm espresso)
surface: #2E2825
border:  #403833
text:    #F2EDEA
primary: #E6A9A3 (clay-300 stays the accent)
```

---

## 8. Pre-Delivery Checklist

- [ ] All `lucky-*` / `brand-*` classes migrated to `clay-*`
- [ ] Donut + category chips use harmonized palette
- [ ] Income green / expense red are muted & distinguishable
- [ ] Cards use clay shadow + clay-50 surface (no pure white)
- [ ] Background is warm gradient mesh (no violet/green remnants)
- [ ] Sidebar active state = clay pill
- [ ] Dark mode = warm espresso (no cold navy)
- [ ] Contrast AA on text
- [ ] Mascot + CatDecor still render
