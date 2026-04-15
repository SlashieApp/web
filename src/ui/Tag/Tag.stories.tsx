import { Box, HStack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Tag } from './Tag'

const meta = {
  title: 'ui/Tag',
  component: Tag,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    children: 'Active task',
    variant: 'active' as const,
  },
} satisfies Meta<typeof Tag>

export default meta

type Story = StoryObj<typeof meta>

export const ActiveTask: Story = {
  args: {
    variant: 'active',
    children: 'Active task',
  },
}

export const PendingQuote: Story = {
  args: {
    variant: 'pending',
    children: 'Pending quote',
  },
}

export const Urgent: Story = {
  args: {
    variant: 'urgent',
    children: 'Urgent',
  },
}

export const AllVariants: Story = {
  render: (_args, context) => {
    const isDark = context.globals.theme === 'dark'
    return (
      <Box
        bg={isDark ? '#222222' : '#ffffff'}
        p={8}
        borderRadius="lg"
        w="fit-content"
      >
        <HStack gap={3} flexWrap="wrap">
          <Tag variant="active">Active task</Tag>
          <Tag variant="pending">Pending quote</Tag>
          <Tag variant="urgent">Urgent</Tag>
        </HStack>
      </Box>
    )
  },
}
