---
name: slashie-design
description: >-
  Applies slashie UI design tokens, component patterns, interactions, and
  accessibility rules (blueprint + amber identity). Use when building or
  changing UI, styling pages, adding components, landing sections, dashboards,
  task cards, forms, badges, navigation, or when the user mentions slashie
  design, DESIGN.md, or brand look-and-feel.
---

# Slashie UI Design

## Theme support requirement

Slashie UI supports both **light theme** and **dark theme**.

Every UI component must have **two design-ready versions**:

- a light-theme version
- a dark-theme version

When creating or updating components, always define and verify both variants (tokens, states, contrast, and interaction feedback).

## 1) Executive summary

Slashie UI is a map-first, high-legibility design system for a local task marketplace.

It is built to make task discovery, quote comparison, and account actions fast and clear on mobile and desktop.

The design direction combines:

- **Architectural structure** (clean hierarchy, disciplined layout)

- **Editorial rhythm** (scale contrast + negative space)

- **Operational clarity** (clear actions, fast scanability)

The UI should feel premium and modern without visual clutter.

## 2) Design north star

The product treats the screen as a **digital viewport**:

- the map is foundational context

- interface elements are purposeful overlays/sheets

- typography and spacing do most of the communication work

Core principle: clarity over decoration.

## 3) Brand expression

### Identity system

- Primary brand mark: forward **slash** motif

- Wordmark style: lowercase `slashie`

- Tone: precise, technical, approachable

### Brand usage intent

- Use mark/wordmark lockup in major navigation and brand moments

- Use compact mark in constrained UI surfaces

- Keep brand geometry consistent and avoid arbitrary distortion

## 4) Color and tonal architecture

The palette uses a neutral technical base with a kinetic mint accent.

### Core colors

| Token | Value | Use |

|---|---|---|

| Primary kinetic | `#00DC82` | Primary action emphasis, active highlights |

| Primary deep | `#10B981` | CTA gradient depth |

| Tertiary accent | `#54BBBB` | Secondary highlight moments |

| Brand dark | `#07172A` | Dark surfaces/brand scenes |

| Text dark (ink) | `#0B1020` | Primary text on light backgrounds |

| White | `#FFFFFF` | Text on dark surfaces |

| Neutral base reference | `#777777` | Tonal anchoring concept |

### Surface hierarchy

Use tonal layering for separation:

- `surface` (base, light + dark variants)

- `surface-container-low/lowest` (inset, light + dark variants)

- `surface-container-high/highest` (elevated focus, light + dark variants)

- `primary-container` (action emphasis, light + dark variants)

### The no-line rule

- Do not use 1px borders for sectioning by default.

- Section boundaries should be perceived via tonal shifts and spacing.

- If a boundary is required for accessibility, use low-opacity outline fallback.

### Glass and gradient behavior

- Floating-over-map elements: translucent surface + backdrop blur (20px)

- Primary CTA polish: linear gradient from `#00DC82` to `#10B981` (approx. 135deg)

## 5) Typography system

Typography balances expressive hierarchy and utility reading.

### Font roles

- **Plus Jakarta Sans**: display/headline emphasis

- **Inter**: body text, labels, dense utility content

### Hierarchy behavior

- Display text creates strong section anchors

- Body text remains compact and readable

- Labels are concise and support scanability

### Editorial rhythm

- Pair larger headlines with smaller uppercase metadata labels

- Use spacing and contrast to define hierarchy before adding UI chrome

## 6) Elevation and depth

Depth is mostly tonal, not shadow-heavy.

- Prefer stacked tonal surfaces for hierarchy

- Use shadows only for truly floating/high-priority surfaces

- Keep contours moderately rounded for approachable precision

Recommended floating shadow profile (when needed):

- Y offset ~24px

- Blur ~48px

- Dark neutral alpha shadow (soft edge)

## 7) Component behavior

All component behaviors below must be implemented for both light and dark theme versions.

### Buttons

- **Primary:** high-contrast kinetic CTA treatment

- **Secondary:** quiet supporting action (surface-based)

- **Tertiary:** text-forward action for low-emphasis interactions

### Inputs

- Minimal shell with tonal background

- Focus indicated by strong bottom accent stroke

- Error shown clearly in text/state, avoiding visual over-noise

### Cards and lists

- Avoid divider-line dependency

- Use vertical spacing (12px/16px) and tonal changes between items

- Keep information hierarchy strict and predictable

### Map-native surfaces

- Floating search/actions should feel integrated with map context

- Overlay elements remain legible without obscuring spatial orientation

## 8) Interaction and motion

Motion must be purposeful:

- orient users (navigation/state shifts)

- confirm actions (submit/accept/complete)

- reduce uncertainty in high-frequency flows

Avoid decorative animation in dense task flows.

## 9) Accessibility requirements

- Text contrast target: WCAG AA minimum

- Verify WCAG AA contrast in **both** light and dark themes for every component/state

- Touch targets: 44x44 minimum where applicable

- Form states: clear success/error feedback

- Accent colors must preserve readability on both light and dark surfaces

## 10) Content style and microcopy

- Use short, direct action language

- Prefer operational terms users already see in product:

- task

- quote

- worker

- request

- Reduce cognitive load by keeping labels and status wording consistent

## 11) Do and don't

### Do

- Use whitespace deliberately to create premium clarity

- Maintain strong typography hierarchy

- Trust tonal layering for structure

- Keep roundedness moderate and consistent

### Don't

- Don't overuse borders or visual separators

- Don't crowd cards/actions in dense clusters

- Don't introduce random greys/greens outside token intent

- Don't rely on icons when text can be clearer