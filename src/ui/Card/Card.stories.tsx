import { HStack, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Card } from './Card'

const meta = {
  title: 'ui/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Card>

export default meta

type Story = StoryObj<typeof meta>

export const ProfileCompleteness: Story = {
  render: () => (
    <Card
      layout="section"
      eyebrow="Profile"
      heading="Complete your worker profile"
    >
      <Text fontSize="sm" color="formLabelMuted" lineHeight="tall">
        Add a photo and skills so customers trust your quotes.
      </Text>
    </Card>
  ),
}

export const BrowseTaskRow: Story = {
  render: () => (
    <Card interactive p={4}>
      <Stack gap={1}>
        <Text fontWeight={700} color="cardFg">
          Fix leaking kitchen tap
        </Text>
        <Text fontSize="sm" color="formLabelMuted">
          Camden · £40–£80 · 2 quotes
        </Text>
      </Stack>
    </Card>
  ),
}

export const RequestsSelectedTask: Story = {
  render: () => (
    <Card layout="section" heading="Garden tidy-up" isActive>
      <Text fontSize="sm" color="formLabelMuted">
        Stronger border when the card is the active selection on /requests.
      </Text>
    </Card>
  ),
}

export const BillingPlanHighlight: Story = {
  render: () => (
    <Card p={6} maxW="sm">
      <Stack gap={2}>
        <HStack justify="space-between">
          <Text fontWeight={800} color="cardFg">
            Slashie Unlimited
          </Text>
          <Text fontSize="sm" fontWeight={700} color="primary.700">
            £9/mo
          </Text>
        </HStack>
        <Text fontSize="sm" color="formLabelMuted">
          Unlimited quotes and priority placement in browse.
        </Text>
      </Stack>
    </Card>
  ),
}
