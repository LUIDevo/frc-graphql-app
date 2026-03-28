# PhoenixScouter Design System

A complete reference for recreating the visual style of this app. All CSS is dark-first, monospace-forward, and data-dense.

---

## Fonts

```html
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
```

- **`--mono`**: `'IBM Plex Mono', monospace` — used for all numbers, labels, codes, buttons, identifiers
- **`--sans`**: `'IBM Plex Sans', sans-serif` — body text, names, descriptions
- Base: `font-size: 13px`, `line-height: 1.5`, `-webkit-font-smoothing: antialiased`

---

## Design Tokens

```css
:root {
  /* Backgrounds */
  --bg:            #0a0a0a;   /* page background */
  --surface:       #111111;   /* cards */
  --surface2:      #1a1a1a;   /* nested elements, chips, inputs */
  --surface3:      #141414;   /* intermediate layer */

  /* Borders */
  --border:        rgba(255,255,255,0.08);
  --border-hover:  rgba(255,255,255,0.16);

  /* Text */
  --text:          #ededed;   /* primary */
  --text-soft:     #888888;   /* secondary */
  --text-muted:    #505050;   /* tertiary, labels */

  /* Accent (red — primary interactive color) */
  --accent:        #ef4444;
  --accent-dim:    rgba(239,68,68,0.10);
  --accent-border: rgba(239,68,68,0.25);

  /* Danger / destructive (same hue as accent, higher opacity) */
  --danger:        #ef4444;
  --danger-dim:    rgba(239,68,68,0.10);
  --red-dim:       rgba(239,68,68,0.08);
  --red-border:    rgba(239,68,68,0.25);

  /* Green */
  --green:         #4ade80;
  --green-dim:     rgba(74,222,128,0.10);
  --green-border:  rgba(74,222,128,0.25);
}
```

### Signature gradient
Used on hero numbers and logo mark:
```css
background: linear-gradient(135deg, #991b1b 0%, #ef4444 55%, #fca5a5 100%);
```

---

## Typography Scale

```css
.t-display { font-size: 32px; font-weight: 300; font-family: var(--sans); letter-spacing: -0.03em; line-height: 1; }
.t-title   { font-size: 22px; font-weight: 500; letter-spacing: -0.02em; line-height: 1.2; }
.t-heading { font-size: 16px; font-weight: 500; letter-spacing: -0.01em; line-height: 1.3; }
.t-body    { font-size: 13px; font-weight: 400; }
.t-small   { font-size: 11px; font-weight: 400; color: var(--text-soft); }
.t-label   { font-size: 10px; font-family: var(--mono); text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); }
.t-mono    { font-family: var(--mono); font-variant-numeric: tabular-nums; }
.t-mono-lg { font-family: var(--mono); font-size: 20px; font-variant-numeric: tabular-nums; }
```

**Section labels** (`.t-label` / `.db-section-label`):
```css
font-family: var(--mono); font-size: 10px; letter-spacing: 0.13em; text-transform: uppercase; color: var(--text-muted);
```

**Big gradient number** (hero stats, next match ID):
```css
font-family: var(--mono); font-size: 72px; font-weight: 700; letter-spacing: -0.04em; line-height: 1;
background: linear-gradient(135deg, #991b1b 0%, #ef4444 55%, #fca5a5 100%);
-webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
```

---

## Layout

### App shell
```css
.app-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 100vh;
}
```

### Sidebar
```css
.sidebar {
  position: fixed; top: 0; left: 0;
  width: 220px; height: 100vh;
  background: #0d0d0d;
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
  z-index: 100;
}
```

**Logo mark** (32×32, gradient bg, `border-radius: 7px`):
```css
background: linear-gradient(135deg, #991b1b 0%, #ef4444 55%, #fca5a5 100%);
box-shadow: 0 4px 14px rgba(239,68,68,0.35);
```

**Nav item**:
```css
.nav-item {
  display: flex; align-items: center; gap: 9px;
  padding: 7px 10px; margin: 1px 8px; border-radius: 6px;
  border: 1px solid transparent;
  color: var(--text-soft); font-size: 13px;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}
.nav-item:hover { background: rgba(255,255,255,0.05); color: var(--text); }
.nav-item.active {
  background: rgba(239,68,68,0.11);
  border-left: 2px solid #ef4444; border-color: rgba(239,68,68,0.28);
  color: var(--text); font-weight: 500;
}
```

### Page content
```css
.page { display: none; padding: 28px 32px; }
.page.active { display: block; }
```

---

## Cards

### Standard card
```css
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
}
.card-header {
  display: flex; align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
```

### Dashboard card (12px radius, more padding)
```css
.db-card {
  background: var(--surface); border-radius: 12px; border: 1px solid var(--border);
  padding: 20px; display: flex; flex-direction: column; gap: 16px;
}
.db-card-title { font-size: 16px; font-weight: 500; color: var(--text); letter-spacing: -0.01em; }
.db-card-sub   { font-size: 12px; color: var(--text-muted); margin-top: 3px; }
```

### Card animation
```css
@keyframes tcardIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* apply: animation: tcardIn 0.22s ease-out both; */
```

---

## Summary Chips (data cells)

Small labeled data blocks. Used inside cards for structured stats.

```css
.db-chip {
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: 7px; padding: 9px 10px;
  display: flex; flex-direction: column; gap: 4px;
}
.db-chip-label { font-family: var(--mono); font-size: 9px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); }
.db-chip-value { font-family: var(--mono); font-size: 14px; font-weight: 600; color: var(--text); font-variant-numeric: tabular-nums; }

/* Layouts */
.db-chip-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.db-chip-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
```

---

## Stat Cards (big number display)

```css
.db-stat {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 10px; padding: 14px 16px;
  display: flex; flex-direction: column; gap: 5px;
}
.db-stat-label { font-family: var(--mono); font-size: 9px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); }
.db-stat-value { font-family: var(--mono); font-size: 26px; font-weight: 700; line-height: 1; letter-spacing: -0.03em; color: var(--text); font-variant-numeric: tabular-nums; }
.db-stat-sub   { font-family: var(--mono); font-size: 10px; color: var(--text-soft); }

/* 4-up grid */
.db-stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
```

---

## Pills / Badges

```css
.pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 9px; border-radius: 20px;
  font-size: 11px; font-weight: 500;
}
.pill-green { background: rgba(34,197,94,0.12); color: #4ade80; border: 1px solid rgba(34,197,94,0.25); }
.pill-blue  { background: var(--accent-dim); color: var(--accent); border: 1px solid var(--accent-border); }
.pill-red   { background: var(--red-dim); color: #f87171; border: 1px solid var(--red-border); }
.pill-grey  { background: rgba(255,255,255,0.05); color: var(--text-soft); border: 1px solid var(--border); }
```

**You badge** (inline team identifier):
```css
.you-badge {
  font-family: var(--mono); font-size: 9px; letter-spacing: 0.06em; text-transform: uppercase;
  background: var(--accent-dim); color: var(--accent); border: 1px solid var(--accent-border);
  border-radius: 3px; padding: 1px 5px;
}
```

**Next match badge** (amber):
```css
.db-next-badge {
  padding: 5px 12px; border-radius: 6px;
  background: rgba(250,204,21,0.07); border: 1px solid rgba(250,204,21,0.18);
  font-family: var(--mono); font-size: 12px; color: #facc15; font-weight: 500;
}
```

**Event tag**:
```css
.event-tag {
  font-family: var(--mono); font-size: 11px; color: var(--text-soft);
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: 4px; padding: 3px 8px;
}
```

---

## Buttons

```css
.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 12px; border-radius: 5px;
  font-family: var(--sans); font-size: 12px; font-weight: 500;
  cursor: pointer; border: 1px solid transparent;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  white-space: nowrap;
}
.btn-mono { font-family: var(--mono); font-size: 11px; }

.btn-grey         { background: var(--surface2); border-color: var(--border); color: var(--text-soft); }
.btn-grey:hover   { background: rgba(255,255,255,0.08); color: var(--text); border-color: var(--border-hover); }

.btn-accent       { background: var(--accent); color: #fff; }
.btn-accent:hover { background: #dc2626; }

.btn-ghost        { background: transparent; border-color: var(--border); color: var(--text-soft); }
.btn-ghost:hover  { background: var(--surface2); color: var(--text); }

.btn-danger       { background: var(--danger-dim); border-color: var(--red-border); color: var(--danger); }
.btn-danger:hover { background: rgba(239,68,68,0.18); }

.btn-sm  { padding: 4px 9px; font-size: 11px; }
.btn-xs  { padding: 2px 7px; font-size: 10px; font-family: var(--mono); letter-spacing: 0.02em; }
```

**Inline action button** (mono, subtle ghost style):
```css
.db-action-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 13px; border-radius: 7px;
  font-family: var(--mono); font-size: 11px; font-weight: 500;
  cursor: pointer; border: 1px solid var(--border);
  background: transparent; color: var(--text-soft);
  transition: all 0.12s;
}
.db-action-btn:hover { background: rgba(255,255,255,0.05); border-color: var(--border-hover); color: var(--text); }
```

---

## Alliance Chips

Used in match rows, upcoming lists, and hero cards.

```css
.a-chip      { font-family: var(--mono); font-size: 10px; padding: 3px 7px; border-radius: 3px; border: 1px solid transparent; }
.a-chip-red  { background: rgba(239,68,68,0.12); color: #fca5a5; border-color: rgba(239,68,68,0.2); }
.a-chip-blue { background: rgba(59,130,246,0.12); color: #93c5fd; border-color: rgba(59,130,246,0.2); }
/* "you" variant — same color, boosted opacity */
.a-chip-you  { font-weight: 700; }
.a-chip-red.a-chip-you  { background: rgba(239,68,68,0.25); border-color: rgba(239,68,68,0.4); }
.a-chip-blue.a-chip-you { background: rgba(59,130,246,0.25); border-color: rgba(59,130,246,0.4); }
```

**Usage**:
```html
<div class="alliance-line">
  <span class="a-chip a-chip-red a-chip-you">1114</span>
  <span class="a-chip a-chip-red">254</span>
  <span class="a-chip a-chip-red">2056</span>
</div>
```

---

## Match Cards (matches list page)

```css
.match-card-list { display: flex; flex-direction: column; gap: 8px; }

.mc-card {
  background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
  padding: 20px; display: flex; flex-direction: column; gap: 16px;
  cursor: pointer; transition: border-color 0.14s, background 0.14s;
  animation: tcardIn 0.22s ease-out both;
}
.mc-card:hover { border-color: var(--border-hover); background: rgba(255,255,255,0.01); }

/* Header row */
.mc-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.mc-title    { font-size: 15px; font-weight: 500; color: var(--text); letter-spacing: -0.01em; }
.mc-subtitle { font-family: var(--mono); font-size: 11px; color: var(--text-muted); margin-top: 3px; }

/* 2-col alliance grid */
.mc-alliance-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.mc-alliance-chip {
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: 7px; padding: 11px 12px;
  display: flex; flex-direction: column; gap: 6px;
}
.mc-alliance-chip.chip-red  { border-color: rgba(239,68,68,0.18); }
.mc-alliance-chip.chip-blue { border-color: rgba(59,130,246,0.18); }

.mc-alliance-label { font-family: var(--mono); font-size: 9px; text-transform: uppercase; letter-spacing: 0.12em; }
.mc-red-label  { color: rgba(239,68,68,0.65); }
.mc-blue-label { color: rgba(59,130,246,0.65); }

.mc-score { font-family: var(--mono); font-size: 26px; font-weight: 700; line-height: 1; font-variant-numeric: tabular-nums; }
.mc-score-red  { color: #f87171; }
.mc-score-blue { color: #60a5fa; }

.mc-teams { display: flex; gap: 4px; flex-wrap: wrap; }

/* Footer row */
.mc-coverage-row { display: flex; align-items: center; justify-content: space-between; }
.mc-coverage      { display: flex; align-items: center; gap: 6px; }
.mc-coverage-label { font-family: var(--mono); font-size: 10px; color: var(--text-muted); }

.mc-action-btn {
  border-radius: 7px; border: none; padding: 7px 14px;
  font-size: 11px; font-family: var(--mono); font-weight: 500;
  cursor: pointer; background: var(--accent); color: #fff;
  transition: background 0.12s, transform 0.08s;
}
.mc-action-btn:hover { background: #2563eb; }
```

**Match card HTML structure**:
```html
<div class="mc-card" onclick="...">
  <div class="mc-head">
    <div class="mc-head-left">
      <div class="mc-title">Qualification Match 12</div>
      <div class="mc-subtitle">Red wins · +14 pts</div>
    </div>
    <div class="mc-head-badges">
      <span class="pill pill-green" style="font-size:9px;padding:2px 8px;">● scouted</span>
    </div>
  </div>
  <div class="mc-alliance-grid">
    <div class="mc-alliance-chip chip-red">
      <div class="mc-alliance-label mc-red-label">Red Alliance</div>
      <div class="mc-score mc-score-red">148</div>
      <div class="mc-teams">
        <span class="a-chip a-chip-red a-chip-you">1114</span>
        <span class="a-chip a-chip-red">254</span>
        <span class="a-chip a-chip-red">2056</span>
      </div>
    </div>
    <div class="mc-alliance-chip chip-blue">
      <div class="mc-alliance-label mc-blue-label">Blue Alliance</div>
      <div class="mc-score mc-score-blue">134</div>
      <div class="mc-teams">
        <span class="a-chip a-chip-blue">118</span>
        <span class="a-chip a-chip-blue">330</span>
        <span class="a-chip a-chip-blue">1678</span>
      </div>
    </div>
  </div>
  <div class="mc-coverage-row">
    <div class="mc-coverage">
      <!-- scout dots -->
      <span class="mc-coverage-label">6/6 scouted</span>
    </div>
    <button class="mc-action-btn" onclick="event.stopPropagation()">View match →</button>
  </div>
</div>
```

---

## Scout Coverage Dots

```css
.scout-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--surface2); border: 1px solid var(--border);
}
.scout-dot.filled  { background: #4ade80; border-color: rgba(74,222,128,0.4); }
.scout-dot.partial { background: #facc15; border-color: rgba(250,204,21,0.4); }

/* container */
.scout-dots { display: flex; gap: 3px; align-items: center; }
```

---

## Tables

```css
table { width: 100%; border-collapse: collapse; }
thead tr { border-bottom: 1px solid var(--border); }
th {
  font-family: var(--mono); font-size: 10px; text-transform: uppercase;
  letter-spacing: 0.1em; color: var(--text-muted); font-weight: 400;
  padding: 0 10px 10px; text-align: left; white-space: nowrap;
}
td {
  padding: 9px 10px; font-size: 12px; color: var(--text-soft);
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
tbody tr:hover td { background: rgba(255,255,255,0.025); }

/* "You" row highlight */
tr.row-you td { background: rgba(59,130,246,0.06); color: var(--text); }
tr.row-you td:first-child { border-left: 2px solid var(--accent); }
tr.row-you:hover td { background: rgba(59,130,246,0.09); }

/* Dim row */
tr.row-dim td { opacity: 0.45; }
```

---

## Progress Bar

```css
.db-progress       { height: 4px; border-radius: 2px; background: rgba(255,255,255,0.06); overflow: hidden; }
.db-progress-fill  { height: 100%; border-radius: 2px; background: var(--accent); }
/* Also used as bar-wrap / bar-fill in older sections: */
.bar-wrap { width: 80px; height: 4px; background: rgba(255,255,255,0.07); border-radius: 2px; }
.bar-fill { height: 4px; border-radius: 2px; background: var(--accent); }
```

---

## Form Elements

```css
.input-field {
  width: 100%; background: var(--surface2); border: 1px solid var(--border);
  border-radius: 5px; padding: 7px 10px;
  color: var(--text); font-family: var(--mono); font-size: 12px;
  outline: none; transition: border-color 0.12s;
}
.input-field:focus { border-color: var(--accent-border); }
.input-field[readonly] { color: var(--text-soft); }

.input-label { font-size: 11px; color: var(--text-soft); margin-bottom: 4px; }

/* Select */
.epoch-select {
  font-family: var(--mono); font-size: 11px;
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: 5px; color: var(--text-soft); padding: 5px 10px;
  cursor: pointer; outline: none;
}
```

**Toggle chips** (filter options, role selectors):
```css
.role-chip {
  display: inline-flex; align-items: center; gap: 5px;
  border-radius: 5px; padding: 4px 10px;
  background: var(--surface2); border: 1px solid var(--border);
  cursor: pointer; font-family: var(--mono); font-size: 11px; color: var(--text-soft);
  transition: border-color 0.12s, color 0.12s, background 0.12s;
}
.role-chip:hover  { border-color: var(--border-hover); color: var(--text); }
.role-chip.active { border-color: var(--accent); background: var(--accent-dim); color: var(--accent); }
```

---

## Alliance Builder Slots

```css
.alliance-slot {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border: 1px dashed var(--border);
  border-radius: 6px; margin-bottom: 6px; cursor: pointer;
  transition: border-color 0.12s, background 0.12s;
}
.alliance-slot.filled         { border-style: solid; }
.alliance-slot.red-slot.filled  { border-color: rgba(239,68,68,0.3); background: var(--red-dim); }
.alliance-slot.blue-slot.filled { border-color: var(--accent-border); background: var(--accent-dim); }
.alliance-slot:hover { background: rgba(255,255,255,0.03); }

.slot-team-num { font-family: var(--mono); font-size: 14px; font-weight: 500; }
.slot-team-name { font-size: 11px; color: var(--text-soft); }
.slot-opr  { font-family: var(--mono); font-size: 11px; color: var(--text-muted); margin-left: auto; }
.slot-empty { font-size: 12px; color: var(--text-muted); font-style: italic; }
```

---

## Dashboard Layout

```
page-dashboard (padding: 24px)
└── .db-shell (flex column, gap: 14px)
    ├── .db-statusbar      ← chips + amber next-match badge + controls
    ├── .db-hero           ← next match: 72px Q-number, two alliance columns
    ├── .db-stats-row      ← 4 stat chips: rank / OPR / record / coverage
    ├── .db-two-col
    │   ├── .db-card       ← Event Rankings (8-row list)
    │   └── flex col, gap 14px
    │       ├── .db-card   ← Scout Coverage (%, progress, 3 chips)
    │       └── .db-card   ← Your Record (W/L big nums + form dots)
    └── .db-card           ← Upcoming Matches (action buttons in header)
```

### Hero card alliance columns
```css
.db-hero-alliances { display: grid; grid-template-columns: 1fr 1px 1fr; gap: 24px; }
.db-hero-vdivider  { background: var(--border); }
```

Per-team row inside alliance:
```css
.db-team-row { display: flex; align-items: center; gap: 10px; }
.db-tnm { font-family: var(--mono); font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 4px; }
.dtn-red  { background: rgba(239,68,68,0.12); color: #fca5a5; border: 1px solid rgba(239,68,68,0.2); }
.dtn-blue { background: rgba(59,130,246,0.12); color: #93c5fd; border: 1px solid rgba(59,130,246,0.2); }
/* "you" — boosted opacity */
.dtn-you-red  { background: rgba(239,68,68,0.22); border-color: rgba(239,68,68,0.4); font-weight: 700; }
.dtn-you-blue { background: rgba(59,130,246,0.22); border-color: rgba(59,130,246,0.4); font-weight: 700; }
.db-team-name { font-size: 12px; color: var(--text); }
.db-team-meta { font-family: var(--mono); font-size: 10px; color: var(--text-muted); }
```

### W/L record display
```css
.db-wl-w   { font-family: var(--mono); font-size: 44px; font-weight: 700; color: var(--green); line-height: 1; letter-spacing: -0.04em; }
.db-wl-sep { font-family: var(--mono); font-size: 22px; color: var(--text-muted); font-weight: 300; }
.db-wl-l   { font-family: var(--mono); font-size: 44px; font-weight: 700; color: #f87171; line-height: 1; letter-spacing: -0.04em; }
```

### Form dots
```css
.db-fdot   { width: 9px; height: 9px; border-radius: 2px; }
.db-fdot-w { background: var(--green); opacity: 0.65; }
.db-fdot-l { background: #f87171; opacity: 0.55; }
.db-form   { display: flex; gap: 3px; }
```

### Rankings list row
```css
.db-rank-row { display: flex; align-items: center; gap: 10px; padding: 7px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-family: var(--mono); }
.db-rank-row.db-you { background: rgba(59,130,246,0.05); margin: 0 -20px; padding: 7px 20px; border-left: 2px solid var(--accent); }
.db-rank-row.db-you .db-rnum { color: var(--accent); }
.db-rn   { width: 18px; text-align: right; font-size: 10px; color: var(--text-muted); }
.db-rnum { width: 36px; font-size: 11px; font-weight: 600; color: var(--text); }
.db-rname { flex: 1; font-size: 10px; color: var(--text-soft); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.db-ropr { font-size: 11px; font-weight: 600; color: var(--text); width: 38px; text-align: right; }
```

### Coverage dot (rankings)
```css
.db-rcov     { width: 7px; height: 7px; border-radius: 50%; }
.cov-full    { background: var(--green); opacity: 0.7; }
.cov-partial { background: #facc15; opacity: 0.65; }
.cov-none    { background: rgba(255,255,255,0.2); opacity: 0.4; }
```

### Upcoming match row
```css
.db-urow { display: flex; align-items: center; gap: 12px; padding: 9px 0; border-bottom: 1px solid rgba(255,255,255,0.04); cursor: pointer; }
.db-urow:hover { background: rgba(255,255,255,0.02); }
.db-urow.db-next { padding-left: 10px; margin-left: -2px; border-left: 2px solid rgba(250,204,21,0.4); }
.db-urow.db-next .db-uid { color: #facc15; }
.db-uid   { font-family: var(--mono); font-size: 12px; font-weight: 600; color: var(--text); width: 36px; }
.db-uteams { flex: 1; display: flex; flex-direction: column; gap: 3px; }
.db-utime  { font-family: var(--mono); font-size: 10px; color: var(--text-muted); }
```

---

## Color Reference Quick Sheet

### Dark mode (default / `body.dashboard-dark`)

| Purpose | Value |
|---|---|
| Page background | `#0a0a0a` |
| Card surface | `#111111` |
| Nested / chip surface | `#1a1a1a` |
| Sidebar background | `#0d0d0d` |
| Border (default) | `rgba(255,255,255,0.08)` |
| Border (hover) | `rgba(255,255,255,0.16)` |
| Text primary | `#ededed` |
| Text secondary | `#888888` |
| Text muted / labels | `#505050` |
| Accent red | `#ef4444` |
| Accent red (pastel on dark) | `#f87171` / `#fca5a5` |
| Alliance blue (pastel on dark) | `#93c5fd` |
| Green / success | `#4ade80` |
| Amber / next match | `#facc15` |
| Gradient start | `#991b1b` |
| Gradient mid | `#ef4444` |
| Gradient end | `#fca5a5` |

### Light mode (`body.dashboard-light`)

| Purpose | Value |
|---|---|
| Page background | `#e8e4dc` |
| Card surface | `#ffffff` |
| Nested / chip surface | `#f0ece4` |
| Sidebar background | `#f0ece3` |
| Border (default) | `rgba(0,0,0,0.13)` |
| Text primary | `#111111` |
| Text secondary | `#444444` |
| Text muted / labels | `#808080` |
| Accent red | `#dc2626` |
| Alliance blue | `#2563eb` |
| Green / success | `#16a34a` |
| Amber / next match | `#b45309` |

---

## Design Principles

1. **Monospace for data** — any number, key, stat, timestamp, or code uses `--mono`. Prose uses `--sans`.
2. **Three text levels** — `--text` (primary), `--text-soft` (secondary), `--text-muted` (labels/disabled).
3. **Density without clutter** — 4px progress bars, 7px dots, 9–10px uppercase labels. Small elements, big information.
4. **Accent sparingly** — red only for interactive/selected state and key numbers. Don't use it for decorative purposes.
5. **Alliance color coding** — red = `rgba(239,68,68,*)`, blue = `rgba(59,130,246,*)`. "You" always uses higher opacity variant of the same hue. Alliance blue is never used as a primary accent.
6. **Borders, not shadows** — use 1px borders over box-shadow for most surfaces. Logo mark is the exception (`0 4px 14px rgba(239,68,68,0.35)`).
7. **Hero numbers get the gradient** — the `linear-gradient(135deg, ...)` text clip is reserved for the most important number on the screen. Don't dilute it.
8. **Cards at 12px radius, chips at 7px, small elements at 5–6px** — consistent radius hierarchy.

---

## Theming

The app uses a two-class system on `<body>`. Layout, spacing, and typography always come from `dashboard-light`. Color-only overrides come from `dashboard-dark` when active. Since `dashboard-dark` is defined later in the stylesheet, it wins on equal-specificity selectors.

```
body                          → base dark (:root) — teamdetail, matchdetail, unmatched
body.dashboard-light          → light mode (layout + light colors)
body.dashboard-light
  .dashboard-dark             → dark mode (layout from light, colors overridden to dark)
```

### Body classes per page

| Page | Light mode | Dark mode |
|---|---|---|
| Dashboard | `dashboard-light` | `dashboard-light dashboard-dark` |
| Teams | `dashboard-light` | `dashboard-light dashboard-dark` |
| Matches | `dashboard-light` | `dashboard-light dashboard-dark` |
| Settings / Alliance / PickStrat | `dashboard-light` | `dashboard-light dashboard-dark` |
| Team Detail / Match Detail | *(none)* | *(none — always dark)* |

### Light mode token overrides (`body.dashboard-light`)

```css
body.dashboard-light {
  --bg:            #e8e4dc;
  --surface:       #ffffff;
  --surface2:      #f0ece4;
  --surface3:      #e6e1d8;
  --border:        rgba(0,0,0,0.13);
  --border-hover:  rgba(0,0,0,0.22);
  --text:          #111111;
  --text-soft:     #444444;
  --text-muted:    #808080;
  --accent:        #dc2626;
  --accent-dim:    rgba(220,38,38,0.10);
  --accent-border: rgba(220,38,38,0.25);
  --green:         #16a34a;
  --c-red:         #dc2626;
  --c-blue:        #2563eb;
  --c-amber:       #b45309;
  --sans:          'Inter', sans-serif;
}
```

### Dark mode token overrides (`body.dashboard-dark`)

Restores all variables to the `:root` dark values. Also explicitly overrides hardcoded sidebar colors set by `dashboard-light`, the hero gradient, alliance chip colors, and status dots. Key values:

```css
body.dashboard-dark {
  --bg:            #0a0a0a;
  --surface:       #111111;
  --surface2:      #1a1a1a;
  --text:          #ededed;
  --text-soft:     #888888;
  --text-muted:    #505050;
  --accent:        #ef4444;
  --accent-dim:    rgba(239,68,68,0.10);
  --accent-border: rgba(239,68,68,0.25);
  --green:         #4ade80;
  --c-red:         #fda4af;   /* pastel on dark */
  --c-blue:        #93c5fd;   /* pastel on dark */
  --c-amber:       #facc15;
  --sans:          'IBM Plex Sans', sans-serif;
}
```

### Theme toggle

A `◑ / ☀` button in the sidebar footer calls `toggleTheme()` in `script.js`. The `darkMode` boolean persists for the session; the active page re-applies its class set on each navigation.
