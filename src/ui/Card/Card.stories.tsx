import { Box, Center, HStack, Heading, Image, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Card } from './Card'

const sampleAvatars = [
  {
    src: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=128&h=128&fit=crop',
    name: 'Alex',
  },
  {
    src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&h=128&fit=crop',
    name: 'Jordan',
  },
]

const meta = {
  title: 'ui/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {},
} satisfies Meta<typeof Card>

export default meta

type Story = StoryObj<typeof meta>

function TradeCategoryIcon() {
  return (
    <Box as="span" w="26px" h="26px" display="inline-flex" aria-hidden>
      <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
        <title>Trade</title>
        <path
          d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l1.9-1.9a4 4 0 0 1 2 6.9l-6.4 6.4a2.83 2.83 0 1 1-4-4l4.2-4.2"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 20l5-5M6.5 11.5L11 7M8 5l2 2M5 8l2 2"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  )
}

export const Default: Story = {
  render: () => (
    <Card>
      <Text fontSize="md" color="cardFg">
        Generic card wrapper. Pass any content via children.
      </Text>
    </Card>
  ),
}
