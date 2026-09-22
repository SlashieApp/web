import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { EditTaskHelpCard } from './EditTaskHelpCard'

const meta: Meta<typeof EditTaskHelpCard> = {
  title: 'task/tasks/edit/ui/EditTaskHelpCard',
  component: EditTaskHelpCard,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <Box maxW="400px">
        <Story />
      </Box>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
