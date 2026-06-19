import { HStack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Card } from './Card'

const meta = {
  title: 'ui/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    isActive: false,
    activeBorderColor: 'secondary',
  },
  argTypes: {
    isActive: { control: 'boolean' },
    activeBorderColor: { control: 'text' },
  },
} satisfies Meta<typeof Card>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Card {...args}>
      <Text fontSize="md" color="cardFg">
        Generic card wrapper. Pass any content via children.
      </Text>
    </Card>
  ),
}

export const SectionDefault: Story = {
  args: {
    layout: 'section',
    eyebrow: 'Overview',
    heading: 'Section title',
    bodyGap: 4,
  },
  render: (args) => (
    <Card {...args}>
      <Text fontSize="sm" color="formLabelMuted" lineHeight="tall">
        Section layout adds eyebrow + heading treatment and stacks body content.
      </Text>
    </Card>
  ),
}

export const SectionEyebrowOnly: Story = {
  args: {
    layout: 'section',
    eyebrow: 'Details',
    heading: undefined,
  },
  render: (args) => (
    <Card {...args}>
      <Text fontSize="sm" color="cardFg">
        When there is no main heading, only the eyebrow label is shown.
      </Text>
    </Card>
  ),
}

export const SectionHeadingOnly: Story = {
  args: {
    layout: 'section',
    eyebrow: undefined,
    heading: 'Photos',
  },
  render: (args) => (
    <Card {...args}>
      <Text fontSize="sm" color="formLabelMuted">
        Optional eyebrow omitted; heading still uses the default size and
        weight.
      </Text>
    </Card>
  ),
}

export const SectionCustomHeader: Story = {
  args: {
    layout: 'section',
    eyebrow: undefined,
    heading: undefined,
    header: (
      <HStack gap={2} justify="space-between" w="full" flexWrap="wrap">
        <Text fontSize="md" fontWeight={700} color="cardFg">
          Custom header row
        </Text>
        <Text fontSize="sm" fontWeight={700} color="primary.600">
          Action
        </Text>
      </HStack>
    ),
  },
  render: (args) => (
    <Card {...args}>
      <Text fontSize="sm" color="formLabelMuted">
        When header is set, eyebrow and heading props are ignored.
      </Text>
    </Card>
  ),
}

export const SectionActive: Story = {
  args: {
    layout: 'section',
    eyebrow: 'Status',
    heading: 'Selected block',
    isActive: true,
    activeBorderColor: 'primary.500',
  },
  render: (args) => (
    <Card {...args}>
      <Text fontSize="sm" color="cardFg">
        Uses isActive for a stronger border (task detail / dashboard selection).
      </Text>
    </Card>
  ),
}
