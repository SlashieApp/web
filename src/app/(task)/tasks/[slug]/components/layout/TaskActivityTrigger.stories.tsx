import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { TaskActivityTrigger } from './TaskActivityTrigger'

const meta: Meta<typeof TaskActivityTrigger> = {
  title: 'Task detail/Layout/TaskActivityTrigger',
  component: TaskActivityTrigger,
  decorators: [withTaskDetailStory({ viewer: 'owner' })],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** Phones: the Overview section card that opens Activity in a sheet. */
export const Default: Story = {
  globals: { viewport: { value: 'mobile1' } },
}
