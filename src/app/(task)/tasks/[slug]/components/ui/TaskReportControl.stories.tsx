import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { withTaskDetailPending } from '../../helpers/taskDetailStoryExtras'
import { TaskReportControl } from './TaskReportControl'

/**
 * Reports the open task, with its title, area, category and photo shown in
 * the dialog. Signed-out viewers are sent to log in instead.
 */
const meta = {
  title: 'Task detail/Parts/TaskReportControl',
  component: TaskReportControl,
  parameters: { layout: 'padded' },
  args: { variant: 'menu' },
} satisfies Meta<typeof TaskReportControl>

export default meta
type Story = StoryObj<typeof meta>

/** As a menu row, the way Help & actions shows it. */
export const Menu: Story = {
  decorators: [withTaskDetailStory({ viewer: 'worker' })],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('button', { name: 'Report task' })
  },
}

/** As a button, the way a row of actions shows it. */
export const Button: Story = {
  args: { variant: 'button' },
  decorators: [withTaskDetailStory({ viewer: 'worker' })],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('button', { name: 'Report task' })
  },
}

/** As an icon button, for tight spaces. */
export const Icon: Story = {
  args: { variant: 'icon' },
  decorators: [withTaskDetailStory({ viewer: 'worker' })],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('button', {
      name: 'Report this task',
    })
  },
}

/** Pressing it opens the report dialog, naming this task. */
export const DialogOpen: Story = {
  decorators: [withTaskDetailStory({ viewer: 'worker' })],
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await within(canvasElement).findByRole('button', { name: 'Report task' }),
    )
    const dialog = within(
      await within(canvasElement.ownerDocument.body).findByRole('dialog', {
        name: 'Report this task',
      }),
    )
    await dialog.findByText(/reporting this task/)
    await dialog.findByText('Mount bookshelf on living room wall')
    await dialog.findByRole('button', { name: 'Send report' })
  },
}

/** Task not loaded yet: there is nothing to report, so nothing renders. */
export const TaskNotLoaded: Story = {
  decorators: [withTaskDetailPending('loading')],
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(within(canvasElement).queryByRole('button')).toBeNull(),
    )
  },
}
