import { Box, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ViewTransition } from './ViewTransition'

const meta = {
  title: 'ui/ViewTransition',
  component: ViewTransition,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ViewTransition>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'task-card',
    children: (
      <Box bg="bg.surface" p={4} borderRadius="lg" boxShadow="e2">
        <Text fontSize="sm">Named view-transition boundary</Text>
      </Box>
    ),
  },
}
