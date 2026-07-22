---
name: page-refactor-audit
description: Audits and refactors App Router pages and colocated UI for repo rules, @ui usage, and Slashie design. Use when the user runs /refactor-page, asks to bring a page up to standards, align with new rules or DESIGN, or modernize route files under src/app.
---

# Page refactor audit

## When this applies

- User targets one or more files under `src/app/**` (especially `page.tsx`, layouts, or colocated `components/`).
- Goal: standards compliance, design-system alignment, and rule parity—not a full product redesign unless asked.

## Before editing

1. Read **[docs/coding-guidebook.md](../../../docs/coding-guidebook.md)** for layers, `page.tsx` contract, and lifecycle.
2. Read the full file(s) to change and immediate imports; match existing naming and patterns in that folder.
3. For visual or UX work, read and follow [.cursor/skills/slashie-design/SKILL.md](../slashie-design/SKILL.md).
4. Skim [AGENTS.md](../../../AGENTS.md) for product language (**task**, **quote**, **worker**, map-first discovery).

## Audit checklist (fix gaps by refactoring)

### Layers (`@ui` / shell / feature)

- Prefer **`@ui`** primitives: `Button`, `FormField`, `Input`, `IconButton`, `Badge`, `Card`, `Avatar`, `Footer`, `Logo`, etc. (see `src/ui/index.ts`).
- App chrome: **`Header` / `Dock`** from `@/ui/Header` / `@/ui/Dock` (or `@ui`).
- Layout composition may use **`@chakra-ui/react`** (`Box`, `Stack`, `Grid`, …).
- **Navigation:** Chakra / `@ui` **`Link`** with Next — no plain `<a>` for internal routes (`.cursor/rules/chakra-next-link.mdc`).
- Layer boundaries: `.cursor/rules/ui-layer-boundaries.mdc`.

### Repo rules (always-applied)

- **Effects:** do not add `useEffect` for new behavior; prefer handlers, callbacks, and callback refs (`.cursor/rules/no-useeffect-callback-ref.mdc`).
- **GraphQL:** colocate `.gql` beside the owning `page.tsx`; run `bun run codegen` when ops change (`.cursor/rules/graphql-route-colocation.mdc`, `graphql-codegen.mdc`).
- **Structure:** **`page.tsx` owns the screen** (content + orchestration); no `PageContent` pass-through — sections in colocated **`components/`**; client pages put `generateMetadata` in colocated **`layout.tsx`** (`.cursor/rules/repo-structure-and-exports.mdc`, `app-route-page-data-flow.mdc`).
- **Barrels:** after moves under `EXPORT_CONFIGS`, run **`bun run exports-gen`**.

### Quality bar

- **Scope:** only change what’s needed for compliance and the requested page(s); no drive-by refactors elsewhere.
- **Theming:** interactive states and text meet **WCAG AA** in **light and dark** (contrast, focus visibility).
- **Verification:** run **`bun run lint`** on the touched area; fix any new diagnostics. Run **`bunx tsc --noEmit`** if types or imports shifted materially.

## Refactor workflow

1. List concrete violations (e.g. raw `<a>`, Chakra `Button` where `@ui` `Button` is standard, missing `NextLink` pattern, copy off-product, pass-through `*PageLayout` that should live in `page.tsx`).
2. Apply fixes in small, readable steps; preserve behavior and public URLs.
3. If a rule conflicts with an explicit user instruction, follow the user and note the tradeoff briefly.

## Out of scope unless requested

- Backend or schema changes, new GraphQL operations for unrelated features, or repo-wide renames.
- Editing `codegen.ts` or committing `.codegen/` output.
