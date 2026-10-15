import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { withTaskBrowseStory } from '../../helpers/taskBrowseStoryDecorator'
import { TaskBrowseSearchThisAreaButton } from './TaskBrowseSearchThisAreaButton'

/** The overlay pins to the bottom of its parent, like the map pane. */
const meta = {
  title: 'Tasks/TaskBrowseSearchThisAreaButton',
  component: TaskBrowseSearchThisAreaButton,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <Box position="relative" w="full" maxW="520px" h="200px" bg="bg.subtle">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof TaskBrowseSearchThisAreaButton>

export default meta
type Story = StoryObj<typeof meta>

/** The map reported a pan: the button stacks inline in a parent column. */
export const Inline: Story = {
  decorators: [withTaskBrowseStory({ searchThisArea: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('button', { name: 'Search this area' })
  },
}

/** Desktop web: the button floats over the bottom centre of the map. */
export const Overlay: Story = {
  args: { overlay: true },
  decorators: [withTaskBrowseStory({ searchThisArea: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('button', { name: 'Search this area' })
  },
}

/** The map has not moved: the context says hidden, so nothing renders. */
export const Hidden: Story = {
  decorators: [withTaskBrowseStory()],
  play: async ({ canvasElement }) => {
    expect(within(canvasElement).queryByRole('button')).toBeNull()
  },
}
