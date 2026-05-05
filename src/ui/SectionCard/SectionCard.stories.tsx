import { HStack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { SectionCard } from './SectionCard'

const meta = {
  title: 'ui/SectionCard',
  component: SectionCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    eyebrow: 'Overview',
    heading: 'Section title',
    bodyGap: 4,
    isActive: false,
  },
  argTypes: {
    isActive: { control: 'boolean' },
    bodyGap: { control: 'number' },
  },
} satisfies Meta<typeof SectionCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <SectionCard {...args}>
      <Text fontSize="sm" color="formLabelMuted" lineHeight="tall">
        Body copy uses the shared card chrome and eyebrow + heading treatment.
        Pass any content as children.
      </Text>
    </SectionCard>
  ),
}

export const EyebrowOnly: Story = {
  args: {
    eyebrow: 'Details',
    heading: undefined,
  },
  render: (args) => (
    <SectionCard {...args}>
      <Text fontSize="sm" color="cardFg">
        When there is no main heading, only the eyebrow label is shown.
      </Text>
    </SectionCard>
  ),
}

export const HeadingOnly: Story = {
  args: {
    eyebrow: undefined,
    heading: 'Photos',
  },
  render: (args) => (
    <SectionCard {...args}>
      <Text fontSize="sm" color="formLabelMuted">
        Optional eyebrow omitted; heading still uses the default size and
        weight.
      </Text>
    </SectionCard>
  ),
}

export const CustomHeader: Story = {
  args: {
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
    <SectionCard {...args}>
      <Text fontSize="sm" color="formLabelMuted">
        When{' '}
        <Text as="span" fontFamily="mono">
          header
        </Text>{' '}
        is set, eyebrow and heading props are ignored.
      </Text>
    </SectionCard>
  ),
}

export const Active: Story = {
  args: {
    eyebrow: 'Status',
    heading: 'Selected block',
    isActive: true,
    activeBorderColor: 'primary.500',
  },
  render: (args) => (
    <SectionCard {...args}>
      <Text fontSize="sm" color="cardFg">
        Uses Card{' '}
        <Text as="span" fontFamily="mono">
          isActive
        </Text>{' '}
        for a stronger border (task detail / dashboard selection).
      </Text>
    </SectionCard>
  ),
}
