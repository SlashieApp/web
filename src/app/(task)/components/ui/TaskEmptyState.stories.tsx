import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { withTaskBrowseStory } from '../../helpers/taskBrowseStoryDecorator'
import { TaskEmptyState } from './TaskEmptyState'

const meta = {
  title: 'Tasks/TaskEmptyState',
  component: TaskEmptyState,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <Box maxW="460px">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof TaskEmptyState>

export default meta
type Story = StoryObj<typeof meta>

/** Nothing matches and no filter is applied: just the message. */
export const NoFilters: Story = {
  decorators: [withTaskBrowseStory({ tasks: [] })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('No tasks match your search')
    expect(canvas.queryByRole('button', { name: 'Clear filters' })).toBeNull()
  },
}

/** A filter is applied: the card also offers Clear filters, which clears it. */
export const WithFilters: Story = {
  decorators: [
    withTaskBrowseStory({
      tasks: [],
      initialState: { searchText: 'chandelier' },
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Clear filters' }),
    )
    await waitFor(() =>
      expect(
        canvas.queryByRole('button', { name: 'Clear filters' }),
      ).toBeNull(),
    )
  },
}
