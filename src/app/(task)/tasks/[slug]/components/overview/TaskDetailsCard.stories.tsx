import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { TaskDetailsCard } from './TaskDetailsCard'

const meta: Meta<typeof TaskDetailsCard> = {
  title: 'task/tasks/overview/TaskDetailsCard',
  component: TaskDetailsCard,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** Visitor: "Near {town}" with the ? hint, and the Posted by row. */
export const Default: Story = {
  decorators: [withTaskDetailStory({ viewer: 'visitor' })],
}

/** Poster: exact address, no Posted by row. */
export const Owner: Story = {
  decorators: [withTaskDetailStory({ viewer: 'owner' })],
}

/** Desktop width: rows left, map thumbnail right. */
export const Desktop: Story = {
  decorators: [
    withTaskDetailStory({ viewer: 'visitor' }, { maxWidth: '760px' }),
  ],
}
