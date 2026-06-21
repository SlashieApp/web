import { HStack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Badge } from './Badge'

const meta = {
  title: 'ui/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Badge>

export default meta

type Story = StoryObj<typeof meta>

// Task schedule (ScheduleChip)

export const ScheduleToday: Story = {
  render: () => (
    <Badge bg="primary.100" color="primary.800">
      Today
    </Badge>
  ),
}

export const ScheduleTomorrow: Story = {
  render: () => (
    <Badge bg="secondary.100" color="secondary.800">
      Tomorrow
    </Badge>
  ),
}

export const ScheduleOverdue: Story = {
  render: () => (
    <Badge bg="red.100" color="red.800">
      Overdue
    </Badge>
  ),
}

// Posted task status (/requests)

export const StatusCollectingQuotes: Story = {
  render: () => <Badge variant="brand">Collecting quotes</Badge>,
}

export const StatusInProgress: Story = {
  render: () => (
    <Badge bg="primary.100" color="primary.800">
      In progress
    </Badge>
  ),
}

export const StatusCompleted: Story = {
  render: () => (
    <Badge bg="badgeBg" color="cardFg">
      Completed
    </Badge>
  ),
}

export const StatusCancelled: Story = {
  render: () => (
    <Badge bg="red.50" color="red.700">
      Cancelled
    </Badge>
  ),
}

export const StatusDraft: Story = {
  render: () => <Badge variant="alternative">Draft</Badge>,
}

// Browse metadata (TaskCard)

export const BrowseHoursAgo: Story = {
  render: () => <Badge variant="brand">2 hours ago</Badge>,
}

export const BrowsePostedYesterday: Story = {
  render: () => <Badge variant="brand">Posted yesterday</Badge>,
}

// Quotes (task detail)

export const QuotesOfferCount: Story = {
  render: () => (
    <Badge
      bg="primary.100"
      color="primary.800"
      borderRadius="full"
      fontSize="xs"
      px={2.5}
    >
      3 offers
    </Badge>
  ),
}

export const QuotesSent: Story = {
  render: () => (
    <Badge bg="neutral.100" color="cardFg">
      Quote sent
    </Badge>
  ),
}

export const QuotesAccepted: Story = {
  render: () => <Badge variant="success">Accepted</Badge>,
}

// Trust & verification

export const TrustVerified: Story = {
  render: () => (
    <Badge bg="primary.100" color="primary.800">
      Verified
    </Badge>
  ),
}

export const TrustUnverified: Story = {
  render: () => (
    <Badge bg="badgeBg" color="cardFg">
      Unverified
    </Badge>
  ),
}

export const TrustLinkExpired: Story = {
  render: () => <Badge variant="danger">Link expired</Badge>,
}

// Worker membership (billing)

export const MembershipActive: Story = {
  render: () => (
    <Badge bg="primary.100" color="primary.800">
      Active
    </Badge>
  ),
}

export const MembershipPastDue: Story = {
  render: () => (
    <Badge bg="orange.100" color="orange.900">
      Past due
    </Badge>
  ),
}

export const MembershipPaymentFailed: Story = {
  render: () => (
    <Badge bg="red.100" color="red.800">
      Payment failed
    </Badge>
  ),
}

export const MembershipTrialEnding: Story = {
  render: () => <Badge variant="warning">Trial ending</Badge>,
}

export const MembershipCanceled: Story = {
  render: () => (
    <Badge bg="badgeBg" color="cardFg">
      Canceled
    </Badge>
  ),
}

// Worker setup & pricing

export const SetupOptional: Story = {
  render: () => (
    <Badge bg="neutral.100" color="formLabelMuted" fontSize="xs">
      Optional
    </Badge>
  ),
}

export const PricingMostPopular: Story = {
  render: () => (
    <Badge
      shape="pill"
      bg="transparent"
      color="primary.700"
      borderWidth="1px"
      borderColor="primary.300"
      fontSize="2xs"
      fontWeight={800}
      letterSpacing="0.08em"
    >
      Most popular
    </Badge>
  ),
}

/** All schedule chips together — matches map/list filter row. */
export const ScheduleRow: Story = {
  render: () => (
    <HStack gap={2}>
      <Badge bg="primary.100" color="primary.800">
        Today
      </Badge>
      <Badge bg="secondary.100" color="secondary.800">
        Tomorrow
      </Badge>
      <Badge bg="red.100" color="red.800">
        Overdue
      </Badge>
    </HStack>
  ),
}
