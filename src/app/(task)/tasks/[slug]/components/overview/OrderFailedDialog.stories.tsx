import type { Meta, StoryObj } from '@storybook/nextjs-vite'

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
  args: { open: true, onOpenChange: () => {} },
} satisfies Meta<typeof OrderFailedDialog>

export default meta

type Story = StoryObj<typeof meta>

export const Open: Story = {}
