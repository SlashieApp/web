---
name: storybook-story-conventions
description: Create and update Storybook stories using this repository's required conventions for @storybook/nextjs-vite, colocated story files, title/layout patterns, args shape, and provider usage. Use when adding or editing .stories.tsx files or when the user asks for Storybook stories.
---

# Storybook Story Conventions

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

## Group by function, not by folder

The **title group** reflects what the component *is*, not where the file sits:

| Group | What belongs here | Examples |
|---|---|---|
| `ui` | **Universal, reusable** atoms + molecules from `src/ui` (incl. form controls). | `ui/Input`, `ui/Textarea`, `ui/FormField`, `ui/OtpInput`, `ui/Button`, `ui/Badge`, `ui/ProgressBar`, `ui/Stepper` |
| `layout` | **Universal layout primitives** that position/overlay content. | `layout/Dropdown`, `layout/Drawer`, `layout/Footer`, `layout/Dock` |
| `header` | **Header use cases** (top-level app/site headers + the menus they own). | `header/Header` (browse + dashboard states), `header/MarketingHeader`, `header/AccountMenu` |
| `task` / `taskDetail` / `quotes` / … | **Route/section-scoped** feature components. | `task/QuoteSection/QuoteCard` |

Rules:

- **No redundant `form` group.** Form controls are universal `ui` (character-count textareas use `FormField.CharCountTextarea` inside `FormField`; the field shell is `ui/FormField`). Title them `ui/*`.
- **No duplicate primitive stories.** Do not add separate stories for alias/wrapper exports (`AppDrawer` vs `Drawer`, `AppModal` vs `Modal`) or for thin variants already covered by a parent (`CharCountTextarea` → `ui/Textarea/WithCharCount`; `HoverDropdownMenu` → `layout/Dropdown/HoverDefault`).
- **Universal-first.** If a route component is really a generic widget (e.g. a progress bar, a stepper), extract it to `src/ui` and title it `ui/*`; the route keeps a thin adapter that wires data/context into the `ui` primitive (no story needed for the adapter).
- **Dropdowns/drawers are `layout`.** Feature menus (e.g. account menu) **compose** `layout/Dropdown` with JSX slot content (see `AccountMenuContent`); the thin `AccountMenu` wrapper handles mobile drawer + desktop trigger only.

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

Use lowercase group + PascalCase component (`ui`, `layout`, `header`, or a route/section group):

- `ui/Card`
- `ui/Stepper`
- `layout/Dropdown`
- `header/Header`

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
3. Use title format `group/ComponentName` grouped **by function**: `ui` (universal atoms/molecules incl. form controls, progress, stepper), `layout` (dropdown/drawer/footer/dock primitives), `header` (top-level headers + their menus), or a route/section group. No `form` group.
4. Include `tags: ['autodocs']`.
5. Set `parameters.layout` (`fullscreen` for section/full-width, `padded` for contained widgets).
6. Add realistic default args with complete mock object shapes.
7. Export `meta`, `type Story = StoryObj<typeof meta>`, and `Default`.
8. Non-universal feature components: a single `Default` story; no stories for internal sub-components.
9. Do not add extra providers; Storybook preview already wraps with app Provider.
```

## Examples

See [references/EXAMPLE.md](references/EXAMPLE.md).
