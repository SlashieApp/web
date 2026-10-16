---
name: storybook-story-conventions
description: Create and update Storybook stories using this repository's required conventions for @storybook/nextjs-vite, colocated story files, title/layout patterns, args shape, and provider usage. Use when adding or editing .stories.tsx files or when the user asks for Storybook stories.
---

# Storybook Story Conventions

Canonical source: **`docs/coding-guidebook.md`** §12 (product-area grouping, FE-275).

## Stack

- Framework: `@storybook/nextjs-vite` (Storybook 10)
- Discovery: `../src/**/*.mdx` and `../src/**/*.stories.@(js|jsx|mjs|ts|tsx)`
- Global decorators: `.storybook/preview.tsx` (Chakra provider, theme, sidebar `storySort`)
- Story tests: `npx vitest run --project storybook [paths]` (each story renders as a test; play functions run)

## Titles (by product area)

| Source | Title |
| --- | --- |
| `src/ui/<Name>/` | `UI/<Name>` (more components in the folder: `UI/<Name>/<Component>`) |
| `src/ui/Header`, `Footer`, `MobileBottomNav`, `AppShell`; root app chrome (`src/app/*.tsx`) | `Shell/<Name>` |
| `src/app/(task)/tasks/[slug]/components/<section>/` | `Task detail/<Section>/<Component>` (Summary, Layout, Overview, Quotes, Analytics, Parts = `ui`); page stories `Task detail/Page` |
| `src/app/(task)/search/` | `Search/<Component>` |
| `src/app/(task)/components/` | `Tasks/<Component>` |
| `src/app/(task)/tasks/components/` | `My tasks/<Component>` |
| `src/app/(task)/tasks/[slug]/edit/` | `Edit task/<Component>` |
| `src/app/(stepflow)/tasks/create/` | `Create task/<Component>` |
| `src/app/(stepflow)/tasks/[slug]/quote/` | `Quote flow/<Component>` |
| `src/app/(stepflow)/tasks/[slug]/review/` | `Review flow/<Component>` |
| `src/app/(stepflow)/worker/setup/` | `Worker setup/<Component>` |
| `src/app/(worker)/workers/[slug]/` | `Worker profile/<Component>` |
| `src/app/(worker)/workers/` | `Workers/<Component>` |
| `src/app/(dashboard)/<section>/` | `Dashboard/<Section>/<Component>` (Account, Billing, Profile, Home, Earnings, Admin, Shared) |
| `src/app/(messages)/` | `Messages/<Component>` |
| `src/app/(auth)/` | `Auth/<Component>` |
| `src/app/(presence)/` | `Public profile/<Component>` |
| `src/app/(marketing)/` | `Marketing/Layout/*`, `Marketing/Landing/*`, `Marketing/Pricing/*`, `Marketing/About/*` |

## Rules

- Colocate `<Component>.stories.tsx` next to every component that renders visible UI.
- One named story per situation the component can be in (data states, viewer roles, loading / empty / error, open / closed, phone vs desktop), each with a one-line JSDoc saying which situation it shows. Phone layouts: `globals: { viewport: { value: 'mobile1' } }`.
- No stories for hooks, providers, GraphQL, analytics view capture, trackers, URL sync, or anything else that renders nothing visible.
- Components that read a route context get a story-only decorator that seeds the real provider with fixtures and a story-only Apollo client (a link that never resolves, plus a seeded cache), e.g. `withTaskDetailStory` in `src/app/(task)/tasks/[slug]/helpers/`. Stories must never reach the network (`.env` points at production).
- Story tests: `npx vitest run --project storybook [paths]` renders every story and runs play functions (e.g. `UI/Dropdown` "Mobile Item Opens Dialog").
- The sidebar order lives in `.storybook/preview.tsx` (`storySort`); add new areas there.
- Don't add non-story helper files under auto-generated barrel folders (`src/ui`, `src/app/(task)/components`); keep `src/ui` story helpers inside the story file.
- Inside `src/ui/**`, import siblings relatively, not through the `@ui` barrel.
- Dual theme: semantic tokens only; no hardcoded dark canvas wrappers.

## Skeleton

```ts
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ComponentName } from './ComponentName'

const meta = {
  title: 'Area/ComponentName',
  component: ComponentName,
  parameters: { layout: 'padded' },
  args: {},
} satisfies Meta<typeof ComponentName>

export default meta
type Story = StoryObj<typeof meta>

/** Populated: what most people see. */
export const Default: Story = {}

/** Loading: skeleton while the data is fetched. */
export const Loading: Story = { args: { loading: true } }
```

## Layout and args

- `fullscreen` for page-like or full-width components, `padded` for contained ones; match siblings when unsure.
- Realistic, production-like args with complete object shapes; reuse the area's story fixtures.

## Checklist

- Story file is colocated, titled by product area, and listed in the right `storySort` group
- One story per situation, each with a one-line JSDoc
- Route contexts come from a story-only decorator; nothing reaches the network
- `npx vitest run --project storybook <file>` passes; no Biome or tsc errors

## Examples

See [references/EXAMPLE.md](references/EXAMPLE.md).
