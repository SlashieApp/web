import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { MembershipStatusCard } from './MembershipStatusCard'
import {
  membershipFixtureActive,
  membershipFixtureCanceled,
  membershipFixtureFree,
  membershipFixtureTrial,
} from './membershipStoryFixtures'

const meta = {
  title: 'layout/MembershipStatusCard',
  component: MembershipStatusCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof MembershipStatusCard>

export default meta

type Story = StoryObj<typeof meta>

export const FreeTier: Story = {
  args: {
    hasWorker: true,
    membership: membershipFixtureFree,
    variant: 'dropdown',
  },
}

export const Trial: Story = {
  args: {
    hasWorker: true,
    membership: membershipFixtureTrial,
    variant: 'dropdown',
  },
}

export const Active: Story = {
  args: {
    hasWorker: true,
    membership: membershipFixtureActive,
    variant: 'dropdown',
  },
}

export const CanceledUntil: Story = {
  args: {
    hasWorker: true,
    membership: membershipFixtureCanceled,
    variant: 'dropdown',
  },
}

export const CustomerOnly: Story = {
  args: {
    hasWorker: false,
    variant: 'dropdown',
  },
}
