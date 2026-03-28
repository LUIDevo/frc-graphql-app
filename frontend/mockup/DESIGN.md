# PhoenixScouter Design System

## Theme

The app uses a **warm light theme** on primary pages and a **near-black dark theme** on secondary pages. The light theme is applied via the `body.dashboard-light` class, toggled by the `show()` navigation function.

**Light pages:** Dashboard, Teams, Matches, Settings, Matchup Simulator, Pick Strategy
**Dark pages:** Match Detail, Team Detail, Alliance Builder, Unmatched Logs

---

## Colors

### Backgrounds
| Token | Value | Use |
|---|---|---|
| `--bg` | `#e8e4dc` | Page background (warm beige) |
| `--surface` | `#ffffff` | Cards, panels |
| `--surface2` | `#f0ece4` | Inset sections, metric pills, hover states |
| `--surface3` | `#e6e1d8` | Deeper inset, dividers |

### Text
| Token | Value | Use |
|---|---|---|
| `--text` | `#111111` | Primary — headings, numbers, key data |
| `--text-soft` | `#444444` | Secondary — names, descriptions, body copy |
| `--text-muted` | `#808080` | Tertiary — labels, eyebrows, timestamps, hints |

Hierarchy rule: data values → `--text`, supporting text → `--text-soft`, contextual labels → `--text-muted`.

### Borders
| Token | Value |
|---|---|
| `--border` | `rgba(0,0,0,0.13)` |
| `--border-hover` | `rgba(0,0,0,0.22)` |

### 4-Color Accent System
The entire app uses exactly four semantic colors. Never introduce a fifth.

| Name | Token | Light Value | Dark Value | Use |
|---|---|---|---|---|
| Red | `--c-red` | `#dc2626` | `#fda4af` | Red alliance, losses, danger |
| Blue | `--c-blue` | `#2563eb` | `#93c5fd` | Blue alliance, primary actions |
| Green | `--c-green` / `--green` | `#16a34a` | `#22d3ee` | Wins, scouted, positive status |
| Amber | `--c-amber` | `#b45309` | `#facc15` | Warnings, partial coverage, pace alerts |

Each color has dim and border companions:
```
--c-red-dim:      rgba(220,38,38,0.09)
--c-red-border:   rgba(220,38,38,0.24)
--c-blue-dim:     rgba(37,99,235,0.09)
--c-blue-border:  rgba(37,99,235,0.24)
--c-amber-dim:    rgba(180,83,9,0.09)
--c-amber-border: rgba(180,83,9,0.22)
```

### Page-level accent overrides
Some pages override `--accent` locally to set a semantic primary color:

| Page | Accent | Rationale |
|---|---|---|
| Dashboard | `#2563eb` (blue) | Neutral overview |
| Teams | `#dc2626` (red) | Competition-facing data |
| Matches | `#2563eb` (blue) | Schedule/match context |
| Settings, Matchup Sim, Pick Strategy | `#2563eb` (blue) | Tool/utility pages |

---

## Typography

### Fonts
- **`--sans`**: `Inter` (light theme), `IBM Plex Sans` (dark theme) — UI text
- **`--mono`**: `IBM Plex Mono` — numbers, labels, chips, all data values

### Scale
| Class / Role | Size | Weight | Font | Color |
|---|---|---|---|---|
| Page title (`.page-display`) | 28px | 700 | Sans | `--text` |
| Page eyebrow (`.page-eyebrow`) | 10px | 400 | Mono, uppercase, 0.14em spacing | `--text-muted` |
| Card title | 13–16px | 600 | Sans | `--text` |
| Card subtitle / sub-label | 12px | 400 | Sans | `--text-muted` |
| Section label | 10–11px | 400 | Mono, uppercase | `--text-muted` |
| Stat value | 28–44px | 700 | Mono | `--text` or semantic color |
| Body / description | 11–13px | 400 | Sans | `--text-soft` |
| Data chips / inline labels | 10–11px | 500–600 | Mono | contextual |
| Snippet/summary text | 11px | 400 | Mono | `--text-soft` |
| Context tags (logs, event) | 10px | 400 | Mono, uppercase | `--text-muted` |

Hierarchy rule: use size **and** weight **and** color together. Never rely on size alone.

---

## Layout

- **Sidebar width:** 220px, fixed
- **Content max-width:** 1180px, centered with `margin: 0 auto`
- **Page padding:** `40px 52px`
- **Card gap:** 8–16px
- **Card border-radius:** 8–12px

---

## Sidebar

The sidebar is light on light-theme pages (`#f0ece3` background), dark on dark-theme pages (`#0d0d0d`).

- **Brand mark:** Blue gradient pill (`#1d4ed8 → #3b82f6 → #60a5fa`), white "P"
- **Nav items:** `color: #555555`, hover adds `rgba(0,0,0,0.05)` bg
- **Active nav item:** `rgba(37,99,235,0.09)` bg, `2px solid #2563eb` left border, `color: #1d4ed8`
- **Event box:** White card (`#ffffff`), `rgba(0,0,0,0.09)` border

---

## Cards

```css
background: var(--surface);           /* #ffffff */
border: 1px solid var(--border);      /* rgba(0,0,0,0.13) */
border-radius: 8–12px;
box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04);
padding: 16–24px;
```

Hover: `background: var(--surface2)`, `border-color: var(--border-hover)`

---

## Chips & Pills

### Alliance chips (team numbers)
- Base: `background: --c-{color}-dim`, `color: --c-{color}`, `border: --c-{color}-border`
- "You" (your team): **solid fill** — `background: #dc2626`, `color: #fff` (red) or `#2563eb`/`#fff` (blue)

### Status pills
- Scouted: green dim + green text
- Live/in-progress: amber dim + amber text
- Partial: amber dim + amber text
- Unscouted: surface2 + text-soft + border

### Sort/filter pills (`.btn-pill`)
- Default: border + `text-soft`
- Active: `accent-dim` bg, `accent` text/border
- Primary action: solid `accent` bg, white text

---

## Color usage rules

1. **Red** = competition data (red alliance, losses, danger, teams page primary)
2. **Blue** = your team highlight, primary actions, navigation active state
3. **Green** = positive outcomes (wins, full scouting coverage, connected status)
4. **Amber** = warnings only (partial coverage, behind pace, inconsistency flags)
5. **Never** use amber for primary actions or navigation
6. **Alliance labels** use full-opacity solid color (`#dc2626` / `#2563eb`), not dimmed
7. **Win scores** are colored (`--c-red` / `--c-blue`); loss scores use `text-muted` at reduced opacity

---

## Applying the theme to a new page

1. Add the page ID to the `lightPages` array in `script.js`
2. The `body.dashboard-light` CSS variables cascade automatically — cards, text, borders, pills all inherit
3. Add `body.dashboard-light #page-{id}` overrides only for hardcoded values that don't use CSS vars
4. If the page needs a non-blue primary accent, scope `--accent` on `#page-{id}`
