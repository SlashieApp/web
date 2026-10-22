import { Currency, QuoteStatus, TaskStatus } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { withTaskDetailPending } from '../../helpers/taskDetailStoryExtras'
import {
  storyPublicQuote,
  storyTaskDetail,
  storyTaskOrder,
  storyTaskQuote,
} from '../../helpers/taskDetailStoryFixtures'
import { OverviewCards } from './OverviewCards'

/**
 * Overview: the Task summary, then the quotes. Phones also get the Analytics
 * (owner) and Activity cards that open as sheets; web shows both in the rail.
 */
const meta = {
  title: 'Task detail/Overview/OverviewCards',
  component: OverviewCards,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof OverviewCards>

export default meta
type Story = StoryObj<typeof meta>

const wide = { maxWidth: '720px' }
const phone = { globals: { viewport: { value: 'mobile1' } } } as const

/** Another worker's live quote, as anyone but the owner gets it. */
const competitorQuote = storyPublicQuote({
  id: 'quote-detail-2',
  price: { amount: 95, currency: Currency.Gbp },
})

const bookedTask = storyTaskDetail({
  status: TaskStatus.Awarded,
  quotes: [storyTaskQuote({ status: QuoteStatus.Accepted })],
})

/** The summary headline names the view this viewer sees. */
async function expectView(
  canvasElement: HTMLElement,
  headline: string | RegExp,
) {
  await within(canvasElement).findByRole(
    'heading',
    { level: 2, name: headline },
    { timeout: 4000 },
  )
}

/** Owner with two quotes: the summary, then the Quotes list to accept from. */
export const OwnerWithQuotes: Story = {
  decorators: [withTaskDetailStory({ viewer: 'owner' }, wide)],
  play: async ({ canvasElement }) => {
    await expectView(canvasElement, '2 quotes - compare and accept')
    await within(canvasElement).findByText('Quotes')
  },
}

/** Owner with no quotes yet: the summary alone, no Quotes section. */
export const OwnerNoQuotes: Story = {
  decorators: [
    withTaskDetailStory(
      { viewer: 'owner', task: storyTaskDetail({ quotes: [] }) },
      wide,
    ),
  ],
  play: async ({ canvasElement }) => {
    await expectView(canvasElement, 'Your task is live - reaching workers')
    expect(within(canvasElement).queryByText('Quotes')).toBeNull()
  },
}

/** Worker who has not quoted: the summary and what the other workers sent, without names. */
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
    await expectView(canvasElement, 'Open for quotes - 1 so far')
    const canvas = within(canvasElement)
    await canvas.findByText('Quotes')
    await canvas.findByText('Worker')
    await canvas.findByText('£95')
  },
}

/** Signed out, task open with quotes: the live quotes, without names. */
export const VisitorSeesQuotes: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'visitor',
        task: storyTaskDetail({ quotes: [competitorQuote] }),
      },
      wide,
    ),
  ],
  play: async ({ canvasElement }) => {
    await expectView(canvasElement, /You can earn/)
    const canvas = within(canvasElement)
    await canvas.findByText('Worker')
    await canvas.findByText('£95')
  },
}

/** Booked worker: the booking summary only; quotes are closed. */
export const WorkerBooked: Story = {
  decorators: [
    withTaskDetailStory(
      { viewer: 'worker', task: bookedTask, order: storyTaskOrder() },
      wide,
    ),
  ],
  play: async ({ canvasElement }) => {
    await expectView(canvasElement, 'Job time has started')
    expect(within(canvasElement).queryByText('Quotes')).toBeNull()
  },
}

/** Signed out, no quotes yet: the summary with the earn line, and no Quotes section. */
export const Visitor: Story = {
  decorators: [
    withTaskDetailStory(
      { viewer: 'visitor', task: storyTaskDetail({ quotes: [] }) },
      wide,
    ),
  ],
  play: async ({ canvasElement }) => {
    await expectView(canvasElement, /You can earn/)
  },
}

/** The task is still loading: a skeleton summary and skeleton quote rows. */
export const Loading: Story = {
  decorators: [withTaskDetailPending('loading')],
}

/** Phone, owner: Analytics and Activity appear as cards between summary and quotes. */
export const PhoneOwnerWithQuotes: Story = {
  ...phone,
  decorators: [withTaskDetailStory({ viewer: 'owner' }, wide)],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expectView(canvasElement, '2 quotes - compare and accept')
    await canvas.findByRole('button', { name: /Analytics/ })
    await canvas.findByRole('button', { name: /Activity/ })
  },
}

/** Phone, visitor: an Activity card but no Analytics. */
export const PhoneVisitor: Story = {
  ...phone,
  decorators: [
    withTaskDetailStory(
      { viewer: 'visitor', task: storyTaskDetail({ quotes: [] }) },
      wide,
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('button', { name: /Activity/ })
    expect(canvas.queryByRole('button', { name: /Analytics/ })).toBeNull()
  },
}
