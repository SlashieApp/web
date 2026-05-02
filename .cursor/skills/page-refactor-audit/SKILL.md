---
name: page-refactor-audit
description: Audits and refactors App Router pages and colocated UI for repo rules, @ui usage, and Slashie design. Use when the user runs /refactor-page, asks to bring a page up to standards, align with new rules or DESIGN, or modernize route files under src/app.
---

# Page refactor audit

## When this applies

- User targets one or more files under `src/app/**` (especially `page.tsx`, layouts, or colocated `components/`).
- Goal: standards compliance, design-system alignment, and rule parity—not a full product redesign unless asked.

## Before editing

1. Read the full file(s) to change and immediate imports; match existing naming and patterns in that folder.
2. For visual or UX work, read and follow [.cursor/skills/slashie-design/SKILL.md](../slashie-design/SKILL.md) (tokens, light/dark, typography, no-line rule, accessibility).
3. Skim [AGENTS.md](../../../AGENTS.md) for product language (**task**, **quote**, **worker**, map-first discovery)—use in copy, not legacy terms like “Handyman” unless migrating strings deliberately.

## Audit checklist (fix gaps by refactoring)

### `@ui` and Chakra

- Prefer shared primitives from **`@ui`** when they fit: `Button`, `FormField`, `Input`, `IconButton`, `Badge`, `Card`, `Tag`, `Avatar`, `Header`, `Footer`, `Logo`, etc. (see `src/ui/index.ts`).
- Layout and composition may still use **`@chakra-ui/react`** (`Box`, `Stack`, `Grid`, …). Do not reimplement `@ui` behavior with raw Chakra unless `@ui` lacks the variant needed.
- **Navigation:** internal routes use Chakra **`Link`** with **`as={NextLink}`** and `href` on `Link`—no plain `<a href="/…">`, no `legacyBehavior` / `passHref` (see `.cursor/rules/chakra-next-link.mdc`).

### Repo rules (always-applied)

- **Effects:** do not add `useEffect` for new behavior; prefer handlers, callbacks, and callback refs (`.cursor/rules/no-useeffect-callback-ref.mdc`). Only touch existing `useEffect` if the task requires that behavior.
- **GraphQL:** if the page uses operations, keep them in `src/graphql/` and types from `@codegen/schema`; run `bun run codegen` when the schema or operations change (`.cursor/rules/graphql-codegen.mdc`).
- **Structure:** keep **`page.tsx` thin**; feature UI belongs in colocated **`components/`** per segment (`.cursor/rules/repo-structure-and-exports.mdc`). Context hooks live in leaf components where possible.
- **Barrels:** if you add or move modules under folders covered by `EXPORT_CONFIGS` (`src/ui`, `src/app/(task)/components`), run **`bun run exports-gen`**; do not hand-edit auto-generated `index.ts` files.

### Quality bar

- **Scope:** only change what’s needed for compliance and the requested page(s); no drive-by refactors elsewhere.
- **Theming:** interactive states and text meet **WCAG AA** in **light and dark** (contrast, focus visibility).
- **Verification:** run **`bun run lint`** on the touched area; fix any new diagnostics. Run **`bunx tsc --noEmit`** if types or imports shifted materially.

## Refactor workflow

1. List concrete violations (e.g. raw `<a>`, Chakra `Button` where `@ui` `Button` is standard, missing `NextLink` pattern, copy off-product, oversized `page.tsx`).
2. Apply fixes in small, readable steps; preserve behavior and public URLs.
3. If a rule conflicts with an explicit user instruction, follow the user and note the tradeoff briefly.

## Out of scope unless requested

- Backend or schema changes, new GraphQL operations for unrelated features, or repo-wide renames.
- Editing `codegen.ts` or committing `.codegen/` output.
