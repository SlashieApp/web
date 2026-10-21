import { Stack } from '@chakra-ui/react'
import { FlashKind, QuoteStatus } from '@codegen/schema'
import type { ThreadItemFieldsFragment } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import { storyAvatarUrl, storyMe } from '@/app/(auth)/helpers/authStoryFixtures'

import { ThreadTimelineItem } from './ThreadTimelineItem'
import {
  myMessage,
  quoteFlash,
  reviewFlash,
  storyFlashQuote,
  theirMessage,
} from './messagesStoryFixtures'

/** The task owner, who can act on a pending quote. */
const asOwner = withSession({ me: storyMe({ id: 'u-owner' }) })
/** The quoting worker from the fixtures: no actions, only the status. */
const asWorker = withSession({ me: storyMe({ id: 'u-worker' }) })

const meta = {
  title: 'Messages/ThreadTimelineItem',
  component: ThreadTimelineItem,
  args: { item: quoteFlash, locale: 'en-GB' },
} satisfies Meta<typeof ThreadTimelineItem>

export default meta
type Story = StoryObj<typeof meta>

/** Any other event on the task, as the API sends it. */
const event = (
  id: string,
  flashKind: FlashKind,
  title: string,
  body: string,
  quote: ThreadItemFieldsFragment['quote'] = null,
): ThreadItemFieldsFragment => ({
  ...quoteFlash,
  id,
  flashKind,
  title,
  body,
  quoteId: quote?.id ?? null,
  quote,
})

const accepted = event(
  'line-accepted',
  FlashKind.QuoteAccepted,
  'Quote accepted',
  'The quote on "Assemble a wardrobe" was accepted. You can now message each other here.',
  storyFlashQuote({ status: QuoteStatus.Accepted }),
)

/** An info line: no card and nothing to press. */
const line = async (canvasElement: HTMLElement, kind: FlashKind) => {
  await expect(
    canvasElement.querySelector(`[data-flash-line="${kind}"]`),
  ).toBeVisible()
  await expect(canvasElement.querySelector('[data-flash-card]')).toBeNull()
  await expect(within(canvasElement).queryAllByRole('button')).toHaveLength(0)
}

/** A thread's timeline: the quote card, an event line, bubbles left (them) and right (me), and a review prompt. */
export const Timeline: Story = {
  decorators: [asOwner],
  render: (args) => (
    <Stack gap={3} maxW="640px">
      {[quoteFlash, accepted, theirMessage, myMessage, reviewFlash].map(
        (item) => (
          <ThreadTimelineItem key={item.id} item={item} locale={args.locale} />
        ),
      )}
    </Stack>
  ),
}

/** The worker's "quote sent" flash, seen by the poster: the full quote card with Accept and Decline. */
export const QuoteSentPoster: Story = {
  decorators: [asOwner],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('button', { name: 'Accept' }),
    ).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Decline' })).toBeVisible()
    await expect(
      canvasElement.querySelector('[data-flash-card="QUOTE_RECEIVED"]'),
    ).toBeVisible()
  },
}

/** The same card, seen by the worker who sent it: Awaiting reply, no actions. */
export const QuoteSentWorker: Story = {
  decorators: [asWorker],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('New quote: £80')).toBeVisible()
    await expect(canvas.getByText('Awaiting reply')).toBeVisible()
    await expect(canvas.queryByRole('button', { name: 'Accept' })).toBeNull()
  },
}

/** Quote accepted: one line with the quote's price, no card. */
export const QuoteAcceptedLine: Story = {
  args: { item: accepted },
  decorators: [asOwner],
  play: async ({ canvasElement }) => {
    await line(canvasElement, FlashKind.QuoteAccepted)
    await expect(within(canvasElement).getByText(/· £80/)).toBeVisible()
  },
}

/** Another worker was picked: a line, not the quote card. */
export const NotSelectedLine: Story = {
  args: {
    item: event(
      'line-not-selected',
      FlashKind.QuoteNotSelected,
      'Not selected',
      'The customer chose another worker for "Assemble a wardrobe".',
      storyFlashQuote({ status: QuoteStatus.NotSelected }),
    ),
  },
  decorators: [asWorker],
  play: async ({ canvasElement }) =>
    line(canvasElement, FlashKind.QuoteNotSelected),
}

/**
 * A reschedule request: a line; the answer is in the bottom pin. The API
 * attaches the booked quote, but the line leaves its price out.
 */
export const RescheduleRequestedLine: Story = {
  args: {
    item: event(
      'line-reschedule',
      FlashKind.RescheduleRequested,
      'New time proposed',
      'The worker proposed a new time for "Assemble a wardrobe".',
      storyFlashQuote({ status: QuoteStatus.Accepted }),
    ),
  },
  play: async ({ canvasElement }) => {
    await line(canvasElement, FlashKind.RescheduleRequested)
    await expect(within(canvasElement).queryByText(/£/)).toBeNull()
  },
}

/** Marked as done by the other side: a line; confirming is in the bottom pin. */
export const MarkedDoneLine: Story = {
  args: {
    item: event(
      'line-done',
      FlashKind.OrderMarkedDone,
      'Marked as done',
      'The worker marked "Assemble a wardrobe" as done. It completes automatically in 7 days unless marked failed.',
    ),
  },
  play: async ({ canvasElement }) =>
    line(canvasElement, FlashKind.OrderMarkedDone),
}

/** A review prompt: a line that keeps its Leave a review link. */
export const ReviewPrompt: Story = {
  args: { item: reviewFlash },
  play: async ({ canvasElement }) => {
    await line(canvasElement, FlashKind.ReviewPrompt)
    await expect(
      within(canvasElement).getByRole('link', { name: 'Leave a review' }),
    ).toHaveAttribute('href', '/tasks/task-1/review?orderId=o1')
  },
}

/** A line with only a title. */
export const TitleOnlyLine: Story = {
  args: {
    item: event('line-title', FlashKind.OrderCompleted, 'Job completed', ''),
  },
}

/** A Slashie announcement stays a card, with its picture above the title. */
export const Announcement: Story = {
  args: {
    item: {
      ...quoteFlash,
      id: 'flash-image',
      flashKind: FlashKind.SystemAnnouncement,
      quote: null,
      quoteId: null,
      taskId: null,
      title: 'New: message workers in the app',
      body: 'Once you accept a quote you can chat with the worker right here.',
      imageUrl: storyAvatarUrl('NEW', '#3b6fd4'),
    },
  },
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-flash-card="SYSTEM_ANNOUNCEMENT"]'),
    ).toBeVisible()
  },
}

/** A message from the other person: left, grey bubble. */
export const Message: Story = {
  args: { item: theirMessage },
}

/** My own message: right, green bubble. */
export const MyMessage: Story = {
  args: { item: myMessage },
}

/** A long, multi-line message wraps and keeps its line breaks. */
export const LongMessage: Story = {
  args: {
    item: {
      ...theirMessage,
      body: 'Quick note before Saturday.\nI will park the van outside number 12 and need about two hours.\nA very long unbroken link that must not stretch the bubble: https://example.com/guides/mounting-a-bookshelf-on-a-plasterboard-wall-with-the-right-fixings',
    },
  },
}
