import { Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { QuoteCard } from './QuoteCard'

const meta = {
  title: 'Patterns/QuoteCard',
  component: QuoteCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    workerName: 'Aisha Patel',
    rating: '4.9',
    amount: '£240',
    message:
      'Happy to take on the fence repair in Hackney this weekend. I can bring my own tools and treated timber, and finish in a single afternoon.',
    status: 'OPEN',
    onAccept: () => {},
    onDecline: () => {},
  },
} satisfies Meta<typeof QuoteCard>

export default meta

type Story = StoryObj<typeof meta>

export const OpenQuote: Story = {
  render: (args) => <QuoteCard {...args} maxW="420px" />,
}

export const WithPhoto: Story = {
  args: {
    workerName: 'Tom Okafor',
    workerAvatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    rating: '4.7',
    amount: '£85',
    message:
      'I can do the end-of-tenancy clean in Clapham on Friday morning. Two-hour slot, eco products included.',
    status: 'OPEN',
  },
  render: (args) => <QuoteCard {...args} maxW="420px" />,
}

export const AwardedQuote: Story = {
  args: {
    workerName: 'Marek Nowak',
    rating: '5.0',
    amount: '£560',
    message:
      'Quoted for the bathroom re-tile in Islington. Materials sourced locally, three days on site, fully insured.',
    status: 'AWARDED',
    actionsDisabled: true,
  },
  render: (args) => <QuoteCard {...args} maxW="420px" />,
}

export const DeclinedQuote: Story = {
  args: {
    workerName: 'Grace Bennett',
    rating: '4.2',
    amount: '£120',
    message:
      'Available for the flat-pack assembly in Camden midweek. Three wardrobes and a desk, around two hours.',
    status: 'CANCELLED',
    statusLabel: 'Declined',
    onAccept: undefined,
    onDecline: undefined,
  },
  render: (args) => <QuoteCard {...args} maxW="420px" />,
}

export const NoReviewsYet: Story = {
  args: {
    workerName: 'Dele Adebayo',
    rating: undefined,
    amount: '£45',
    message:
      'New to Slashie but keen — can sort the lawn mow and hedge trim in Greenwich this Saturday.',
    status: 'OPEN',
  },
  render: (args) => <QuoteCard {...args} maxW="420px" />,
}

export const QuoteList: Story = {
  render: () => (
    <Stack gap={4} maxW="420px">
      <QuoteCard
        workerName="Aisha Patel"
        rating="4.9"
        amount="£240"
        message="Fence repair in Hackney this weekend — own tools and treated timber, finished in an afternoon."
        status="OPEN"
        onAccept={() => {}}
        onDecline={() => {}}
      />
      <QuoteCard
        workerName="Marek Nowak"
        rating="5.0"
        amount="£560"
        message="Bathroom re-tile in Islington. Materials sourced locally, three days on site, fully insured."
        status="OPEN"
        onAccept={() => {}}
        onDecline={() => {}}
      />
      <QuoteCard
        workerName="Grace Bennett"
        rating="4.2"
        amount="£120"
        message="Flat-pack assembly in Camden midweek. Three wardrobes and a desk, around two hours."
        status="OPEN"
        onAccept={() => {}}
        onDecline={() => {}}
      />
    </Stack>
  ),
}
