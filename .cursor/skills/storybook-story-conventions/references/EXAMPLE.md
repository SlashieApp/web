# Story Examples

## UI component: one story per situation

```tsx
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Badge } from './Badge'

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: { layout: 'padded' },
  args: { children: 'Open' },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

/** Default variant. */
export const Default: Story = {}

/** Success: positive state such as Completed. */
export const Success: Story = { args: { variant: 'success' } }

/** Long label: wraps instead of overflowing. */
export const LongLabel: Story = {
  args: { children: 'Waiting for the other person to confirm' },
}
```

## Route component: seed the real provider

Components that read a route context get a story-only decorator. Task detail
uses `withTaskDetailStory` (fixtures plus an Apollo client whose link never
resolves, so nothing reaches the network).

```tsx
import { TaskStatus } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { storyTaskDetail } from '../../helpers/taskDetailStoryFixtures'
import { TaskTitle } from './TaskTitle'

const meta: Meta<typeof TaskTitle> = {
  title: 'Task detail/Layout/TaskTitle',
  component: TaskTitle,
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof meta>

/** Owner of an open task. */
export const Default: Story = {
  decorators: [withTaskDetailStory({ viewer: 'owner' })],
}

/** Phones: booked worker, the menu adds the booking actions. */
export const PhoneMenuBooked: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [
    withTaskDetailStory({
      viewer: 'worker',
      task: storyTaskDetail({ status: TaskStatus.Awarded }),
    }),
  ],
}
```

## Interaction check with a play function

`npx vitest run --project storybook <file>` runs play functions as tests.

```tsx
import { expect, userEvent, waitFor, within } from 'storybook/test'

/** Phones: a menu item that opens a dialog keeps it open. */
export const MobileItemOpensDialog: Story = {
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(await page.findByRole('button', { name: 'Open menu' }))
    await userEvent.click(await page.findByRole('menuitem', { name: 'Cancel booking' }))
    await waitFor(() => expect(page.getByRole('dialog')).toBeVisible())
  },
}
```
