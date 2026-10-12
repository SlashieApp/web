import { Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ThreadTimelineItem } from './ThreadTimelineItem'
import {
  myMessage,
  quoteFlash,
  reviewFlash,
  theirMessage,
} from './messagesStoryFixtures'

const meta = {
  title: 'messages/ThreadTimelineItem',
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
