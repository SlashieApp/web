---
name: ui-component-from-image
description: >-
  Builds a new reusable Chakra UI primitive under src/ui from a reference image
  (layout, typography, color), verifies light and dark themes with semantic
  tokens, and adds a colocated Storybook story. Use when the user attaches or
  links a design image for a new generic component, asks to match a mockup in
  src/ui, or wants a Card-style shared UI building block from a screenshot.
---

# UI component from image

## When this applies

The user supplies a **reference image** (mockup, screenshot, or design frame) and wants a **new general-purpose component** in `src/ui/`, reusable like `Card`, correct in **light and dark** theme, aligned to **Slashie design**, with a **Storybook** story.

## Before coding

1. **Read the image** with the image-capable read path so layout, hierarchy, spacing, and states are grounded in the asset.
2. **Read** [.cursor/skills/slashie-design/SKILL.md](../slashie-design/SKILL.md) for tokens, typography, surfaces, borders, motion, and a11y expectations.
3. **Infer the component API**: prefer composition (`children`, optional named slots via props) and extending the narrowest Chakra props type (`BoxProps`, `StackProps`, etc.) so callers can forward layout props—mirror the spirit of `src/ui/Card/Card.tsx`.

## File layout (match existing `src/ui` primitives)

Create a **folder per component**:

```
src/ui/<ComponentName>/
  <ComponentName>.tsx
  <ComponentName>.stories.tsx
```

- Use **PascalCase** for the folder and primary export name.
- Add **`'use client'`** only if the implementation needs client-only APIs (hooks, events beyond static markup).

## Implementation rules

### Stack and styling

- Build with **Chakra UI v3** primitives (`Box`, `Stack`, `Text`, `Button`, etc.) consistent with the rest of `src/ui`.
- **Colors and surfaces** must come from **semantic tokens** defined for both themes in `src/theme/system.ts` (`lightConfig` / `darkConfig`)—for example `cardBg`, `cardFg`, `formControlBg`, `bg`, `fg`, `intent*` / `badge*` tokens, etc. (see `src/theme/cardPalette.ts`, `src/theme/formPalette.ts`, and `src/theme/intentPalette.ts` for grouped palettes).
- If the mockup needs a color that has **no** semantic token, **add** a paired semantic entry in **both** `lightConfig` and `darkConfig` (and document the token name in the component props or JSDoc if non-obvious).
- Follow Slashie **no-line rule** by default: avoid 1px borders for sectioning; use tonal surfaces and spacing. Use borders only when required for clarity or a11y, and prefer tokenized borders (e.g. patterns used by `Card`: `cardBorder`, `cardBg`).
- Typography: **headings** → `fontFamily="heading"` where appropriate; body → default body. Respect scale and rhythm from the slashie skill.
- **Contrast**: aim for **WCAG AA** in both themes for text and interactive states.

### Generality and reuse

- Prefer **one component** with **props** (`variant`, `size`, optional `icon`, `isDisabled`, etc.) over forking duplicate markup.
- Expose **`children`** (and optional render props or subcomponents) so the same shell works across product screens.
- Reuse existing `src/ui` pieces where they already encode the pattern; do not copy-paste large chunks from feature routes into `src/ui`.

### Reuse `src/ui` before inventing markup

When a mockup shows common UI atoms (badges, tags, buttons, icon buttons, cards, form fields):

1. **Search `src/ui`** (list folders under `src/ui/` or grep exports) for an existing component that matches the role.
2. If it exists, **import and use it**—extend via props only when the design needs a small delta (e.g. `borderRadius`, `fontFamily` on `Badge`). **Do not** recreate the same pill/chip with raw `Box` + `Text` unless nothing in `src/ui` fits and adding a primitive is intentional.
3. **Imports**: from another `src/ui` module, use a **relative path to the concrete file** (e.g. `../Badge/Badge`), not `@ui`, in both implementation and colocated stories.

Examples in this repo: **`Badge`** for metadata-style pills; **`Tag`** for status/chip patterns; **`Button`** / **`IconButton`** for actions; **`Card`** for elevated surfaces.

### Imports and barrels

- Inside `src/ui/**`, use **relative imports** to sibling or nested files. **Do not** import from `@ui` in component or colocated story files (avoids circular barrel issues). See repo rule **dual-theme-storybook-ui**.

## Storybook

1. Follow [.cursor/skills/storybook-story-conventions/SKILL.md](../storybook-story-conventions/SKILL.md) for skeleton, `Meta`/`StoryObj` import from `@storybook/nextjs-vite`, `tags: ['autodocs']`, and `parameters.layout` (`padded` for widgets, `fullscreen` for page-like blocks).
2. **Title**: `ui/<ComponentName>` (e.g. `ui/Card`).
3. Stories should use the **same semantic tokens** as production so the Storybook **theme toolbar** shows correct light and dark without extra wrappers.
4. **Do not** wrap the story in a hardcoded hex background to simulate dark mode; rely on preview + tokens.

## After files exist

1. Run **`bun run exports-gen`** so `src/ui/index.ts` picks up the new module (registered in `scripts/generate-exports.ts`).
2. Run **`bun run lint`** and fix any issues.

## Verification checklist

- [ ] Component lives under `src/ui/<ComponentName>/` with a clear, typed public API.
- [ ] Common atoms (badge, tag, button, etc.) reuse existing `src/ui` components where applicable—not reimplemented ad hoc in stories or implementation.
- [ ] No hardcoded theme-specific hex in component or story (except rare documented exceptions).
- [ ] Light and dark both look intentional; interactive states visible.
- [ ] Colocated `*.stories.tsx` with `ui/<Name>` title and autodocs.
- [ ] Exports regenerated; lint clean.

## Reference implementation

Use `src/ui/Card/Card.tsx` and `src/ui/Card/Card.stories.tsx` as the minimal **shape** reference (thin wrapper, Chakra props spread, colocated story)—not as a mandate to copy card tokens for every new component.
