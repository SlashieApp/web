import { Box, HStack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Badge, Button } from '@ui'

import { TaskDetailMainCtaCard } from './TaskDetailMainCtaCard'

const meta: Meta<typeof TaskDetailMainCtaCard> = {
  title: 'task/tasks/ui/TaskDetailMainCtaCard',
  component: TaskDetailMainCtaCard,
  parameters: { layout: 'padded' },
  args: {
    eyebrow: 'Budget',
    children: (
      <>
        <Text fontSize="lg" fontWeight={600} lineHeight="short">
          £500
        </Text>
        <HStack gap={2}>
          <Badge variant="success">Fixed price</Badge>
          <Text fontSize="sm" color="text.muted">
            Cash
          </Text>
        </HStack>
      </>
    ),
    action: <Button variant="primary">Send a quote</Button>,
  },
  decorators: [
    (Story) => (
      <Box maxW="420px">
        <Story />
      </Box>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
