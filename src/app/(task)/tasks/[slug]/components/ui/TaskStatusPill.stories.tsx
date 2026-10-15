import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within } from 'storybook/test'

import { TaskStatusPill } from './TaskStatusPill'

/** The task lifecycle badge: a dot and a label in the status family's colour. */
const meta = {
  title: 'Task detail/Parts/TaskStatusPill',
  component: TaskStatusPill,
  parameters: { layout: 'padded' },
  args: { status: 'OPEN' },
} satisfies Meta<typeof TaskStatusPill>

export default meta
type Story = StoryObj<typeof meta>

/** Open for quotes (success). */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Open')
  },
}

/** A worker is booked (warning). */
export const Awarded: Story = {
  args: { status: 'AWARDED' },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Awarded')
  },
}

/** The job is done (success). */
export const Completed: Story = {
  args: { status: 'COMPLETED' },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Completed')
  },
}

/** The task was cancelled (danger). */
export const Cancelled: Story = {
  args: { status: 'CANCELLED' },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Cancelled')
  },
}

/** Small, as in the Task summary header. */
export const Small: Story = {
  args: { size: 'sm' },
}

/** A custom label replaces the default wording. */
export const CustomLabel: Story = {
  args: { status: 'AWARDED', label: 'Booked for Saturday' },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Booked for Saturday')
  },
}
