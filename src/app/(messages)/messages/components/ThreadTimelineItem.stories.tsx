import { Stack } from '@chakra-ui/react'
import { QuoteStatus } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { useUserStore } from '@/app/(auth)/store/user'

import { ThreadTimelineItem } from './ThreadTimelineItem'
import {
  myMessage,
  quoteFlash,
  reviewFlash,
  theirMessage,
} from './messagesStoryFixtures'

const meta = {
  title: 'Messages/ThreadTimelineItem',
  component: ThreadTimelineItem,
  args: { item: quoteFlash, locale: 'en-GB' },
} satisfies Meta<typeof ThreadTimelineItem>

export default meta
type Story = StoryObj<typeof meta>

/** A thread's timeline: flashes centred, bubbles left (them) and right (me). */
export const Timeline: Story = {
  render: (args) => (
    <Stack gap={3} maxW="640px">
      {[quoteFlash, theirMessage, myMessage, reviewFlash].map((item) => (
        <ThreadTimelineItem key={item.id} item={item} locale={args.locale} />
      ))}
    </Stack>
  ),
}

export const Flash: Story = {}

export const Message: Story = { args: { item: theirMessage } }

/** The task owner on a pending quote flash: Accept (pick a time) or Decline. */
export const QuoteFlashOwner: Story = {
  decorators: [
    (Story) => {
      useUserStore.setState({ me: { id: 'u-owner' } as never })
      return <Story />
    },
  ],
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
}
