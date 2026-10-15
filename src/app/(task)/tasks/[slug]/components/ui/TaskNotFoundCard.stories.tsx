import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within } from 'storybook/test'

import { TaskNotFoundCard } from './TaskNotFoundCard'

/** Full-page "task not found", shown by the detail and quote pages. */
const meta = {
  title: 'Task detail/Parts/TaskNotFoundCard',
  component: TaskNotFoundCard,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TaskNotFoundCard>

export default meta
type Story = StoryObj<typeof meta>

/** Built-in English copy, as the quote page uses it. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Task not found')
    // The footer links to search too, so more than one link matches.
    await canvas.findAllByRole('link', { name: 'Search tasks' })
  },
}

/** The detail page passes its own copy, with an eyebrow above the heading. */
export const WithPageCopy: Story = {
  args: {
    eyebrow: 'Task',
    heading: 'Task not found',
    description: 'This task may have been removed or is no longer available.',
    browseLabel: 'Search tasks',
  },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Task')
  },
}

/** Phone width. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
}
