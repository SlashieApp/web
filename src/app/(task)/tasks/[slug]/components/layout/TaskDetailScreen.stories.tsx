import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within } from 'storybook/test'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import {
  withTaskCoreSeed,
  withTaskDetailPending,
} from '../../helpers/taskDetailStoryExtras'
import {
  STORY_TASK_ID,
  storyTaskDetail,
} from '../../helpers/taskDetailStoryFixtures'
import { TaskDetailScreen } from './TaskDetailScreen'

/**
 * The route's entry component: it builds its own provider from the task id,
 * so the page paints from whatever the task requests return.
 */
const meta = {
  title: 'Task detail/Layout/TaskDetailScreen',
  component: TaskDetailScreen,
  parameters: { layout: 'fullscreen' },
  args: { taskId: STORY_TASK_ID },
  globals: { viewport: { value: 'desktop' } },
} satisfies Meta<typeof TaskDetailScreen>

export default meta
type Story = StoryObj<typeof meta>

const task = storyTaskDetail()

/** Direct load, nothing known yet: the skeleton page. */
export const Loading: Story = {
  decorators: [withTaskDetailPending('loading')],
}

/** The public task and the owner's own data have loaded. */
export const Loaded: Story = {
  decorators: [
    withTaskCoreSeed(task),
    withTaskDetailStory({ viewer: 'owner', task }, { maxWidth: '100%' }),
  ],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole(
      'heading',
      { level: 1, name: task.title },
      { timeout: 4000 },
    )
  },
}
