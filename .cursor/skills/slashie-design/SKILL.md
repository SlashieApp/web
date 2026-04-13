---
name: slashie-design
description: >-
  Applies slashie UI design tokens, component patterns, interactions, and
  accessibility rules (blueprint + amber identity). Use when building or
  changing UI, styling pages, adding components, landing sections, dashboards,
  task cards, forms, badges, navigation, or when the user mentions slashie
  design, DESIGN.md, or brand look-and-feel.
---

## Philosophy

Trust, precision, utility. Visual tone: high-end architectural blueprint with approachable warmth. Prefer flat, blueprint-like surfaces over heavy depth.

## Tokens

| Role | Value | Usage |
|------|--------|--------|
| Primary (blueprint blue) | `#1A56DB` | Primary actions, brand, verified states |
| Accent (construction amber) | `#F2994A` | Value highlights, emergency/urgent, Pro tier |
| Success | `#059669` | Completed tasks, positive ratings |
| Surfaces | `bg-slate-50` | Page/surface background |
| Dividers | `bg-slate-100` | Borders, separators |
| Body text | `text-slate-600` | Paragraphs, secondary copy |
| Headings | `text-slate-900` | Titles |

**Typography:** Headings — Plus Jakarta Sans (bold/extra bold). Body — Inter or Plus Jakarta Sans (regular/medium).

**Shape:** `border-radius: 8px` (or Tailwind `rounded-lg` where 8px matches the project).

**Elevation:** `shadow-sm` on cards; avoid heavy stacked shadows.

## Atoms

- **Primary button:** High-contrast primary blue, ~8px radius, white label text.
- **Secondary button:** Ghost or slate fill; optional blue border for outline style.
- **Status badges:** Emergency → amber + icon; Verified → primary blue + check; Completed → success green.
- **Inputs:** White field, 1px slate border; placeholder in Jakarta Sans.

## Molecules & organisms (patterns)

Match these compositions when implementing features:

- **Job summary card:** Title, location (+ icon), budget, relative time.
- **Pro endorsement:** Avatar, name, skill badge, short quote.
- **Rating summary:** Stars + numeric average + review count.
- **Filter chips:** Toggleable category pills (e.g. Plumbing, Electrical).
- **Top nav:** Logo, search, profile actions.
- **Pro sidebar:** Marketplace, Earnings, Messages (vertical nav).
- **Offers list:** Rows with Accept and Message.
- **Review form:** Star group, textarea, highlight chips (e.g. “Fair Price”).

## Interaction

- **Hover:** Links → primary blue; cards → slight lift + shadow transition.
- **Loading:** Skeleton/shimmer aligned to real card layout (especially task cards).
- **Feedback:** Toasts for actions like offer sent or task completed.

## Accessibility

- Text contrast ≥ 4.5:1.
- Tap targets ≥ 44×44px where touch applies.
- Forms (e.g. Post a Job): clear validation and error states.

## Checklist (before shipping UI)

- [ ] Colors and typography match tokens above (or semantic equivalents in the codebase).
- [ ] Radius and card shadow stay subtle (blueprint-flat).
- [ ] Status colors map to Emergency / Verified / Completed as specified.
- [ ] Hover, loading, and feedback patterns are consistent with existing screens.
