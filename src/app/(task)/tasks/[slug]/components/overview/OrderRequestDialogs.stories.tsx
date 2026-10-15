import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn, userEvent, within } from 'storybook/test'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { storyTaskOrder } from '../../helpers/taskDetailStoryFixtures'
import { OrderCancelDialog, OrderRescheduleDialog } from './OrderRequestDialogs'

const order = storyTaskOrder({ bookedStart: '2030-06-10T09:00:00.000Z' })

const meta = {
  title: 'Task detail/Overview/OrderRequestDialogs',
  component: OrderRescheduleDialog,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [withTaskDetailStory({ viewer: 'customer', order })],
  args: { open: true, onOpenChange: fn(), counterpartName: 'Jordan' },
} satisfies Meta<typeof OrderRescheduleDialog>

export default meta
type Story = StoryObj<typeof meta>

/** The dialogs portal to the page, outside the story canvas. */
const page = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body)

/** Propose one or two new times; the other person picks one or keeps the booking. */
export const Reschedule: Story = {
  play: async ({ canvasElement }) => {
    await page(canvasElement).findByRole('dialog', {
      name: 'Propose new times',
    })
  },
}

/** Sending without a day and start time shows what is missing. */
export const RescheduleMissingTime: Story = {
  play: async ({ canvasElement }) => {
    const dialog = within(
      await page(canvasElement).findByRole('dialog', {
        name: 'Propose new times',
      }),
    )
    await userEvent.click(dialog.getByRole('button', { name: 'Send request' }))
    await dialog.findByText('Pick a day and a start time.')
  },
}

/** Ask the other person to cancel; they must accept first. */
export const Cancel: Story = {
  render: (args) => <OrderCancelDialog {...args} />,
  play: async ({ canvasElement }) => {
    const dialog = within(
      await page(canvasElement).findByRole('dialog', {
        name: 'Ask to cancel this booking?',
      }),
    )
    await dialog.findByText(
      'Jordan needs to accept before the booking is cancelled.',
    )
  },
}

/** Closed: nothing is on screen. */
export const Closed: Story = {
  args: { open: false },
  play: async ({ canvasElement }) => {
    const body = page(canvasElement)
    await new Promise((resolve) => setTimeout(resolve, 100))
    if (body.queryByRole('dialog')) {
      throw new Error('A dialog is open while the story is closed')
    }
  },
}
