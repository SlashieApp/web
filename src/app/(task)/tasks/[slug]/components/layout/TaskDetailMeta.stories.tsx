import { Box } from '@chakra-ui/react'
import { TaskDateTimeType } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { storyTaskDetail } from '../../helpers/taskDetailStoryFixtures'
import { TaskDetailMeta } from './TaskDetailMeta'

/** The chip row under the title: place, when, duration, categories, owner. */
const meta = {
  title: 'Task detail/Layout/TaskDetailMeta',
  component: TaskDetailMeta,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TaskDetailMeta>

export default meta
type Story = StoryObj<typeof meta>

/** Local calendar day as `YYYY-MM-DD`. */
function localDay(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

/** Everything the task has: town, date, category and the owner. */
export const Default: Story = {
  decorators: [withTaskDetailStory({ viewer: 'owner' })],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Alex Chen')
  },
}

/** Narrow row: one line, scroll sideways when the chips overflow. */
export const Overflowing: Story = {
  decorators: [
    withTaskDetailStory({ viewer: 'owner' }),
    (Story) => (
      <Box maxW="280px">
        <Story />
      </Box>
    ),
  ],
}

/** Today's job: the date chip reads "Today". */
export const Today: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'visitor',
      task: storyTaskDetail({
        datetime: {
          date: localDay(),
          time: '14:00',
          type: TaskDateTimeType.Exact,
        },
      }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Today')
  },
}

/** Tomorrow's job: the date chip reads "Tomorrow". */
export const Tomorrow: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'visitor',
      task: storyTaskDetail({
        datetime: {
          date: localDay(1),
          time: '09:00',
          type: TaskDateTimeType.Exact,
        },
      }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Tomorrow')
  },
}

/** No date, and a free-text duration: Flexible plus an "About 2 hours" chip. */
export const FlexibleWithDuration: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'visitor',
      task: storyTaskDetail({
        datetime: {
          date: null,
          time: 'About 2 hours',
          type: TaskDateTimeType.Flexible,
        },
      }),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Flexible')
    await canvas.findByText('About 2 hours')
  },
}

/** Several categories: a chip each; past half the page width the row scrolls sideways. */
export const ManyCategories: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'visitor',
        task: storyTaskDetail({
          categories: ['HANDYMAN', 'CLEANING', 'Gardening', 'Dog walking'],
        }),
      },
      { maxWidth: '760px' },
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Gardening')
    await canvas.findByText('Dog walking')
  },
}

/** A bare task (no date, no owner): only the place and the category show. */
export const Minimal: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'visitor',
      task: storyTaskDetail({
        datetime: null,
        categories: ['HANDYMAN'],
        poster: null,
      }),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Handyman')
    expect(canvas.queryByText('Alex Chen')).toBeNull()
  },
}

/** The API gave no place name: the place chip falls back to "Approximate area". */
export const NoPlaceName: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'visitor',
      task: storyTaskDetail({
        location: { lat: 51.5074, lng: -0.1278, name: null, address: null },
      }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Approximate area')
  },
}
