import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { OrderStatus } from '@codegen/schema'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import {
  storyTaskDetail,
  storyTaskOrder,
} from '../../helpers/taskDetailStoryFixtures'

import { QuoteSectionColumn } from './QuoteSectionColumn'

const meta = {
  title: 'task/QuoteSection/QuoteSectionColumn',
  component: QuoteSectionColumn,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [withTaskDetailStory({ viewer: 'owner' }, { maxWidth: '400px' })],
} satisfies Meta<typeof QuoteSectionColumn>

export default meta

type Story = StoryObj<typeof meta>

export const OpenTaskWithTrustCard: Story = {
  args: {
    task: storyTaskDetail(),
    order: null,
  },
}

export const ActiveOrderWithQuotes: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'owner',
        order: storyTaskOrder({ status: OrderStatus.Active }),
      },
      { maxWidth: '400px' },
    ),
  ],
  args: {
    task: storyTaskDetail(),
    order: storyTaskOrder({ status: OrderStatus.Active }),
  },
}

export const WorkerWithVerification: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'worker',
        order: storyTaskOrder({ status: OrderStatus.Active }),
      },
      { maxWidth: '400px' },
    ),
  ],
  args: {
    task: storyTaskDetail(),
    order: storyTaskOrder({ status: OrderStatus.Active }),
  },
}
