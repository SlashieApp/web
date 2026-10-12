import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { storyTaskOrder } from '../../helpers/taskDetailStoryFixtures'

import { OrderCancelDialog, OrderRescheduleDialog } from './OrderRequestDialogs'

const order = storyTaskOrder({ bookedStart: '2030-06-10T09:00:00.000Z' })

const meta = {
  title: 'task/tasks/overview/OrderRequestDialogs',
  component: OrderRescheduleDialog,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [withTaskDetailStory({ viewer: 'customer', order })],
  args: { open: true, onOpenChange: () => {}, counterpartName: 'Jordan' },
} satisfies Meta<typeof OrderRescheduleDialog>

export default meta

type Story = StoryObj<typeof meta>

export const Reschedule: Story = {}

export const Cancel: Story = {
  render: (args) => <OrderCancelDialog {...args} />,
}
