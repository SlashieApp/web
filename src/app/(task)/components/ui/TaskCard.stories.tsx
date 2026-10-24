import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { storyQuoteRow } from '@/app/(dashboard)/quotes/components/workerQuoteStoryFixtures'

import { withIdleApollo } from '../../helpers/taskBrowseStoryDecorator'

import {
  TaskCard,
  type TaskCardProps,
  type TaskCardTask,
  type TaskCardWorkerQuoteProps,
} from './TaskCard'

/** Browse stories use the `task` object shape, not the legacy flat-prop union. */
type TaskCardBrowseTaskProps = Extract<
  Exclude<TaskCardProps, TaskCardWorkerQuoteProps>,
  { task: TaskCardTask }
>

const defaultTask: TaskCardTask = {
  id: 'task-1',
  title: 'Mount a 55-inch TV',
  description: 'Need a worker to mount one TV safely on a plasterboard wall.',
  location: 'Southwark',
  priceLabel: '£120',
  categories: ['Tech setup'],
  distanceLabel: '1.2 miles',
  timingLabel: 'Flexible',
  thumbnailSrc:
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=300&fit=crop',
}

const meta = {
  title: 'Tasks/TaskCard',
  component: TaskCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  // The card's report control holds a mutation: keep it off the real API.
  decorators: [withIdleApollo],
  args: {
    task: defaultTask,
    detailsHref: '/tasks/task-1',
  },
  render: (args: TaskCardBrowseTaskProps) => (
    <Box maxW="520px" w="full">
      <TaskCard {...args} />
    </Box>
  ),
} satisfies Meta<TaskCardBrowseTaskProps>

export default meta

type Story = StoryObj<typeof meta>

/** Badge, budget, distance and timing. No "jobs done" line (removed in FE-369). */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(defaultTask.title)).toBeVisible()
    await expect(canvas.queryByText(/jobs done/i)).toBeNull()
  },
}

/** Results loading: the card-shaped skeleton. */
export const Loading: Story = {
  render: () => (
    <Box maxW="520px" w="full">
      <TaskCard loading />
    </Box>
  ),
}

/** Long title: clamps to two lines. */
export const LongTitle: Story = {
  args: {
    task: {
      ...defaultTask,
      title:
        'Need someone to mount a 55-inch TV, hide the cables in the wall, and tidy the living-room plaster this weekend',
    },
  },
}

/** No budget: the pound amount is left out of the meta line. */
export const MissingBudget: Story = {
  args: { task: { ...defaultTask, priceLabel: '' } },
}

/** No photo: the thumbnail falls back to its placeholder. */
export const NoThumbnail: Story = {
  args: { task: { ...defaultTask, thumbnailSrc: undefined } },
}

/** No category: the pill row is left out and the title leads. */
export const NoCategories: Story = {
  args: { task: { ...defaultTask, categories: undefined } },
}

/** Several categories: one pill each on one row, fading out before the ⋮ button. */
export const ManyCategories: Story = {
  args: {
    task: {
      ...defaultTask,
      categories: [
        'Tech setup',
        'Handyman',
        'Mounting',
        'Electrical',
        'Assembly',
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const pill = within(canvasElement).getByText('Assembly')
    // Still in the row (one line), past the visible edge.
    await expect(pill).toBeInTheDocument()
    const row = pill.parentElement as HTMLElement
    await expect(row.scrollWidth).toBeGreaterThan(row.clientWidth)
  },
}

/** You quoted on it (search and My Tasks): the role pill leads the categories. */
export const YouQuoted: Story = {
  args: { task: { ...defaultTask, viewerRole: 'quoted' } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Quoted')).toBeVisible()
  },
}

/** You posted it. */
export const YouHosted: Story = {
  args: { task: { ...defaultTask, viewerRole: 'hosted' } },
}

/** My tasks: a quote that is over adds Closed after the role pill. */
export const WithTags: Story = {
  args: {
    tags: ['Closed'],
    task: {
      ...defaultTask,
      viewerRole: 'quoted',
      categories: ['Tech setup', 'Handyman'],
    },
  },
}

/** A booked job: the time leads the meta line in bold. */
export const BookedTimeLeads: Story = {
  args: {
    task: { ...defaultTask, timingLabel: 'Today 14:00', timingTone: 'lead' },
  },
}

/** A booked job past its date: the time leads, in red. */
export const OverdueTime: Story = {
  args: {
    task: { ...defaultTask, timingLabel: 'Overdue', timingTone: 'overdue' },
  },
}

/** My tasks and worker lists: the quote count line under the meta row. */
export const WithQuotesLabel: Story = {
  args: { task: { ...defaultTask, quotesLabel: '5 quotes' } },
}

/** My tasks' Needs you: the ask in bold in place of the quote line, and one button. */
export const WithAskAndAction: Story = {
  args: {
    task: {
      ...defaultTask,
      quotesLabel: '5 quotes',
      askLabel: '3 quotes to compare',
    },
    onActivate: fn(),
    action: (
      <button type="button" style={{ minHeight: 44 }}>
        Compare
      </button>
    ),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('3 quotes to compare')).toBeVisible()
    await expect(canvas.queryByText('5 quotes')).toBeNull()
    await userEvent.click(canvas.getByRole('button', { name: 'Compare' }))
    await expect(args.onActivate).not.toHaveBeenCalled()
  },
}

/** Highlighted because its pin is selected on the map. */
export const Active: Story = {
  args: { isActive: true },
}

/** Bookmark button, not saved yet. */
export const Bookmarkable: Story = {
  args: { isSaved: false, onToggleSave: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', {
        name: /Bookmark Mount a 55-inch TV/,
      }),
    )
    await expect(args.onToggleSave).toHaveBeenCalledOnce()
  },
}

/** Bookmarked: the button is filled and offers to remove it. */
export const ListItemSaved: Story = {
  args: { isSaved: true, onToggleSave: fn() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('button', { name: /Remove bookmark from/ })
  },
}

/** Selected row on desktop: taller card with the details arrow. */
export const ListItemExpanded: Story = {
  args: {
    isActive: true,
    isExpanded: true,
    showDetailsCta: true,
    detailsCtaLabel: 'View task',
  },
}

/** A list row: the whole card is a button that selects the task on the map. */
export const ActivatableRow: Story = {
  args: { onActivate: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: /Select to highlight on map/ }),
    )
    await expect(args.onActivate).toHaveBeenCalledOnce()
  },
}

/** Mobile carousel card: a plain surface that lets horizontal swipes through. */
export const CarouselCard: Story = {
  args: {
    activateMode: 'gesture',
    activateCursor: 'grab',
    activateAriaLabel: 'Mount a 55-inch TV. View task details.',
    onActivate: fn(),
  },
}

/** `variant="workerQuote"` hands over to the worker quote card. */
export const WorkerQuoteVariant: Story = {
  render: () => (
    <Box maxW="520px" w="full">
      <TaskCard variant="workerQuote" {...storyQuoteRow()} />
    </Box>
  ),
}
