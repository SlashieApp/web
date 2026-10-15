import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import {
  storyTaskDetail,
  storyTaskQuote,
} from '../../helpers/taskDetailStoryFixtures'
import { AnalyticsCards, TaskAnalyticsTrigger } from './AnalyticsCards'

/** The owner's snapshot: views, quotes, interest and time to quote. */
const meta = {
  title: 'Task detail/Analytics/AnalyticsCards',
  component: AnalyticsCards,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '380px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AnalyticsCards>

export default meta
type Story = StoryObj<typeof meta>

const phone = { globals: { viewport: { value: 'mobile1' } } } as const

/** Five workers quoting: the interest badge turns High. */
const manyQuotes = Array.from({ length: 5 }, (_, i) =>
  storyTaskQuote({
    id: `quote-many-${i + 1}`,
    workerUserId: `worker-many-${i + 1}`,
    createdAt: `2026-05-28T1${i}:30:00.000Z`,
  }),
)

/** Two quotes: medium interest, average wait in hours. */
export const MediumInterest: Story = {
  decorators: [withTaskDetailStory({ viewer: 'owner' })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Medium')
    await canvas.findByText('Workers are quoting. Compare and accept one.')
  },
}

/** No quotes yet: low interest, "Waiting" for the first quote. */
export const NoQuotes: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'owner',
      task: storyTaskDetail({ quotes: [], views: 2 }),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Low')
    await canvas.findByText('Waiting')
  },
}

/** Five quotes: high interest. */
export const HighInterest: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'owner',
      task: storyTaskDetail({ quotes: manyQuotes, views: 48 }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('High')
  },
}

/** Quotes arrived within the hour: "Under 1 hour" to quote. */
export const QuickQuotes: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'owner',
      task: storyTaskDetail({
        quotes: [storyTaskQuote({ createdAt: '2026-05-28T10:20:00.000Z' })],
      }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Under 1 hour')
  },
}

/** The view count is not known yet: "New, reaching workers". */
export const ViewsColdStart: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'owner',
      task: storyTaskDetail({ quotes: [], views: null as never }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText(/reaching workers/)
  },
}

/** Only the owner sees analytics: a visitor gets nothing. */
export const NotOwner: Story = {
  decorators: [withTaskDetailStory({ viewer: 'visitor' })],
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(within(canvasElement).queryByText('Analytics')).toBeNull(),
    )
  },
}

/** Phone: the Overview button that opens the snapshot in a sheet. */
export const PhoneTrigger: Story = {
  ...phone,
  render: () => <TaskAnalyticsTrigger />,
  decorators: [withTaskDetailStory({ viewer: 'owner' })],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Medium interest')
  },
}

/** Phone, sheet open: the same rows in a bottom sheet. */
export const PhoneSheetOpen: Story = {
  ...phone,
  render: () => <TaskAnalyticsTrigger />,
  decorators: [withTaskDetailStory({ viewer: 'owner' })],
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await within(canvasElement).findByRole('button', { name: /Analytics/ }),
    )
    const sheet = within(canvasElement.ownerDocument.body)
    await sheet.findByRole('dialog')
    await sheet.findByText('Time to quote')
  },
}
