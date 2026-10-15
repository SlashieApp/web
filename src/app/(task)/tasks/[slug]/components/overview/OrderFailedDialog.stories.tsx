import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { storyTaskOrder } from '../../helpers/taskDetailStoryFixtures'
import { OrderFailedDialog } from './OrderFailedDialog'

const meta = {
  title: 'Task detail/Overview/OrderFailedDialog',
  component: OrderFailedDialog,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    withTaskDetailStory({ viewer: 'worker', order: storyTaskOrder() }),
  ],
  args: { open: true, onOpenChange: fn() },
} satisfies Meta<typeof OrderFailedDialog>

export default meta
type Story = StoryObj<typeof meta>

/** The dialog portals to the page, outside the story canvas. */
const dialog = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body).findByRole('dialog', {
    name: 'What went wrong?',
  })

/** Open with no reason picked: the submit button is disabled. */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    const panel = within(await dialog(canvasElement))
    await panel.findByText(/Only you can see the reason/)
    expect(panel.getByRole('button', { name: 'Mark as Failed' })).toBeDisabled()
  },
}

/** A reason picked: the submit button is enabled. */
export const ReasonSelected: Story = {
  play: async ({ canvasElement }) => {
    const panel = within(await dialog(canvasElement))
    await userEvent.click(panel.getByText("The work wasn't done"))
    await waitFor(() =>
      expect(
        panel.getByRole('button', { name: 'Mark as Failed' }),
      ).toBeEnabled(),
    )
  },
}

/** Closed: nothing is on screen. */
export const Closed: Story = {
  args: { open: false },
  play: async ({ canvasElement }) => {
    expect(
      within(canvasElement.ownerDocument.body).queryByRole('dialog'),
    ).toBeNull()
  },
}
