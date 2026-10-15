import { Currency, QuoteStatus, TaskStatus } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { withTaskDetailPending } from '../../helpers/taskDetailStoryExtras'
import {
  storyTaskDetail,
  storyTaskQuote,
} from '../../helpers/taskDetailStoryFixtures'
import { QuotesPanel } from './QuotesPanel'

/** The Quotes section of Overview: skeleton while loading, else the quotes list. */
const meta = {
  title: 'Task detail/Quotes/QuotesPanel',
  component: QuotesPanel,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof QuotesPanel>

export default meta
type Story = StoryObj<typeof meta>

const wide = { maxWidth: '720px' }

const competitorQuote = storyTaskQuote({
  id: 'quote-detail-2',
  workerUserId: 'worker-detail-2',
  price: { amount: 95, currency: Currency.Gbp },
  worker: {
    id: 'worker-detail-2',
    profile: { name: 'Sam Taylor', avatarUrl: null },
    worker: { id: 'worker-profile-2', isVerified: false },
  } as never,
})

/** Owner with two quotes: sortable list with Accept and Decline. */
export const OwnerWithQuotes: Story = {
  decorators: [withTaskDetailStory({ viewer: 'owner' }, wide)],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Quotes')
    await canvas.findByText('Jordan Lee')
    await canvas.findByText('Sam Taylor')
  },
}

/** Owner with no quotes yet: the section stays hidden until there is one. */
export const OwnerNoQuotes: Story = {
  decorators: [
    withTaskDetailStory(
      { viewer: 'owner', task: storyTaskDetail({ quotes: [] }) },
      wide,
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(within(canvasElement).queryByText('Quotes')).toBeNull(),
    )
  },
}

/** Worker who has not quoted: the other quotes, read-only. */
export const WorkerSeesOtherQuotes: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'worker',
        task: storyTaskDetail({ quotes: [competitorQuote] }),
      },
      wide,
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Sam Taylor')
    expect(canvas.queryByRole('button', { name: 'Accept' })).toBeNull()
  },
}

/** Worker whose quote was accepted: the agreement lives in the summary, not here. */
export const WorkerQuoteAccepted: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'worker',
        task: storyTaskDetail({
          status: TaskStatus.Awarded,
          quotes: [storyTaskQuote({ status: QuoteStatus.Accepted })],
        }),
      },
      wide,
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(within(canvasElement).queryByText('Quotes')).toBeNull(),
    )
  },
}

/** The task has not loaded yet: two skeleton blocks. */
export const Loading: Story = {
  decorators: [withTaskDetailPending('loading')],
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelector('[aria-busy]')).not.toBeNull(),
    )
  },
}
