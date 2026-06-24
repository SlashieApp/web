import { HStack, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Badge, StatusPill } from '@/ui/Badge'
import { Card } from './Card'

const meta = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    layout: { control: 'inline-radio', options: ['default', 'section'] },
    interactive: { control: 'boolean' },
    isActive: { control: 'boolean' },
    eyebrow: { control: 'text' },
    heading: { control: 'text' },
    bodyGap: { control: 'number' },
  },
  args: {
    layout: 'section',
    interactive: false,
    isActive: false,
    eyebrow: 'Profile',
    heading: 'Complete your worker profile',
  },
  render: (args) => (
    <Card {...args}>
      <Text fontSize="sm" color="text.muted" lineHeight="tall">
        Add a photo and skills so customers trust your quotes.
      </Text>
    </Card>
  ),
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

/** Interactive playground driven by the Controls panel. */
export const Playground: Story = {}

/** Plain wrapper card (no title block). */
export const Default: Story = {
  args: { layout: 'default', eyebrow: undefined, heading: undefined },
  render: (args) => (
    <Card {...args}>
      <Stack gap={1}>
        <Text fontWeight={700} color="text.default">
          Fix leaking kitchen tap
        </Text>
        <Text fontSize="sm" color="text.muted">
          Camden, £40 to £80, 2 quotes
        </Text>
      </Stack>
    </Card>
  ),
}

/** Titled dashboard / task-detail block. */
export const Section: Story = {
  args: { layout: 'section' },
}

/**
 * Clickable row. Keyboard-focusable (role=button, tabIndex=0) with a visible
 * SDL focus ring and `bg.subtle` hover surface.
 */
export const Interactive: Story = {
  args: {
    layout: 'default',
    interactive: true,
    eyebrow: undefined,
    heading: undefined,
  },
  render: (args) => (
    <Card {...args}>
      <Stack gap={1}>
        <Text fontWeight={700} color="text.default">
          Fix leaking kitchen tap
        </Text>
        <Text fontSize="sm" color="text.muted">
          Tab to focus, hover to preview the interactive surface.
        </Text>
      </Stack>
    </Card>
  ),
}

/** Active/selected card — border highlighted with `action.primary`. */
export const Active: Story = {
  args: { heading: 'Garden tidy-up', isActive: true },
  render: (args) => (
    <Card {...args}>
      <Text fontSize="sm" color="text.muted">
        Stronger border when the card is the active selection on /requests.
      </Text>
    </Card>
  ),
}

/** Status is shown with a dot + label (never colour alone). */
export const WithStatus: Story = {
  args: { eyebrow: undefined, heading: undefined, layout: 'section' },
  render: () => (
    <Card layout="section" maxW="sm">
      <HStack justify="space-between">
        <Text fontWeight={700} color="text.default">
          Garden tidy-up
        </Text>
        <StatusPill status="OPEN" />
      </HStack>
      <Text fontSize="sm" color="text.muted">
        Posted 2 hours ago, 3 quotes received.
      </Text>
    </Card>
  ),
}

/** Header slot replaces eyebrow/heading for richer title rows. */
export const CustomHeader: Story = {
  args: { eyebrow: undefined, heading: undefined },
  render: () => (
    <Card
      layout="section"
      maxW="sm"
      header={
        <HStack justify="space-between">
          <Text fontWeight={800} color="text.default">
            Slashie Unlimited
          </Text>
          <Badge variant="success" dot>
            £9/mo
          </Badge>
        </HStack>
      }
    >
      <Text fontSize="sm" color="text.muted">
        Unlimited quotes and priority placement in browse.
      </Text>
    </Card>
  ),
}

/** Overview of every Card configuration in a single canvas. */
export const AllVariants: Story = {
  render: () => (
    <Stack gap={5} maxW="md">
      <Card>
        <Text fontWeight={700} color="text.default">
          Default wrapper
        </Text>
      </Card>
      <Card
        layout="section"
        eyebrow="Profile"
        heading="Section with title block"
      >
        <Text fontSize="sm" color="text.muted">
          Eyebrow + heading + stacked body.
        </Text>
      </Card>
      <Card interactive>
        <Text fontWeight={700} color="text.default">
          Interactive (hover + focus ring)
        </Text>
      </Card>
      <Card layout="section" heading="Active selection" isActive>
        <Text fontSize="sm" color="text.muted">
          Border highlighted with action.primary.
        </Text>
      </Card>
    </Stack>
  ),
}
