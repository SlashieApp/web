import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { TaskBackButton } from './TaskHeaderControls'

const meta = {
  title: 'Task detail/Layout/TaskHeaderControls',
  component: TaskBackButton,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TaskBackButton>

export default meta
type Story = StoryObj<typeof meta>

/** On solid chrome (phone title row): a ghost icon button. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const button = await within(canvasElement).findByRole('button', {
      name: 'Go back',
    })
    expect(button).toBeVisible()
  },
}

/** Floating over the map (desktop): translucent white chip. */
export const OverMap: Story = {
  args: { overlay: true },
  decorators: [
    (Story) => (
      <Box p={6} bg="linear-gradient(135deg, #EEF3F0 0%, #DCE6E0 100%)">
        <Story />
      </Box>
    ),
  ],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('button', { name: 'Go back' })
  },
}
