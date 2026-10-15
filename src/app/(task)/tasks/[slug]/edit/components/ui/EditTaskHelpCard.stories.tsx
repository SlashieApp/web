import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within } from 'storybook/test'

import { EditTaskHelpCard } from './EditTaskHelpCard'

/** The "Need help?" card under the edit preview. */
const meta = {
  title: 'Edit task/EditTaskHelpCard',
  component: EditTaskHelpCard,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <Box maxW="400px">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof EditTaskHelpCard>

export default meta
type Story = StoryObj<typeof meta>

/** The help text with links to the safety guide and support. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('link', { name: 'Paying & meeting safely' })
    await canvas.findByRole('link', { name: 'Contact support' })
  },
}

/** Phone width: the card sits under the form. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
}
