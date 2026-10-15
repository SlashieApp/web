import { Stack } from '@chakra-ui/react'
import { QuoteStatus } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import { storyAvatarUrl, storyMe } from '@/app/(auth)/helpers/authStoryFixtures'

import { ThreadTimelineItem } from './ThreadTimelineItem'
import {
  myMessage,
  quoteFlash,
  reviewFlash,
  theirMessage,
} from './messagesStoryFixtures'

/** The task owner, who can act on a pending quote flash. */
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

/** A thread's timeline: flashes centred, bubbles left (them) and right (me). */
export const Timeline: Story = {
  decorators: [asOwner],
  render: (args) => (
    <Stack gap={3} maxW="640px">
      {[quoteFlash, theirMessage, myMessage, reviewFlash].map((item) => (
        <ThreadTimelineItem key={item.id} item={item} locale={args.locale} />
      ))}
    </Stack>
  ),
}

/** Quote flash, seen by the worker who sent it: the quote shows Awaiting reply. */
export const Flash: Story = {
  decorators: [asWorker],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('New quote: £80')).toBeVisible()
    await expect(canvas.getByText('Awaiting reply')).toBeVisible()
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

/** The task owner on a pending quote flash: Accept (pick a time) or Decline. */
export const QuoteFlashOwner: Story = {
  decorators: [asOwner],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('button', { name: 'Accept' }),
    ).toBeVisible()
  },
}

/** After the owner accepted someone else (BE-81 NOT_SELECTED). */
export const QuoteFlashNotSelected: Story = {
  args: {
    item: {
      ...quoteFlash,
      quote: quoteFlash.quote
        ? { ...quoteFlash.quote, status: QuoteStatus.NotSelected }
        : null,
    },
  },
  decorators: [asWorker],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('Not selected'),
    ).toBeVisible()
  },
}

/** Review prompt after the job: a Leave a review button. */
export const ReviewPrompt: Story = {
  args: { item: reviewFlash },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('link', {
        name: 'Leave a review',
      }),
    ).toBeVisible()
  },
}

/** An announcement with a picture above the title. */
export const FlashWithImage: Story = {
  args: {
    item: {
      ...quoteFlash,
      id: 'flash-image',
      quote: null,
      quoteId: null,
      taskId: null,
      title: 'New: message workers in the app',
      body: 'Once you accept a quote you can chat with the worker right here.',
      imageUrl: storyAvatarUrl('NEW', '#3b6fd4'),
    },
  },
}

/** A flash with only a title and no body or quote. */
export const FlashTitleOnly: Story = {
  args: {
    item: {
      ...quoteFlash,
      id: 'flash-title',
      quote: null,
      quoteId: null,
      title: 'Booking confirmed',
      body: '',
    },
  },
}
