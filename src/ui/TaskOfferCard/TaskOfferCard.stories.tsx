import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskOfferCard } from './TaskOfferCard'

const meta = {
  title: 'ui/TaskOfferCard',
  component: TaskOfferCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    name: 'Mike R.',
    avatarLabel: 'MR',
    priceLabel: '£120',
    message: 'Available tomorrow morning and can bring parts if needed.',
    ratingSummary: '4.9 (124 reviews)',
    trustBadge: 'pro',
    acceptPrimary: true,
    messageHref: '/dashboard',
    isOwnOffer: false,
    acceptLoading: false,
    acceptDisabled: false,
  },
} satisfies Meta<typeof TaskOfferCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const VerifiedSecondary: Story = {
  args: {
    name: 'Sarah Chen',
    avatarLabel: 'SC',
    priceLabel: '£95',
    trustBadge: 'verified',
    acceptPrimary: false,
    ratingSummary: '4.8 (56 reviews)',
  },
}

export const OwnOffer: Story = {
  args: {
    isOwnOffer: true,
    acceptPrimary: false,
  },
}
