import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { withTaskBrowseStory } from '../../../helpers/taskBrowseStoryDecorator'
import {
  storyBrowseTaskPage,
  storyBrowseTasks,
} from '../../../helpers/taskBrowseStoryFixtures'
import { SearchResultsListTitle } from '../../../search/components/results/SearchResultsListTitle'
import { TaskList } from './TaskList'

/** The list fills its parent's height, like the search panel's results column. */
const meta = {
  title: 'Tasks/TaskList',
  component: TaskList,
  parameters: {
    layout: 'padded',
    nextjs: { navigation: { pathname: '/search' } },
  },
  decorators: [
    (Story) => (
      <Box w="460px" maxW="full" h="640px">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof TaskList>

export default meta
type Story = StoryObj<typeof meta>

/** Results nearest first, nothing selected. */
export const Results: Story = {
  decorators: [withTaskBrowseStory()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText(storyBrowseTasks[0].title)
  },
}

/** First page loading: four skeleton cards. */
export const Loading: Story = {
  decorators: [withTaskBrowseStory({ query: 'loading' })],
}

/** A task is selected: its card expands and shows the details arrow. */
export const Selected: Story = {
  decorators: [withTaskBrowseStory({ selectedTaskId: 'browse-task-2' })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitFor(() =>
      expect(
        canvas.getByRole('link', { name: 'View task', hidden: false }),
      ).toBeVisible(),
    )
  },
}

/** New results loading: the old ones stay under a slim progress bar. */
export const Refreshing: Story = {
  decorators: [withTaskBrowseStory({ query: 'refreshing' })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('progressbar', { name: 'Updating results…' })
    await canvas.findByText(storyBrowseTasks[0].title)
  },
}

/** The request failed: a warning row with Try again. */
export const LoadFailed: Story = {
  decorators: [withTaskBrowseStory({ query: 'error' })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('alert')
    await canvas.findByRole('button', { name: 'Try again' })
  },
}

/** Nothing matches, and no filter is applied. */
export const NoResults: Story = {
  decorators: [withTaskBrowseStory({ tasks: [] })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('No tasks match your search')
    expect(canvas.queryByRole('button', { name: 'Clear filters' })).toBeNull()
  },
}

/** Nothing matches the applied filter: the empty state offers Clear filters. */
export const NoResultsWithFilters: Story = {
  decorators: [
    withTaskBrowseStory({
      tasks: [],
      initialState: { searchText: 'chandelier' },
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('button', { name: 'Clear filters' })
  },
}

/** A full page came back (100 tasks): "Load more tasks" under the list. */
export const HasMore: Story = {
  decorators: [withTaskBrowseStory({ tasks: storyBrowseTaskPage() })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('button', { name: 'Load more tasks' })
  },
}

/** Load more was pressed: the button shows its spinner while the page loads. */
export const LoadingMore: Story = {
  decorators: [
    withTaskBrowseStory({
      tasks: storyBrowseTaskPage(),
      query: 'loadingMore',
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Load more tasks' }),
    )
    // Loading hides the label from the accessibility tree: find it by state.
    await waitFor(() =>
      expect(
        canvasElement.querySelector('button[data-loading]'),
      ).toBeDisabled(),
    )
  },
}

/** With the /search results title above the cards. */
export const WithResultsTitle: Story = {
  args: { header: <SearchResultsListTitle /> },
  decorators: [withTaskBrowseStory()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { name: '5 tasks near London' })
  },
}

/** Inside the phone search sheet: a tap opens the task at once, so no details arrow. */
export const InSearchSheet: Story = {
  args: { onOpenTask: () => {} },
  decorators: [withTaskBrowseStory({ selectedTaskId: 'browse-task-2' })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText(storyBrowseTasks[1].title)
    expect(canvas.queryByRole('link', { name: 'View task' })).toBeNull()
  },
}
