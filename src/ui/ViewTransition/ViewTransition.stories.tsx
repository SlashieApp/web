import { Box, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ViewTransition } from './ViewTransition'

const meta = {
  title: 'UI/ViewTransition',
  component: ViewTransition,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ViewTransition>

export default meta
type Story = StoryObj<typeof meta>

/** Named boundary: renders its child as is (passes through outside Next). */
export const Default: Story = {
  args: { name: 'task-card' },
  render: (args) => (
    <ViewTransition {...args}>
      <Box bg="bg.surface" p={4} borderRadius="lg" boxShadow="e2">
        <Text fontSize="sm">Named view-transition boundary</Text>
      </Box>
    </ViewTransition>
  ),
}
