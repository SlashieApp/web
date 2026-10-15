import { Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LuMail } from 'react-icons/lu'

import { Badge } from '@ui'

import {
  DashboardDetailRow,
  DashboardSectionCard,
} from './DashboardSectionCard'

const meta = {
  title: 'Dashboard/Shared/DashboardSectionCard',
  component: DashboardSectionCard,
  parameters: { layout: 'padded' },
  args: {
    title: 'Contact methods',
    description: 'Confirm email or phone so we can reach you.',
    icon: <LuMail size={18} aria-hidden />,
    children: (
      <Text fontSize="sm" color="text.muted">
        Card content goes here.
      </Text>
    ),
  },
} satisfies Meta<typeof DashboardSectionCard>

export default meta
type Story = StoryObj<typeof meta>

/** Icon, title, description and body. */
export const Default: Story = {}

/** No icon: the title starts at the left edge. */
export const WithoutIcon: Story = {
  args: { icon: undefined },
}

/** No description under the title. */
export const WithoutDescription: Story = {
  args: { description: undefined },
}

/** Editable section: an Edit button sits beside the title. */
export const Editable: Story = {
  args: { onEdit: () => {} },
}

/** Editable with its own button label. */
export const CustomEditLabel: Story = {
  args: { onEdit: () => {}, editLabel: 'Manage' },
}

/** A long title and description wrap inside the card. */
export const LongText: Story = {
  args: {
    title: 'Contact methods and verification for your Slashie account',
    description:
      'Confirm your email or phone so Slashie can reach you about quotes, bookings and reviews. This is contact proof only, not an identity or safety check.',
    onEdit: () => {},
  },
}

/** Detail rows: label on the left, value on the right, optional trailing badge. */
export const DetailRows: Story = {
  args: {
    children: (
      <Stack gap={3}>
        <DashboardDetailRow label="Email" value="sam.carter@example.com" />
        <DashboardDetailRow
          label="Phone"
          value="07700 900123"
          trailing={
            <Badge variant="success" dot shape="pill">
              Verified
            </Badge>
          }
        />
        <DashboardDetailRow label="Date of birth" value="Not added" />
      </Stack>
    ),
  },
}
