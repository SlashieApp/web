---
name: slashie-design
description: >-
  Applies Slashie UI design tokens, component patterns, interactions,
  marketplace page patterns, and accessibility rules. Use when building or
  changing UI, styling pages, adding components, landing sections, dashboards,
  task cards, quote flows, forms, badges, navigation, or when the user mentions
  Slashie design, DESIGN.md, brand look-and-feel, or UI design tokens.
---

# Slashie UI Design

## Source of truth

Follow the current wiki notes:

- `02-Engineering/Slashie-Brand-Design.md`
- `02-Engineering/Slashie-Design-Tokens.md`
- `01-Product/FE-Page-Inventory-and-Design-Briefs.md`

## 1. Executive summary

Slashie is a map-first local services marketplace connecting:

- **Customers** who post local tasks
- **Workers** who browse nearby tasks and send quotes

The UI should make task discovery, quote comparison, and account actions fast, clear, and trustworthy on mobile and desktop.

The design direction is:

- Modern
- Map-native
- High-legibility
- Clean and trustworthy
- Green/mint-led, not blue or amber

## 2. Design north star

Slashie treats the screen as a local marketplace viewport:

- The map is foundational context.
- Task cards and quote surfaces should be compact and scannable.
- Interface elements should feel purposeful, not decorative.
- Typography, spacing, and tonal surfaces should do most of the hierarchy work.

Core principle: clarity over decoration.

## 3. Brand identity

- Primary logo: green rounded square with white slash/dollar-style mark.
- Wordmark: lowercase `slashie`.
- Brand accent: green/mint.
- Tone: practical, local, clean, confident, money-aware.

Use the slash motif where meaningful, but do not over-decorate the interface.

## 4. Color system

Use current Slashie tokens.

| Token | Value | Use |
|---|---:|---|
| `primary.green` | `#00DC82` | Main brand accent, CTAs, active states |
| `green.600` | `#00AB63` | Pressed states, strong green emphasis |
| `green.500` | `#53D388` | Secondary highlights, map pins |
| `green.300` | `#92E7B7` | Soft fills, progress backgrounds |
| `green.100` | `#D9F4E5` | Pale success/brand containers |
| `neutral.900` | `#0B1714` | Primary text, dark nav, strong icons |
| `neutral.700` | `#3F4B45` | Secondary text |
| `neutral.500` | `#6B7370` | Metadata, placeholders |
| `neutral.300` | `#D1D5D4` | Subtle separators and input strokes |
| `neutral.100` | `#F7F9F8` | Page background |
| `white` | `#FFFFFF` | Cards and elevated surfaces |

## 5. Theme guidance

Default product UI is light:

- White cards
- Pale neutral backgrounds
- Green primary actions
- Compact metadata
- Clear map-first layout

Dark surfaces may be used for navigation, brand scenes, or high-contrast UI moments. Do not invent a full dark theme unless explicitly requested or already supported by the app.

If a dark variant is created, verify tokens, states, contrast, and interaction feedback.

## 6. Surface hierarchy

Prefer tonal layering over heavy borders:

- `surface`
- `surface-container-low`
- `surface-container-lowest`
- `surface-container-high`
- `surface-container-highest`
- `primary-container`

Avoid 1px borders as the main sectioning method. Use whitespace, radius, tonal shifts, and compact shadows first.

## 7. Typography

- **Plus Jakarta Sans**: display, hero, and headline moments.
- **Inter**: product UI, labels, dense body content, metadata.

Use strong hierarchy:

- Clear page titles
- Compact card titles
- Short metadata rows
- Small labels for scanability

## 8. Core components

### Buttons

- Primary: green filled button with white text.
- Secondary: quiet white, outlined, or pale green treatment.
- Ghost: text/icon-only action.
- Icon: compact circular or square action.

Primary actions should be visually obvious and green.

### Cards

Task and quote cards should be compact, scannable, and marketplace-focused.

Task cards should usually include:

- Thumbnail or category image
- Task title
- Distance/location metadata
- Timing metadata
- Price or budget
- Category/status tags
- Primary action such as `View details`

Quote cards should usually include:

- Worker avatar
- Worker name
- Rating or trust signal
- Quote price
- Message preview
- Relevant actions

### Inputs

- White or pale neutral field
- Clear placeholder
- Green focus state
- Clear success/error states
- Minimal visual noise

### Badges and tags

Use badges for task state, quote metadata, category, urgency, completion, and verification.

Green is for active, selected, successful, money, worker/customer matching, or progress moments.

## 9. Map-first behavior

Map UI should feel integrated with the product:

- Use green price/location pins.
- Keep floating controls legible.
- Do not block too much geography.
- Use bottom sheets on mobile for selected tasks.
- Prefer compact preview cards over large duplicated content.

## 10. Page behavior

Slashie pages should not create separate designs for every account role.

Use one shared page where account status and permissions reveal more or less action.

Example: `/task/[slug]`

- Visitors see public-safe task details and sign-in/register prompts.
- Registered workers can see quote actions when eligible.
- The customer who owns the task can see owner-only quote comparison and accept actions.
- Private address/contact details must not appear in public visitor state.

## 11. Payment copy

Slashie does not process payments in the current product direction.

Payment copy must say payment is arranged directly between customer and worker outside Slashie.

Do not imply escrow, platform-held payment, card capture, or in-app payout unless the product brief changes.

## 12. Accessibility

- Meet WCAG AA contrast for text and key UI states.
- Touch targets should be at least 44x44 where practical.
- Forms need clear labels, focus, error, and success states.
- Do not rely on color alone to communicate state.
- Keep dense task and quote flows readable on mobile.

## 13. Microcopy

Use consistent product language:

- task
- quote
- worker
- customer
- request

Avoid mixing in terms like provider, bid, job poster, offer, or gig unless the user explicitly asks for marketing copy that uses broader category language.

## 14. Do

- Use green for primary actions and marketplace progress.
- Keep layouts clean, local, and task-focused.
- Use compact metadata rows.
- Prioritize mobile-first task discovery.
- Use tonal surfaces and spacing for structure.
- Keep quote and task comparison easy to scan.

## 15. Don't

- Do not use amber or blue as brand identity colors.
- Do not overuse borders, heavy shadows, or divider lines.
- Do not create separate page variants when permission-gated sections on one page are correct.
- Do not imply Slashie handles payment if the current brief says payment is external.
- Do not crowd task cards with too many actions.