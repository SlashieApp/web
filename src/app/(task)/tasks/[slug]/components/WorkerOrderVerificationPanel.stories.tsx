import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { OrderStatus } from '@codegen/schema'

import { withTaskDetailStory } from '../helpers/taskDetailStoryDecorator'
import { storyTaskOrder } from '../helpers/taskDetailStoryFixtures'

import { WorkerOrderVerificationPanel } from './WorkerOrderVerificationPanel'

const meta = {
  title: 'taskDetail/WorkerOrderVerificationPanel',
  component: WorkerOrderVerificationPanel,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof WorkerOrderVerificationPanel>

export default meta

type Story = StoryObj<typeof meta>

export const ActiveCollapsed: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'worker',
      order: storyTaskOrder({ status: OrderStatus.Active }),
    }),
  ],
}

export const ActiveExpanded: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'worker',
      order: storyTaskOrder({ status: OrderStatus.Active }),
    }),
  ],
  render: () => <WorkerOrderVerificationPanel initialExpanded />,
}

export const AwaitingUpdate: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'worker',
      order: storyTaskOrder({ status: OrderStatus.PaymentAcknowledged }),
    }),
  ],
}
