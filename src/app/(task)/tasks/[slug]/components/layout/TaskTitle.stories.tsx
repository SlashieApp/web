import { TaskStatus } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { withTaskDetailPending } from '../../helpers/taskDetailStoryExtras'
import { storyTaskDetail } from '../../helpers/taskDetailStoryFixtures'
import { TaskTitle } from './TaskTitle'

/**
 * The task title, the page's one h1 (34px): under the map with the chips under
 * it. It scrolls with the page and collapses into the page header's bar (see
 * Task detail/Page), where Back and the options menu are. The status badge
 * lives on the Task summary.
 */
const meta = {
  title: 'Task detail/Layout/TaskTitle',
  component: TaskTitle,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TaskTitle>

export default meta
type Story = StoryObj<typeof meta>

const TITLE = 'Mount bookshelf on living room wall'
const LONG_TITLE =
  'Mount a floating bookshelf, three picture rails and a TV bracket across the living room and hallway before the weekend'

/** Owner of an open task. */
export const Default: Story = {
  decorators: [withTaskDetailStory({ viewer: 'owner' })],
  play: async ({ canvasElement }) => {
    const h1 = await within(canvasElement).findByRole('heading', {
      level: 1,
      name: TITLE,
    })
    const style = getComputedStyle(h1)
    expect(style.fontSize).toBe('34px')
    expect(style.fontWeight).toBe('700')
  },
}

/** A long title wraps over several lines. */
export const LongTitle: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'owner',
      task: storyTaskDetail({ title: LONG_TITLE }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('heading', {
      level: 1,
      name: LONG_TITLE,
    })
  },
}

/** Phone: the title wraps in the one column. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [
    withTaskDetailStory({
      viewer: 'visitor',
      task: storyTaskDetail({ status: TaskStatus.Open, title: LONG_TITLE }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('heading', {
      level: 1,
      name: LONG_TITLE,
    })
  },
}

/** Direct load: a skeleton bar stands in for the title. */
export const Loading: Story = {
  decorators: [withTaskDetailPending('loading')],
}

/** Opened from a search card: the card's title shows while the rest loads. */
export const LoadingFromSearchCard: Story = {
  decorators: [withTaskDetailPending('listingSeed')],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('heading', { level: 1, name: TITLE })
    expect(canvasElement).toBeVisible()
  },
}
