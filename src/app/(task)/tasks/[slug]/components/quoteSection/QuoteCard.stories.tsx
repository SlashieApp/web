import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { QuoteCard } from './QuoteCard'

const meta = {
  title: 'taskDetail/QuoteSection/QuoteCard',
  component: QuoteCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  render: (args) => (
    <Box maxW="480px" w="full">
      <QuoteCard {...args} />
    </Box>
  ),
} satisfies Meta<typeof QuoteCard>

export default meta

type Story = StoryObj<typeof meta>

const base = {
  name: 'Jordan Lee',
  avatarLabel: 'JL',
  avatarUrl:
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop',
  priceLabel: '£85',
  priceKindLabel: 'Fixed price',
  message: 'I can do this Saturday morning with my own tools.',
  respondedLabel: 'Responded 2 hours ago',
  showVerified: true,
}

export const ListDefault: Story = {
  args: { ...base, variant: 'list', showPrice: true },
}

export const ListVisitorNoPrice: Story = {
  args: {
    ...base,
    variant: 'list',
    showPrice: false,
    priceLabel: '',
  },
}

export const ListLowestPricePrimary: Story = {
  args: {
    ...base,
    acceptPrimary: true,
    onAccept: () => {},
    onDecline: () => {},
  },
}

export const ListAcceptLoading: Story = {
  args: {
    ...base,
    onAccept: () => {},
    onDecline: () => {},
    acceptLoading: true,
  },
}

export const ListDeclineLoading: Story = {
  args: {
    ...base,
    onAccept: () => {},
    onDecline: () => {},
    declineLoading: true,
  },
}

export const ListOwnQuote: Story = {
  args: { ...base, isOwnQuote: true },
}

export const ListNoMessage: Story = {
  args: { ...base, message: null },
}

export const CardVariant: Story = {
  args: { ...base, variant: 'card' },
}
