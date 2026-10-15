import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'

import { withTaskBrowseStory } from '../../../helpers/taskBrowseStoryDecorator'
import { storyBrowseTasks } from '../../../helpers/taskBrowseStoryFixtures'
import { MobileTaskCarousel } from './MobileTaskCarousel'

/** The strip sits at the bottom of a phone screen over the map. */
const meta = {
  title: 'Tasks/MobileTaskCarousel',
  component: MobileTaskCarousel,
  parameters: {
    layout: 'padded',
    nextjs: { navigation: { pathname: '/search' } },
  },
  decorators: [
    (Story) => (
      <Box w="full" maxW="420px">
        <Story />
      </Box>
    ),
  ],
  globals: { viewport: { value: 'mobile1' } },
} satisfies Meta<typeof MobileTaskCarousel>

export default meta
type Story = StoryObj<typeof meta>

const phone = { isDesktop: false }

/** Results nearest first: the first card is centred, the next one peeks. */
export const Results: Story = {
  decorators: [withTaskBrowseStory({ ...phone })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText(storyBrowseTasks[0].title)
  },
}

/** First page loading: one skeleton card. */
export const Loading: Story = {
  decorators: [withTaskBrowseStory({ ...phone, query: 'loading' })],
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelector('[aria-busy]')).not.toBeNull(),
    )
  },
}

/** A single result: one card, nothing to swipe to. */
export const SingleResult: Story = {
  decorators: [withTaskBrowseStory({ ...phone, tasks: [storyBrowseTasks[0]] })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText(storyBrowseTasks[0].title)
  },
}

/** A map pin is selected: the strip scrolls to that task's card. */
export const Selected: Story = {
  decorators: [
    withTaskBrowseStory({ ...phone, selectedTaskId: 'browse-task-3' }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText(storyBrowseTasks[2].title)
  },
}

/** Nothing matches and no filter is applied: the empty-state card. */
export const NoResults: Story = {
  decorators: [withTaskBrowseStory({ ...phone, tasks: [] })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('No tasks match your search')
  },
}

/** Nothing matches the applied filter: the card offers Clear filters. */
export const NoResultsWithFilters: Story = {
  decorators: [
    withTaskBrowseStory({
      ...phone,
      tasks: [],
      initialState: { searchText: 'chandelier' },
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('button', { name: 'Clear filters' })
  },
}

/** The request failed: the strip shows nothing (the search sheet has the error row). */
export const LoadFailed: Story = {
  decorators: [withTaskBrowseStory({ ...phone, query: 'error' })],
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelector('button')).toBeNull(),
    )
  },
}
