import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { OrderStatus } from '@codegen/schema'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { storyTaskOrder } from '../../helpers/taskDetailStoryFixtures'

import { StatusSection } from './StatusSection'

const meta = {
  title: 'task/tasks/statusSection/StatusSection',
  component: StatusSection,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof StatusSection>

export default meta

type Story = StoryObj<typeof meta>

export const WorkerBooked: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'worker',
      order: storyTaskOrder({ status: OrderStatus.Active }),
    }),
  ],
}

export const CustomerActive: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'customer',
      order: storyTaskOrder({
        status: OrderStatus.Active,
        completionVerificationCode: '482913',
      }),
    }),
  ],
}

export const EmptyForVisitor: Story = {
  decorators: [withTaskDetailStory({ viewer: 'visitor' })],
}
