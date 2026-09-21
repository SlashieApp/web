import { Box, Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { QuoteCard } from './QuoteCard'

const meta = {
  title: 'task/tasks/quotes/QuoteCard',
  component: QuoteCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  render: (args) => (
    <Box maxW="960px" w="full">
      <QuoteCard {...args} />
    </Box>
  ),
} satisfies Meta<typeof QuoteCard>

export default meta

type Story = StoryObj<typeof meta>

const james = {
  name: 'James Carter',
  avatarLabel: 'JC',
  avatarUrl:
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop',
  priceLabel: '£33',
  priceKindLabel: 'Fixed price',
  message:
    "Hi! I can help with this tomorrow. I've got the right tools and plenty of experience with small home jobs. Happy to get it sorted for you.",
  availabilityLabel: 'Available tomorrow',
  durationLabel: '2–3 hrs est.',
  distanceLabel: '1.2 miles away',
  ratingLine: '4.9 (124 reviews)',
  showVerified: true,
  showBackgroundChecked: true,
  showPrice: true,
} satisfies Partial<Story['args']>

export const Default: Story = {
  args: { ...james },
}

export const BestMatch: Story = {
  args: {
    ...james,
    isBestMatch: true,
    onAccept: () => {},
    messageHref: '/dashboard/messages',
  },
}

export const OwnerWithActions: Story = {
  args: {
    ...james,
    name: 'Daniel Moore',
    avatarLabel: 'DM',
    priceLabel: '£38',
    ratingLine: '4.8 (86 reviews)',
    distanceLabel: '1.6 miles away',
    message:
      "I can do this for you tomorrow morning. I'll bring my own tools and make sure it's done properly.",
    onAccept: () => {},
    onDecline: () => {},
    messageHref: '/dashboard/messages',
  },
}

export const OwnQuote: Story = {
  args: {
    ...james,
    isOwnQuote: true,
    statusBadge: 'yours',
  },
}

export const VisitorNoPrice: Story = {
  args: {
    ...james,
    showPrice: false,
    priceLabel: '',
    isBestMatch: true,
  },
}

export const NoMessage: Story = {
  args: {
    ...james,
    message: null,
    showVerified: false,
    showBackgroundChecked: false,
    ratingLine: null,
  },
}

export const List: Story = {
  render: () => (
    <Stack gap={4} maxW="960px" w="full">
      <QuoteCard
        {...james}
        isBestMatch
        onAccept={() => {}}
        messageHref="/dashboard/messages"
      />
      <QuoteCard
        {...james}
        name="Daniel Moore"
        avatarLabel="DM"
        priceLabel="£38"
        ratingLine="4.8 (86 reviews)"
        distanceLabel="1.6 miles away"
        message="I can do this for you tomorrow morning. I'll bring my own tools and make sure it's done properly."
        onAccept={() => {}}
        messageHref="/dashboard/messages"
      />
      <QuoteCard
        {...james}
        name="Sophie Williams"
        avatarLabel="SW"
        avatarUrl="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop"
        priceLabel="£41"
        ratingLine="4.7 (73 reviews)"
        distanceLabel="2.4 miles away"
        availabilityLabel="Available Saturday, 16 Sep"
        message="I'm free this weekend if that works for you. Let me know if you have any questions!"
        onAccept={() => {}}
        messageHref="/dashboard/messages"
      />
    </Stack>
  ),
}
