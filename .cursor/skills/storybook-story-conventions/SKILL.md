---
name: storybook-story-conventions
description: Create and update Storybook stories using this repository's required conventions for @storybook/nextjs-vite, colocated story files, title/layout patterns, args shape, and provider usage. Use when adding or editing .stories.tsx files or when the user asks for Storybook stories.
---

# Storybook Story Conventions

Canonical ownership titles: **`docs/coding-guidebook.md`** §12.

Apply these rules whenever creating or updating stories.

## Repo-specific stack

- Framework: `@storybook/nextjs-vite`
- Story discovery: `../components/**/*.stories.@(js|jsx|mjs|ts|tsx)`
- Static assets: `public/` via `.storybook/main.ts` `staticDirs`
- Global decorator: `.storybook/preview.tsx` already wraps stories with app provider

## File placement rules

Always colocate the story beside its component:

- `src/ui/<Component>/<Component>.stories.tsx` — universal atoms/molecules.
- `src/app/**/components/**/<Component>.stories.tsx` — route/feature components.

Do not create story files in a separate stories tree; they live next to source.

## Title groups follow source ownership

| Source | Title pattern | Examples |
|---|---|---|
| `src/ui/<Name>/` | `ui/<Name>` | `ui/Input`, `ui/Dropdown`, `ui/Drawer`, `ui/Footer`, `ui/Stepper` |
| `src/components/<Name>/` | `shell/<Name>` | `shell/Header`, `shell/Dock` |
| `src/app/(segment)/…` | folder path (strip route groups + `components/`, drop `[param]` segments) | `marketing/Header`, `task/TaskCard`, `task/search/SearchModeSelector`, `worker/setup/WorkerSetupBioComposer`, `dashboard/profile/ProfileHub` |

Rules:

- **Every `src/ui` story is `ui/*`.** No `Components/*`, `Patterns/*`, `layout/*`, or `form/*` titles for primitives.
- **App stories mirror the route folder path**, not a parallel “function” taxonomy. Prefer the full component name as the last segment (`task/TaskCard`, not `task/Card`).
- **Marketing header** lives under marketing: `marketing/Header` (file may still be `MarketingHeader.tsx`).
- **No duplicate primitive stories.** Do not story alias/wrapper exports or thin variants already covered by a parent.
- **Universal-first.** Generic widgets belong in `src/ui` as `ui/*`; route adapters that only wire context get no story.
- **App shell chrome** (`Header`, `Dock`) lives in `src/components` and stories as `shell/*` — not in `src/ui`.

## Story scope

- **Universal `ui` / `layout`**: cover meaningful variants (states, sizes, alignment) as separate exports.
- **Non-universal feature components** (e.g. `AccountMenu`): **one story file with a single `Default`** that shows the real use case.
- **Internal sub-components** of a feature (e.g. `AccountMenuHeader`, `AccountNavPanel`, `BellIcon`, `GuestHeaderAuth`, `MembershipStatusCard`): **do not** give them their own stories. Exercise them through the top-level component's state stories (e.g. `header/Header → Dashboard`).

## Required story skeleton

```ts
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ComponentName } from './ComponentName';

const meta = {
  title: 'group/ComponentName',
  component: ComponentName,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded' | 'fullscreen',
  },
  args: {},
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
```

## Title convention

- `ui/Card`, `ui/Stepper`, `ui/Dropdown` — anything under `src/ui`
- `shell/Header`, `shell/Dock` — app shell under `src/components`
- `marketing/Header`, `task/tasks/quoteSection/QuoteCard` — app routes by folder path

## Layout convention

- Use `fullscreen` for section-like/full-width/page-like components
- Use `padded` for contained widgets
- If unsure: inspect sibling stories and match the dominant pattern

## Args convention

- Prefer `meta.args` for default args
- Use realistic defaults that render without runtime errors
- Use existing static assets (for example `/press_release.png`)
- Provide minimally complete object/array shapes for required props
- Keep values production-like (ids, slug, dates, URLs)

## Provider rule

Do not add extra provider wrappers in story files unless explicitly requested.

## Quality checklist

- Story file is colocated with the component
- Import type is from `@storybook/nextjs-vite`
- Title follows `group/ComponentName` with the correct **function** group (`ui` / `layout` / `header` / route-section)
- Universal widgets live in `src/ui` and are titled `ui/*` (not `form/*`); route adapters get no story
- Non-universal feature components are a single-story file; internal sub-components have no story
- `tags: ['autodocs']` exists
- `parameters.layout` is set
- Args satisfy required component props
- No linter/type errors in the story file

## Prompt template

Use this prompt for story generation:

```md
Create/Update Storybook story for `<component-path>`.

Follow repo conventions:
1. Use `import type { Meta, StoryObj } from '@storybook/nextjs-vite'`.
2. Place story next to component as `<Component>.stories.tsx`.
3. Use title format by ownership: `ui/<Name>` for `src/ui`, `shell/<Name>` for `src/components`, or the `src/app` folder path (strip `(groups)` + `components/`) for feature stories. No `form/*` / `Components/*` / `Patterns/*` titles.
4. Include `tags: ['autodocs']`.
5. Set `parameters.layout` (`fullscreen` for section/full-width, `padded` for contained widgets).
6. Add realistic default args with complete mock object shapes.
7. Export `meta`, `type Story = StoryObj<typeof meta>`, and `Default`.
8. Non-universal feature components: a single `Default` story; no stories for internal sub-components.
9. Do not add extra providers; Storybook preview already wraps with app Provider.
```

## Examples

See [references/EXAMPLE.md](references/EXAMPLE.md).
