import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { storyTaskDetail } from '../../helpers/taskDetailStoryFixtures'
import { TaskDetailTabs } from './TaskDetailTabs'

const meta: Meta<typeof TaskDetailTabs> = {
  title: 'task/tasks/layout/TaskDetailTabs',
  component: TaskDetailTabs,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  decorators: [
    withTaskDetailStory({ viewer: 'owner' }, { maxWidth: '1100px' }),
  ],
}

/** Worker quote path — pricing lives in the rail CTA, not Overview. */
export const Worker: Story = {
  decorators: [
    withTaskDetailStory(
      { viewer: 'worker', task: storyTaskDetail({ quotes: [] }) },
      { maxWidth: '1100px' },
    ),
  ],
}

/** Worker whose quote awaits review — main CTA becomes Edit quote. */
export const WorkerQuoteSent: Story = {
  decorators: [
    withTaskDetailStory({ viewer: 'worker' }, { maxWidth: '1100px' }),
  ],
}
