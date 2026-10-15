import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within } from 'storybook/test'

import { Badge } from '@ui'

import { TaskStatusPill } from '../../../components/ui/TaskStatusPill'
import { EditTaskPreviewCard } from './EditTaskPreviewCard'

/**
 * Live preview of the task as workers see it, in the style of the task-detail
 * hero: the map fills the card, a wash fades in from the left and bottom, and
 * the content sits bottom-left.
 */
const meta = {
  title: 'Edit task/EditTaskPreviewCard',
  component: EditTaskPreviewCard,
  parameters: { layout: 'padded' },
  args: {
    eyebrow: 'Task preview',
    statusBadge: <TaskStatusPill status="OPEN" size="sm" />,
    title: 'Feed my cat',
    description:
      "Need someone to feed my cat while I'm away. Please make sure he has fresh water and food.",
    locationLabel: 'London',
    whenLabel: 'Sat 19 Sept · Any time',
    categoryLabel: 'Delivery',
    budgetLabel: '£23',
    lat: 51.5074,
    lng: -0.0719,
    mapboxAccessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
  },
  decorators: [
    (Story) => (
      <Box maxW="400px">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof EditTaskPreviewCard>

export default meta
type Story = StoryObj<typeof meta>

/** A live task: the static map behind, an Open badge and every chip. */
export const OpenTaskWithMap: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Open')
    await canvas.findByText('£23')
  },
}

/** No Mapbox token or no point yet: the plain gradient stands in for the map. */
export const NoMap: Story = {
  args: { mapboxAccessToken: undefined },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Feed my cat')
  },
}

/** A draft task: a neutral Draft badge instead of Open. */
export const Draft: Story = {
  args: {
    statusBadge: (
      <Badge variant="neutral" dot shape="pill" size="sm">
        Draft
      </Badge>
    ),
  },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Draft')
  },
}

/** Nothing filled in yet: the placeholder title and description, no chips. */
export const EmptyForm: Story = {
  args: {
    title: 'Untitled task',
    description: 'Add a description so workers know what you need.',
    locationLabel: null,
    whenLabel: null,
    categoryLabel: null,
    budgetLabel: null,
    lat: null,
    lng: null,
  },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Untitled task')
  },
}

/** Flexible timing and no budget: only the chips that have a value show. */
export const FlexibleNoBudget: Story = {
  args: { whenLabel: 'Flexible', budgetLabel: null },
}

/** A long title clamps to two lines and the description to three. */
export const LongText: Story = {
  args: {
    title:
      'Need someone to feed my two cats, water the plants, and bring in the post while I am away for three weeks in August',
    description:
      'Two cats (one is shy and hides under the bed), a dozen houseplants that each need a different amount of water, and the post to collect from the door. Please send a message first so we can arrange a time to meet and I can show you where everything is. Keys will be left with a neighbour.',
  },
}

/** No status badge. */
export const NoStatusBadge: Story = {
  args: { statusBadge: undefined },
}
