# Slashie Web — Coding Guidebook

**Audience:** engineers and AI agents working on `slashie-web`  
**Status:** current conventions (App Router + SDL redesign)  
**Last updated:** 2026-07-17  
**Companion docs:** [UI Consistency](./ui-consistency.md) · [SDL Token Migration](./sdl-token-migration.md) · [AGENTS.md](../AGENTS.md)

This guidebook is the engineering wiki source of truth for **how we structure code**. Visual brand tokens and marketplace UX language live in the design skills / UI consistency doc; this book covers **architecture, layering, data flow, and Storybook**.

---

## 1. Stack at a glance

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 App Router |
| Package manager | **Bun** (`bun install`, `bun run …`) |
| UI base | Chakra UI 3 + Slashie SDL semantic tokens |
| Primitives + shell chrome | `src/ui` → import `@ui` / `@/ui/<Name>` |
| Data | External GraphQL + Apollo Client |
| Forms | Zod + react-hook-form + `zodResolver` |
| Lint / format | Biome (`bun run lint` writes fixes) |
| Stories | Storybook 10 (`@storybook/nextjs-vite`) |

---

## 2. Layer model (strict dependency direction)

```text
page.tsx
  → feature sections (src/app/**/components)
    → shared UI (src/ui / @ui) — primitives + shell chrome
      → design tokens (src/theme)
```

**Never import upward.**

| Layer | Path | May import | Must not |
| --- | --- | --- | --- |
| **Primitives** | `src/ui/<Name>/` (most folders) | `src/theme`, Chakra, React, sibling `@ui` via **relative** imports | Apollo hooks, `useUserStore`, pathname chrome (unless a thin adapter lives outside `src/ui`) |
| **Shell chrome** | `src/ui/Header`, `src/ui/Dock` | App stores/hooks, Apollo, routes; sibling UI via relative imports | Live outside `src/ui` / a separate `src/components` tree |
| **Feature** | `src/app/(…)/…` | `@ui`, `@/ui/<Name>`, colocated helpers/context/graphql | Duplicate primitive markup; put atoms in `@ui` |
| **page.tsx** | route entry | Feature sections + data hooks | Large inline card/entity trees |

### Folder shape (`src/ui/<Name>/`)

```text
src/ui/<Name>/
  <Name>.tsx
  i11n.json           # when the module owns copy
  <Name>.stories.tsx  # title: ui/<Name>
  index.ts
```

### What belongs in `src/ui`

**Primitives** — universal atoms/molecules reusable on **any** route:

- Controls: `Button`, `Input`, `Textarea`, `Select`, `PhoneInput`, `OtpInput`, `FormField`, `RadioButton`, `Slider`, `IconButton`
- Display: `Card`, `Badge`, `Avatar`, `Thumbnail`, `Rating`, `DetailRow`, `InfoBar`, `Toast`, `ProgressBar`, `Stepper`, `Tabs`, `ScheduleChip`, `SpotIllustration`, `MapCard`, `ImageGallery`, `Logo`, `Link`
- Layout primitives: `Drawer`, `Dropdown`, `Modal`, `MobileCarousel`, `StepFlowLayout`, `Footer`
- Presentational switchers: `LanguageSwitcher` (connected adapter in `src/i18n/LanguageSwitcher.tsx`)

**Shell chrome** (app-aware, still under `src/ui`):

- `Header` (+ account menu, notifications drawer) — `src/ui/Header/`
- `Dock` — `src/ui/Dock/`

Stories for both: `ui/<Name>`.

**Rules**

- Primitives: presentational only — **no Apollo**, no `useUserStore` (except thin **adapters** outside `src/ui`).
- Shell chrome may read Me / notifications / routes.
- No marketplace-specific defaults on primitives (e.g. no “quotes empty state” component with hardcoded art). Prefer `SpotIllustration` + local composition.
- Domain status chips (e.g. task `OPEN` / `AWARDED`) live next to the feature (`TaskStatusPill`), composing `Badge`.
- Extend existing primitives with optional props before forking.
- Colocate copy in `i11n.json` next to the owner; use `useI11n(bag)` (see Cursor rule **`i11n-colocation`**).

### What belongs in `src/app`

Route-owned screens, sections, mappers, GraphQL, segment providers. Thin adapters that read Me/store and pass props into `@ui` (e.g. `MeAvatar` → `Avatar` with `srcCandidates`).

---

## 3. Route colocation (reference: `(task)`)

Mirror **`src/app/(task)/`**:

| Path | Role |
| --- | --- |
| `page.tsx` | Orchestration map: gates, data, providers, lifecycle, section order |
| `components/` | Feature sections; shared across breakpoints at root |
| `components/(web)/` | Desktop / split-only |
| `components/(mobile)/` | Small-viewport-only |
| `context/` | Segment providers / hooks |
| `helpers/` | Pure mappers, types, GraphQL → UI slices |
| `graphql/` | One operation per `.gql` file, beside owning `page.tsx` |

**Do not** duplicate the same markup under both `(web)` and `(mobile)` — lift shared UI to `components/` root.

Nested routes (`tasks/create`, `tasks/[slug]/edit`) own their own `page.tsx` + colocated folders.

---

## 4. `page.tsx` contract

A reader should understand the page **without spelunking**:

1. Auth / permission gates  
2. Data sources (queries / mutations) and what each powers  
3. Loading / error / empty / success branches  
4. Providers / store boundaries for this page  
5. Section composition order  
6. Page-level handlers (nav, top-level mutations) delegated into sections  

**Do**

- Put the route body and orchestration in **`page.tsx`** (mark `'use client'` when hooks are needed).
- Compose named sections from `./components/`.
- Wire lifecycle explicitly.
- When the page is a client component, put `generateMetadata` in a colocated **`layout.tsx`** that returns `children` (Next.js cannot combine those in one file).

**Don’t**

- Create `PageContent.tsx` / `*Page.tsx` / pass-through `*PageLayout` whose only job is relocating the whole tree so `page.tsx` can re-export it.
- Inline entity/card JSX that belongs in a section or entity component.
- Bury critical fetch/state only in deep leaves with no page-level visibility.

Reference shape: `(dashboard)/dashboard/page.tsx`, `(dashboard)/requests/page.tsx`, `(task)/search/page.tsx`.

---

## 5. State ownership

| Scope | Where |
| --- | --- |
| Shared across the segment / page | `context/` or existing Zustand (`(auth)/store/user`) |
| Section-local UI (tabs, drawer open, selected row) | Inside that section |
| Ephemeral control state | Leaf control |
| Permissions / redaction | Derived once in section or `helpers/` mapper → props |

- Leaves may call segment hooks where they render; avoid shell-only prop drilling of the same context values.
- No “god context” spanning unrelated routes.
- Prefer existing Me / membership patterns over new global stores.

---

## 6. Data lifecycle (every page / section)

Make these states first-class and consistent:

| State | UX |
| --- | --- |
| **loading** | Skeleton / reserved layout (no blank freeze); `aria-busy` where useful |
| **error** | Message + recovery (retry / navigate); `role="alert"` when appropriate |
| **empty** | Helpful copy + next action (compose `SpotIllustration` + CTA locally) |
| **success** | Real content |

**Mapping:** GraphQL documents → minimal UI data slices in `helpers/` — not inside presentational cards.

**Entities / cards:** Presentational. No Apollo. No `pathname` branching for badges/actions. One component per domain entity with `view` / `state` props — not route forks (`TaskCardBrowse` + `TaskCardOwner` forbidden).

---

## 7. Feature section pattern

Every feature section should follow the same shape:

1. Typed props / hooks at top  
2. Data read + mapping  
3. Explicit lifecycle branch (`loading` \| `error` \| `empty` \| `ready`)  
4. Compose entities + `@ui` primitives  
5. Callbacks for actions; no hidden side effects in render  
6. Accessibility: labels, focus rings, ≥44px targets, status not by color alone  

---

## 8. GraphQL

- Colocate `.gql` beside the owning `page.tsx` (`graphql/` subfolder). One operation per file.
- Shared/global ops (e.g. `Me`) may live under `src/graphql/`.
- Run `bun run codegen` after operation changes (needs `.env` schema access).
- Do not commit `.codegen/**` or a local `schema.graphql`.
- See Cursor rules: `graphql-route-colocation`, `graphql-codegen`.

---

## 9. Forms

Multi-field submit forms: **Zod schema** colocated with the route + **react-hook-form** + **`zodResolver`**. Prefer `z.string().trim()`, `z.nativeEnum` for codegen enums, and `.superRefine` for cross-field rules. Tiny single controls may stay local.

---

## 10. Navigation & links

In-app routes: Chakra `Link` with `as={NextLink}` (or `@ui` `Link` which follows the same pattern). No bare `<a>` for internal routes; no `legacyBehavior` / `passHref`.

---

## 11. React effects

Do **not** introduce `useEffect` by default. Prefer event-driven `useCallback` and explicit calls. For mount setup, use callback refs. Keep side effects next to the triggering action (handlers, mutation callbacks).

---

## 12. Storybook titles (by source ownership)

| Source | Title | Examples |
| --- | --- | --- |
| `src/ui/<Name>/` | `ui/<Name>` | `ui/Button`, `ui/Dropdown`, `ui/Header`, `ui/Dock` |
| `src/app/(segment)/…` | Folder path (strip `(groups)` + `components/`, drop `[param]`) | `marketing/Header`, `task/TaskCard`, `worker/setup/WorkerSetupBioComposer` |

- Colocate `*.stories.tsx` next to the component.
- Universal `ui/*`: cover meaningful variants.
- Feature components: usually a single `Default` (or state stories for the top-level shell only).
- No stories for internal subcomponents of a menu/header — exercise via parent.
- Dual theme: semantic tokens only; no hardcoded dark canvas wrappers.
- Inside `src/ui/**`, import siblings relatively — not `@ui` barrel (avoids cycles).

---

## 13. Design & accessibility bar

When touching UI:

- Semantic SDL tokens only (no raw hex in components).
- Dark ink on green CTAs — never white on green.
- One primary CTA per focused region.
- Visible `:focus-visible`; keyboard order matches visual order.
- Touch targets ≥44×44 where practical.
- SVG icons only (no emoji-as-icon).
- Async > ~300ms → skeleton/progress; disable submit while loading.
- Status never by color alone (dot + label, icon + text, etc.).

Details: [UI Consistency](./ui-consistency.md), `.cursor/skills/slashie-design`.

---

## 14. Tooling checklist

```bash
bun install
bun run exports-gen   # after adds/moves under registered barrels (src/ui, …)
bun run codegen       # after .gql changes
bun run lint          # Biome --write
bun run test:unit
bun run storybook     # port 6006
bun run dev           # runs exports-gen then Next on 3000
```

Registered barrels: `EXPORT_CONFIGS` in `scripts/generate-exports.ts`. Do not hand-edit auto-generated `index.ts` files.

---

## 15. Anti-patterns (eliminate on touch)

- Inline entity/card JSX in fat `page.tsx` files  
- Feature UI far from its owning route  
- Duplicate `(web)` / `(mobile)` markup that should be shared  
- Full GraphQL types passed deep into presentational components  
- `if (pathname…)` inside primitives for chrome/actions  
- Prop-drilling context through shells instead of leaf hooks  
- Multiple competing state patterns on one page  
- Silent empty/error; layout-shifting loaders  
- New abstractions with a single caller (YAGNI)  
- Scoped widgets (Header, EmptyState-with-marketplace-art, TaskStatusPill) living in `src/ui`  
- Route-forked cards (`TaskCardBrowse` + `TaskCardOwner`)  

---

## 16. PR acceptance (structural cleanup)

- [ ] Colocated `components/` (and `context/` / `helpers/` / `graphql/` when needed) next to `page.tsx`  
- [ ] `page.tsx` shows gates → data → providers → lifecycle → sections  
- [ ] Shared UI uses `@ui`; domain cards are presentational with view/state  
- [ ] GraphQL mapping in helpers; entities have no Apollo  
- [ ] State owned at the right folder level  
- [ ] Sections share loading / error / empty / success  
- [ ] Import direction respects the layer model  
- [ ] Touched `ui` / feature stories titled correctly  
- [ ] No happy-path / primary empty-error regressions  

---

## 17. Where Cursor enforces this

| Rule / skill | Enforces |
| --- | --- |
| `.cursor/rules/repo-structure-and-exports.mdc` | Colocation, barrels, Storybook ownership titles |
| `.cursor/rules/ui-layer-boundaries.mdc` | `src/ui` purity vs shell vs app |
| `.cursor/rules/app-route-page-data-flow.mdc` | `page.tsx` orchestration + lifecycle |
| `.cursor/rules/graphql-*.mdc` | Colocation + codegen |
| `.cursor/rules/forms-zod.mdc` | Zod forms |
| `.cursor/rules/no-useeffect-callback-ref.mdc` | Effect avoidance |
| `.cursor/rules/chakra-next-link.mdc` | In-app links |
| `.cursor/rules/dual-theme-storybook-ui.mdc` | Tokens + stories |
| `.cursor/skills/storybook-story-conventions` | Story file/title patterns |
| `.cursor/skills/slashie-design` | Brand / UX language |

When conventions change, update **this guidebook first**, then the matching Cursor rules/skills.
