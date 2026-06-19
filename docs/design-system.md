# AI-SKILL Design System

This document captures the visual language used by the AI-SKILL static frontend. It is the single source of truth for colors, typography, spacing, components, motion, and accessibility rules. Any new UI should reuse the tokens in `frontend/src/style.css` rather than inventing one-off values.

## Design principles

- **Local first, no noise.** The UI gets out of the way so the skills and repos are readable.
- **Warm, high-contrast, but not loud.** Orange is the only accent; everything else is warm neutrals.
- **Motion is functional, not decorative.** Animations guide attention and then stop.
- **Accessible by default.** Focus states are always visible, color is never the only signal, and text meets WCAG AA.

## Color tokens

Colors are defined as CSS custom properties and switch automatically with `prefers-color-scheme`.

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--bg` | `#fafaf7` | `#161514` | Page background |
| `--bg-elev` | `#ffffff` | `#1f1d1b` | Cards, inputs, buttons |
| `--bg-elev-2` | `#f5f3ed` | `#262422` | Hover / secondary surfaces |
| `--bg-deep` | `#f0eee8` | `#0d0c0b` | Code blocks, table headers |
| `--ink` | `#1a1816` | `#ece9e2` | Primary text |
| `--ink-soft` | `#4d4a45` | `#c8c4ba` | Secondary text / descriptions |
| `--ink-mute` | `#8a857c` | `#8a857c` | Meta text, placeholders |
| `--ink-faint` | `#b8b3a9` | `#5a5750` | Borders of disabled elements |
| `--border` | `#e6e2d8` | `#2d2a26` | Default borders |
| `--border-strong` | `#d0ccbf` | `#3d3935` | Hover borders |
| `--accent` | `#ff5b1f` | `#ff7a47` | Primary actions, links, brand mark |
| `--accent-soft` | `#ffe7dc` | `#4a1f0d` | Hero glow, selected lang background |
| `--accent-ink` | `#c43b00` | `#ff9a73` | Link text in light mode |
| `--ok` | `#2c7a3e` | `#7ed491` | Success / vendor-neutral chip |
| `--warn` | `#b46a00` | `#f0b76a` | Warning, beta/alpha quality |
| `--err` | `#b91c1c` | `#ff7e7e` | Errors, error-state borders |

### Contrast notes

- `--ink` on `--bg` and `--bg-elev` exceeds WCAG AA (and AAA for large text).
- `--accent` on white exceeds 3:1, so it is used for large text, buttons, and graphics — never for small body copy.
- `--ink-soft` is reserved for secondary text and always paired with `--bg-elev` or `--bg` where it passes AA.

## Typography

### Font stacks

| Token | Stack | Usage |
|-------|-------|-------|
| `--font-ui` | Inter, system sans, PingFang SC, Microsoft YaHei | Body, navigation, buttons |
| `--font-disp` | Fraunces, Songti SC, Georgia | Display titles, headings |
| `--font-mono` | JetBrains Mono, SF Mono, Menlo | Slugs, code, stats, chips |

### Type scale

| Token | Size | Usage |
|-------|------|-------|
| `--t-xs` | `12px` | Chips, labels, mono captions |
| `--t-sm` | `13px` | Card meta, buttons, footer |
| `--t-base` | `15px` | Base body size |
| `--t-md` | `17px` | Lead text, card names |
| `--t-lg` | `20px` | Group titles |
| `--t-xl` | `26px` | Page titles on mobile |
| `--t-2xl` | `34px` | Page titles |
| `--t-display` | `clamp(40px, 6vw, 64px)` | Hero display title |

### Line height

- `--lh-tight: 1.15` for display type.
- `--lh-snug: 1.3` for headings.
- `--lh-base: 1.55` for body copy and Chinese text.

## Spacing scale

Based on an 8 px grid with a 4 px half-step.

| Token | Value |
|-------|-------|
| `--s-1` | `4px` |
| `--s-2` | `8px` |
| `--s-3` | `12px` |
| `--s-4` | `16px` |
| `--s-5` | `24px` |
| `--s-6` | `32px` |
| `--s-7` | `48px` |
| `--s-8` | `64px` |
| `--s-9` | `96px` |

## Components

### Cards

#### Skill card (`.skill-card`)

- Background: `--bg-elev`, 1 px `--border`, `10px` radius.
- Left 4 px stripe in `--cat-color` (set inline from JS), grows to 6 px on hover/focus.
- Hover: `translateY(-2px)`, stronger border, `--shadow-2`.
- Entrance animation `.skill-card--enter` runs once on first paint only, staggered by `--i`.

#### External card (`.external-card`)

- Same base as skill card.
- Top 4 px stripe in `hsl(var(--vendor-hue) 65% 50%)`.
- Compact meta grid inside `--bg-deep`.
- Archived cards use `.external-card--archived` and show an `.ext-archived-badge`.

### Buttons

Base class `.btn`:

- Background: `--bg-elev`, border `--border`, radius `--radius-2`.
- Min height `36px` (`44px` on touch devices).
- Hover: darker border and background.
- Active: `scale(0.98)`.
- Primary variant `.btn--primary`: accent background, white text.
- Focus: visible `2px` accent outline with `2px` offset.

### Chips

Base class `.chip`:

- Pill shape, mono font, `10px` size.
- Border in current color; no background fill.
- Platform chips use vendor-specific colors (`.chip--claude`, `.chip--codex`, `.chip--cursor`, `.chip--continue`).
- Quality chips use `.chip--quality-*` and a dashed border for non-stable states.

### Empty / error states

| Class | Purpose |
|-------|---------|
| `.empty-state` | No results, empty lists, unknown routes |
| `.error-state` | Load failures, bundle failures |
| `.brand-mark` | Decorative geometric mark used inside empty/error states |

Both states are centered, use `--bg-elev`, rounded corners, and a decorative `.brand-mark`. Error states add a red border and red text.

## Motion principles

### Durations

| Token | Value | Use |
|-------|-------|-----|
| `--dur-fast` | `120ms` | Hover, focus, color transitions |
| `--dur-med` | `200ms` | Card lift, border/shadow transitions |
| `--dur-slow` | `320ms` | Larger surface changes |

### Easing

- `--ease-out: cubic-bezier(0.2, 0.8, 0.2, 1)` for entrances and hovers.
- `--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)` for pulse and looping marks.

### Rules

- Entrance animations run **once** on first paint; filtering does not re-trigger them.
- Stagger is capped at the first 16 items (`--i` clamped to 15) to avoid jank on long lists.
- All motion respects `prefers-reduced-motion: reduce`.
- No infinite animations except the subtle 404 brand pulse, and it stops under reduced motion.

## Accessibility rules

- **Focus:** Every interactive element has a visible `:focus-visible` outline (`2px solid var(--accent)`, `2px` offset). Do not hide outlines without replacing them with an equivalent visible indicator.
- **Skip link:** The first focusable element on every page is `.skip-link`, which jumps to `#main`.
- **Live regions:** Search/filter results are announced through an `aria-live="polite"` region so screen-reader users know when the result set changes.
- **Color:** Never rely on color alone. Quality chips combine dashed borders with color; the review dot is accompanied by a `title`/`aria-label`.
- **Touch targets:** All buttons, nav links, and list rows are at least `44px` tall on coarse-pointer devices.
- **Language:** The `<html lang>` attribute and all `data-i18n` meta tags update when the locale changes.
- **Reduced motion:** All animations and transitions collapse to `0.01ms` when the user prefers reduced motion.

## Responsive breakpoints

The layout is fluid from `320px` to `1440px`.

| Breakpoint | Changes |
|------------|---------|
| `≤480px` | Single-column cards, stacked filters, smaller hero type, tighter padding (`12px`), compact tables |
| `≤720px` | 2-column stats, wrapped external toolbar, larger touch targets, single-column related grid |
| `≤960px` | Header nav reduces gap; bundle list rows wrap |
| `≥1440px` | Content stays capped at `1180px` centered; no horizontal scroll |

Always test with DevTools from `320px` to `1440px` after changing layout or adding content that may overflow (tables, code blocks, long slugs).
