---
name: Modern Professional Marketplace
colors:
  surface: '#ffffff'
  surface-dim: '#f1f5f9'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d5e3fc'
  on-surface: '#0d1c2e'
  on-surface-variant: '#45474c'
  inverse-surface: '#233144'
  inverse-on-surface: '#eaf1ff'
  outline: '#75777d'
  outline-variant: '#c5c6cd'
  surface-tint: '#545f73'
  primary: '#091426'
  on-primary: '#ffffff'
  primary-container: '#1e293b'
  on-primary-container: '#8590a6'
  inverse-primary: '#bcc7de'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#001815'
  on-tertiary: '#ffffff'
  tertiary-container: '#002f2a'
  on-tertiary-container: '#28a094'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e3fb'
  primary-fixed-dim: '#bcc7de'
  on-primary-fixed: '#111c2d'
  on-primary-fixed-variant: '#3c475a'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#89f5e7'
  tertiary-fixed-dim: '#6bd8cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#005049'
  background: '#f8f9ff'
  on-background: '#0d1c2e'
  surface-variant: '#d5e3fc'
  primary-dark: '#0f172a'
  warning-urgent: '#d97706'
  text-main: '#0f172a'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
  unit-xs: 0.25rem
  unit-sm: 0.5rem
  unit-md: 1rem
  unit-lg: 1.5rem
  unit-xl: 3rem
---

## Brand & Style

The design system is defined by a **Corporate / Modern** aesthetic that emphasizes high-precision and authoritative tech-forwardness. It moves away from the softer indigo/orange tones toward a high-contrast, sophisticated palette that suggests a premium, enterprise-grade marketplace.

The visual narrative is built on:
- **High-Contrast Professionalism:** Crisp navy and white backgrounds create a "Wall Street meets Silicon Valley" atmosphere.
- **Sophisticated Technicality:** Use of sharp typography and subtle tonal depth to communicate efficiency and reliability.
- **Architectural Clarity:** A focus on structured layouts and clearly defined information hierarchies to facilitate rapid decision-making for high-stakes hiring.

The target audience is refined: enterprise procurement managers and elite technical talent who expect a tool that feels as powerful and stable as the services they are trading.

## Colors

The palette is strategically weighted to favor high-contrast "Navy & White" pairings, providing a foundation of stability.

- **Primary (Navy Blue):** Used for navigation bars, primary headers, and foundational structural elements. 
- **Accent (Royal Blue):** Reserved for interactive states, primary action buttons, and focused borders. It provides a modern "tech" spark against the serious navy background.
- **Success/Verified (Teal):** Used for trust signals, "Verified" badges, and positive status indicators. The move from emerald to teal aligns with the cooler, more modern corporate feel.
- **Warning/Urgent (Amber):** Used for limited-time offers, urgent notifications, or expiring contracts.
- **Neutrals:** The `text-main` (#0f172a) ensures maximum legibility, while `surface-dim` (#f1f5f9) provides a subtle background contrast to help white cards pop.

## Typography

The system pairs **Hanken Grotesk** with **Geist** to bridge the gap between human accessibility and technical precision.

- **Hanken Grotesk** handles the heavy lifting for all marketing and primary content. It should be set with tighter letter-spacing in headlines for a modern, impactful look.
- **Geist** is used specifically for metadata, technical specifications, and labels. Its technical, slightly monospaced character provides a clear visual distinction for "hard data" like dates, pricing, and skill tags.
- **Contrast:** Always use `#0f172a` for primary headlines and `#475569` for secondary body copy to maintain a clear visual hierarchy.

## Layout & Spacing

The layout follows a **Fixed Grid** model on desktop to preserve a controlled, high-end reading experience that feels curated rather than sprawling.

- **Grid:** A 12-column system with 24px gutters. Core content is centered within a 1280px container.
- **Rhythm:** Spacing units are strictly based on a 4px/8px scale. Use `unit-lg` (24px) for vertical separation between distinct content sections and `unit-md` (16px) for internal card padding.
- **Mobile Adaptation:** On mobile, margins reduce to 16px and all grid columns collapse into a single vertical stack. Marketplace cards transition from a horizontal to a vertical orientation to prioritize the profile image and primary CTA.

## Elevation & Depth

This design system uses **Tonal Layers** supplemented by **Low-Contrast Outlines** to define hierarchy, avoiding heavy drop shadows to maintain a clean, corporate aesthetic.

- **Surface Levels:** 
  - The main background uses `surface-dim` (#f1f5f9). 
  - Primary content cards use `surface` (#ffffff) with a subtle 1px border (#e2e8f0).
- **Interactive Depth:** On hover, cards do not lift significantly; instead, the border color shifts to the Royal Blue accent, and a very soft, diffused shadow (`0px 4px 6px -1px rgba(0, 0, 0, 0.05)`) is applied.
- **Overlays:** Modals and dropdowns use a crisp white background with a slightly more aggressive shadow to indicate they sit atop the primary interface.

## Shapes

The shape language is "Structured & Clean." 

- **Standard Radius:** Elements like input fields and small buttons use a 0.5rem (8px) radius to maintain a modern look without feeling too "bubbly."
- **Container Radius:** Larger components like marketplace cards or modal containers use 1rem (16px) to provide enough rounding to feel approachable.
- **Pills:** Status indicators, "Verified" badges, and tags use a fully rounded (pill) shape to clearly distinguish them from interactive button elements.

## Components

- **Buttons:**
  - *Primary:* Navy Blue (#1e293b) with white text. On hover, background shifts to Primary Dark (#0f172a).
  - *Action:* Royal Blue (#2563eb) for "Apply" or "Book" triggers.
  - *Outline:* Transparent background with Navy Blue border and text.
- **Input Fields:** Use a white surface with a 1px #e2e8f0 border. On focus, the border becomes Royal Blue with a subtle 2px outer glow in the same color (20% opacity).
- **Badges:**
  - *Verified:* Teal (#0d9488) background with white text, or 10% Teal tint with solid Teal text for a softer look.
  - *Urgent:* Amber (#d97706) background with white text.
- **Marketplace Cards:** Feature a white background, 1px border, and Geist-font labels for price and ratings. Use the Royal Blue accent for the user's name or title to draw the eye.
- **Skill Chips:** Subtle `surface-dim` background with `secondary-text` (#475569) to keep them secondary to the main CTA.