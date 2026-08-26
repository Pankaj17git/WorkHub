# Sticker Market — Style Reference
> White-canvas marketplace with sticker-energy service cards and illustrated tools.

**Theme:** light

Bright Sticker builds WorkHub on a near-white canvas (#FAFAF8) where each service card reads like a friendly sticker, bold outlined icon, category label, and a muted fill that pops without shouting. The hero search bar sits in front of a loose illustration of tools scattered at playful angles, all contained in a soft-rounded panel. Satoshi at 700 keeps the headline punchy and young; Manrope handles body copy with approachable warmth. The tension: it looks consumer-playful enough to invite a first-timer, but the clean white grid and tight copy keep it functional, not frivolous.

**Ground truth (computed from tokens + reference HTML):** light theme · page #f4eee4 · ink #2a2a2a · primary #f5a623 · secondary #3b82f6 · applied action color #3b82f6 · display "Satoshi" · body "Manrope". Where the description above conflicts with these values or the Reference HTML, the tokens and HTML are authoritative.

## Tokens: Colors

| Name | Value | Token | Role | Usage | Contrast |
|------|-------|-------|------|-------|----------|
| Canvas | `#f4eee4` | `--gesso-canvas` | Page background, the floor everything sits on. | Outermost background: body, full-bleed sections. Mirrors Neutral 50. | n/a |
| Surface recessed | `#eae4db` | `--gesso-surface-recessed` | Sunken surface below the canvas. | Inset wells: input fields, progress tracks, code blocks. | n/a |
| Surface | `#ffffff` | `--gesso-surface` | Card and panel fill, raised above the canvas. | Cards, panels, sheets, table rows. Mirrors Neutral 100. | n/a |
| Surface elevated | `#f5f5f5` | `--gesso-surface-elevated` | Top elevation tier. | Modals, dropdowns, popovers, tooltips. | n/a |
| Divider | `rgba(0,0,0,0.04)` | `--gesso-divider` | Hairline borders and separators. | 1px rules between rows and sections. Never for text. | n/a |
| Foreground | `#2a2a2a` | `--gesso-fg` | Primary text and high-emphasis icons. | Body copy, headings, primary icons. Mirrors Neutral 900. | AA 4.5:1 on canvas (guaranteed) |
| Foreground muted | `#606060` | `--gesso-fg-muted` | Secondary text. | Captions, metadata, placeholders, disabled labels. Mirrors Neutral 600. | AA 3.0:1 on canvas (guaranteed) |
| Primary | `#f5a623` | `--gesso-primary` | Brand accent, FILL only (alias: --gesso-accent). | CTA fills, active and selected states, focus rings. 2 to 3 per screen. Do NOT use as text, reach for --gesso-accent-text. | Pair with --gesso-on-accent for the label on top. |
| On primary | `#000000` | `--gesso-on-accent` | Text and icons on a filled primary. | Label color for buttons and chips filled with --gesso-primary. | Contrast-derived against --gesso-primary. |
| Accent (as text) | `#875b13` | `--gesso-accent-text` | AA-safe accent for text and icons. | Use THIS for accent-colored links, headings, and icons. Use --gesso-primary for fills. | AA 4.5:1 on canvas (guaranteed). |
| Secondary | `#3b82f6` | `--gesso-secondary` | Supporting brand accent. | Secondary fills, logo discs, supporting highlights. | Pair with on-fill text per --gesso-on-accent. |
| Secondary (as text) | `#2f68c5` | `--gesso-accent-2-text` | AA-safe secondary for text. | Secondary accent used as text or icons. | AA 4.5:1 on canvas (guaranteed). |
| Neutral 50 | `#f4eee4` | `--gesso-neutral-50` | Page background. | Ramp access by step; prefer the role token above where one exists. | n/a |
| Neutral 100 | `#ffffff` | `--gesso-neutral-100` | Surface. | Ramp access by step; prefer the role token above where one exists. | n/a |
| Neutral 200 | `#dddddd` | `--gesso-neutral-200` | Neutral ramp step. | Ramp access by step; prefer the role token above where one exists. | n/a |
| Neutral 300 | `#bcbcbc` | `--gesso-neutral-300` | Neutral ramp step. | Ramp access by step; prefer the role token above where one exists. | n/a |
| Neutral 400 | `#9c9c9c` | `--gesso-neutral-400` | Neutral ramp step. | Ramp access by step; prefer the role token above where one exists. | n/a |
| Neutral 500 | `#7d7d7d` | `--gesso-neutral-500` | Neutral ramp step. | Ramp access by step; prefer the role token above where one exists. | n/a |
| Neutral 600 | `#606060` | `--gesso-neutral-600` | Muted text and dividers. | Ramp access by step; prefer the role token above where one exists. | AA 3.0:1 on canvas. |
| Neutral 700 | `#4d4d4d` | `--gesso-neutral-700` | Neutral ramp step. | Ramp access by step; prefer the role token above where one exists. | n/a |
| Neutral 800 | `#3b3b3b` | `--gesso-neutral-800` | Neutral ramp step. | Ramp access by step; prefer the role token above where one exists. | n/a |
| Neutral 900 | `#2a2a2a` | `--gesso-neutral-900` | Primary text. | Ramp access by step; prefer the role token above where one exists. | AA 4.5:1 on canvas. |
| Neutral 950 | `#252525` | `--gesso-neutral-950` | Neutral ramp step. | Ramp access by step; prefer the role token above where one exists. | n/a |
| Success | `#149343` | `--gesso-success` | Positive signals (gains, completed states). | Meaning only, never decoration. | AA 3.0:1 on canvas, chroma-floored distinct. |
| Warning | `#c36b05` | `--gesso-warning` | Caution states. | Meaning only, never decoration. | AA 3.0:1 on canvas, chroma-floored distinct. |
| Error | `#DC2626` | `--gesso-error` | Errors, destructive actions, negative signals. | Meaning only, never decoration. | AA 3.0:1 on canvas, chroma-floored distinct. |
| Data 1 | `#004cb7` | `--gesso-data-1` | Categorical data-viz series color. | Charts and series, applied in order. | n/a |
| Data 2 | `#1d64d6` | `--gesso-data-2` | Categorical data-viz series color. | Charts and series, applied in order. | n/a |
| Data 3 | `#377ef1` | `--gesso-data-3` | Categorical data-viz series color. | Charts and series, applied in order. | n/a |
| Data 4 | `#5c99ff` | `--gesso-data-4` | Categorical data-viz series color. | Charts and series, applied in order. | n/a |
| Data 5 | `#87b5ff` | `--gesso-data-5` | Categorical data-viz series color. | Charts and series, applied in order. | n/a |
| Data 6 | `#b2cfff` | `--gesso-data-6` | Categorical data-viz series color. | Charts and series, applied in order. | n/a |

## Tokens: Typography

### Satoshi — Display. Headings, hero copy, large numerical specimens. · `--gesso-font-display`
- **Weights:** 400, 500, 600, 700
- **Line height:** 1.1
- **Letter spacing:** -0.02em
- **Role:** Display. Headings, hero copy, large numerical specimens.

### Manrope — Body. Paragraphs, labels, UI chrome. · `--gesso-font-body`
- **Weights:** 400, 500, 600, 700
- **Line height:** 1.5
- **Letter spacing:** 0em
- **Role:** Body. Paragraphs, labels, UI chrome.

### Manrope — Mono. Code, numerical tickers, mono-spaced metadata. · `--gesso-font-mono`
- **Weights:** 400, 500, 600, 700
- **Line height:** 1.4
- **Letter spacing:** 0em
- **Role:** Mono. Code, numerical tickers, mono-spaced metadata.

### Type Scale

| Role | Size | Line Height | Letter Spacing | Token |
|------|------|-------------|----------------|-------|
| H1 | 48px | 1.2 | — | `--gesso-text-4xl` |
| H2 | 32px | 1.2 | — | `--gesso-text-3xl` |
| H3 | 24px | 1.2 | — | `--gesso-text-2xl` |
| Body | 16px | 1.5 | — | `--gesso-text-base` |
| Caption | 12px | 1.5 | — | `--gesso-text-xs` |

## Tokens: Spacing & Shapes

**Base unit:** 8px

**Density:** comfortable

### Spacing Scale

| Name | Value | Token |
|------|-------|-------|
| space-1 | 8px | `--gesso-space-1` |
| space-2 | 16px | `--gesso-space-2` |
| space-3 | 24px | `--gesso-space-3` |
| space-4 | 32px | `--gesso-space-4` |
| space-6 | 48px | `--gesso-space-6` |
| space-8 | 64px | `--gesso-space-8` |
| space-12 | 96px | `--gesso-space-12` |
| space-16 | 128px | `--gesso-space-16` |
| space-24 | 192px | `--gesso-space-24` |
| space-32 | 256px | `--gesso-space-32` |

### Border Radius

| Element | Value |
|---------|-------|
| none | 0px |
| sm | 4px |
| md | 8px |
| lg | 12px |
| full | 9999px |

### Shadows

| Name | Value | Token |
|-------|--------|-------|
| sm | `none` | `--gesso-shadow-sm` |
| md | `none` | `--gesso-shadow-md` |
| lg | `0 1px 2px rgba(0,0,0,0.04)` | `--gesso-shadow-lg` |

### Layout

- **Page max-width:** 1280px
- **Section gap:** 80px
- **Container max-width:** 1280px
- **Grid columns:** 12
- **Grid gutter:** 24px
- **Outer margin:** 64px
- **Section padding:** 80px

## Breakpoints

| Name | Min Width |
|------|-----------|
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |

## Components

### Container
**Role:** Page-level width constraint and 12-column grid wrapper.

Max-width var(--container-max-width) (1280px), centered via margin-inline auto, horizontal padding var(--outer-margin) (64px; drop to 24-32px below the md breakpoint). Vertical rhythm var(--section-padding) (80px) per band. Multi-column regions use display:grid with grid-template-columns: repeat(var(--grid-columns), 1fr) (12) and gap var(--grid-gutter) (24px); children span column ranges (span 6 = half, span 4 = third).

### Navigation Bar
**Role:** Top-anchored primary navigation. One per page.

Full-bleed bar, height 64-72px, inner contents constrained to var(--container-max-width) with var(--outer-margin) inline padding. Logo left, primary links centered or left-grouped, one primary CTA right. Links in --gesso-font-body weight 400, color --gesso-neutral-700 (#4A4A40); hover/active resolve to --gesso-neutral-900 (#2a2a2a). CTA is the Primary Button. Transparent over a hero, then sticky with a --gesso-neutral-50 (#f4eee4) fill and 1px --gesso-neutral-200 bottom border once scrolled. z-index 100.

### Hero Section
**Role:** Above-the-fold headline band. Sets the first impression.

Fills the upper 55-70% of the viewport with var(--section-padding) vertical breathing room, constrained to the Container. Headline in --gesso-font-display (Satoshi) at 3rem, weight 700, line-height 1.05-1.1, never italic. Subcopy in body font at --gesso-text-lg, color --gesso-neutral-600 (#6b6b6b), max-width ~60ch. Primary + Secondary Button pair beneath. Left-aligned for a marketing scroll, centered for a landing hero.

### Card
**Role:** Container surface for content groupings.

Background --gesso-neutral-50 (#f4eee4), border 1px solid --gesso-neutral-200 (#E8E8E0), border-radius var(--gesso-radius-md) (8px), padding 48px, --gesso-shadow-sm. Body font for content; display font for any embedded headline. Text fg --gesso-neutral-900 (#2a2a2a). In a grid, cards span 3-6 of the 12 columns.

### Primary Button
**Role:** Highest-emphasis action. Reserved for the main CTA per section.

Background --gesso-primary (#f5a623), text auto-picked for max contrast (white or near-black), padding 24px 48px, border-radius var(--gesso-radius-md) (8px), font-family --gesso-font-body, font-weight 600. Hover: mix toward --gesso-fg by 10-12%. Use 1-2 per section, never more. The reference screen applies #3b82f6 as its dominant on-screen action color; follow the Reference HTML for color application.

### Secondary Button
**Role:** Supporting action next to a primary CTA.

Background transparent, border 1.5px solid --gesso-primary (#f5a623), text --gesso-primary, padding 24px 48px (minus 1.5px each axis to compensate for the border), border-radius var(--gesso-radius-md) (8px), body font, weight 600.

### Input
**Role:** Single-line text entry. Default form field.

Background --gesso-neutral-100 (#ffffff), border 1px solid --gesso-neutral-300 (#D4D4C8), border-radius var(--gesso-radius-md) (8px), padding 24px 32px, body font. Focus: border --gesso-primary, ring 3px --gesso-primary at 14% alpha.

### Footer
**Role:** Page-closing navigation and legal. One per page.

Full-bleed block with a top 1px --gesso-neutral-200 (#E8E8E0) divider, var(--section-padding) vertical padding, contents constrained to var(--container-max-width). Multi-column link groups (grid, 2-4 columns): group headings at body weight 600, links --gesso-neutral-600 (#6b6b6b) resolving to --gesso-neutral-900 on hover. Logo and copyright row pinned along the bottom.

### Badge
**Role:** Compact label for status, tags, counts.

Background --gesso-primary (#f5a623) at 12% alpha, text --gesso-primary, padding 16px 24px, border-radius var(--gesso-radius-full) (9999px), font-size 12px, body font, weight 600, uppercase, letter-spacing 0.04em.

## Do's and Don'ts

### Do

- One geometric/humanist sans does almost everything; mono reserved for code surfaces (dark vibe). Big confident display weights (700-800) for hero numbers and codes, regular 400-500 body, muted secondary labels uppercase-tracked small caps for field headers. Tight display tracking, normal body.
- Tone-parametric ROLES extracted from the chosen vibe, NEVER hardcoded: canvas = the lightest neutral, often subtly tinted (warm sand, cool ink-navy); surface = a plane derived from canvas, lifted via blur+shadow rather than a flat lighter fill.
- Web (1280) keeps the depth posture: content stacked as discrete elevated groups rather than edge-to-edge lists. 8px spacing rhythm, generous gutters.
- Apply --gesso-primary (#f5a623) to a maximum of 2-3 elements per screen: a button, a highlight, a badge. Never paint large areas with primary.
- Use --gesso-radius-md (8px) for cards and inputs, --gesso-radius-full for badges and avatars. Inner radii inside a parent: subtract the parent's padding from its radius.
- Build hierarchy with the neutral scale, not extra hues. 90%+ of any screen should be neutrals; chromatic colors carry meaning, never decoration.

### Don't

- Never use a single flat box-shadow as the only depth cue.
- Never replace material depth with 1px gray borders or flat outlined cards alone.
- Don't use Inter as the display font. Use Satoshi (display) / Manrope (body).
- Don't use #3B82F6 as primary unless explicitly briefed — it is the secondary here.

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 0 | Page | `#f4eee4` | Default page background. The lightest surface. |
| 1 | Raised | `#ffffff` | Cards, panels, sidebars: anything that sits on top of the page. |
| 2 | Sunken | `#E8E8E0` | Inset surfaces (search bars, code blocks, disabled fields). |
| 3 | Overlay | `#f4eee4` | Modals and floating panels. Same hue as page; depth comes from --gesso-shadow-lg. |

## Agent Prompt Guide

**Quick Color Reference**

- Primary: #f5a623
- Secondary: #3b82f6
- Page bg: #f4eee4
- Body fg: #2a2a2a
- Muted fg: #606060
- Success: #149343

**Example Component Prompts**

1. Build a content container. max-width 1280px, margin-inline auto, padding-inline 64px (24px below md). Wrap every section so the page shares one measure.
2. Build a responsive top navigation bar. Full-bleed, height 64-72px. Logo left, links centered, primary CTA right (bg #f5a623, weight 600). Collapse links below 768px.
3. Build a hero band. Headline Satoshi 3rem weight 700; subcopy Manrope max-width 60ch color #6b6b6b; primary + secondary CTA row beneath.
4. Build a responsive service-card grid. Cards span 3 columns desktop, 2 at md, stacked below sm.
5. Build a footer. Full-bleed with top 1px divider, 3-4 link-group columns, logo + copyright row pinned bottom.

## Quick Start

### CSS Custom Properties

```css
:root {
  /* Colors */
  --gesso-canvas: #f4eee4;
  --gesso-surface-recessed: #eae4db;
  --gesso-surface: #ffffff;
  --gesso-surface-elevated: #f5f5f5;
  --gesso-divider: rgba(0,0,0,0.04);
  --gesso-fg: #2a2a2a;
  --gesso-fg-muted: #606060;
  --gesso-primary: #f5a623;
  --gesso-on-accent: #000000;
  --gesso-accent-text: #875b13;
  --gesso-secondary: #3b82f6;
  --gesso-accent-2-text: #2f68c5;
  --gesso-success: #149343;
  --gesso-warning: #c36b05;
  --gesso-error: #DC2626;

  /* Typography */
  --gesso-font-display: 'Satoshi', ui-sans-serif, system-ui, sans-serif;
  --gesso-font-body: 'Manrope', ui-sans-serif, system-ui, sans-serif;

  /* Layout */
  --container-max-width: 1280px;
  --grid-gutter: 24px;
  --outer-margin: 64px;
  --section-padding: 80px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Shadows */
  --gesso-shadow-sm: none;
  --gesso-shadow-md: none;
  --gesso-shadow-lg: 0 1px 2px rgba(0,0,0,0.04);
}
```

## Motion Tokens

```json
{
  "motion": {
    "easing": {
      "default": "cubic-bezier(0.25, 0.1, 0.25, 1)",
      "emphasis": "cubic-bezier(0.34, 1.56, 0.64, 1)"
    },
    "duration": { "base": "200ms", "fast": "100ms", "slow": "360ms" }
  }
}
```

## Implementation in this repo

The landing page (`client/app/page.tsx`) implements this system:

- Fonts loaded via Fontshare (Satoshi) + Google Fonts (Manrope) in `app/layout.tsx`.
- Gesso tokens defined globally in `app/globals.css`.
- Page-scoped styles in `app/landing.css` (prefixed `.whl-` to avoid collisions).
- Customer-first flow: hero CTAs target customers ("Find a Worker" → `/search`); becoming a worker is a secondary action ("Offer Your Skills" → `/signup?role=WORKER`) which opens signup with the Worker account type preselected, leading into worker profile creation.
