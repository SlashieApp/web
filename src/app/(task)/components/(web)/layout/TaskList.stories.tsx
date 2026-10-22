import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { useUserStore } from '@/app/(auth)/store/user'

import { withTaskBrowseStory } from '../../../helpers/taskBrowseStoryDecorator'
import {
  storyBrowseTask,
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

/** Results nearest first, nothing selected. Cards have no "jobs done" line (FE-369). */
export const Results: Story = {
  decorators: [withTaskBrowseStory()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Comes through the `Tasks` query shape, so a dropped field fails here.
    await canvas.findByText(storyBrowseTasks[0].title)
    expect(canvas.queryByText(/jobs done/i)).toBeNull()
  },
}

/** Signed in: tasks you posted say Hosted, tasks you quoted on say Quoted. */
export const SignedInRoles: Story = {
  decorators: [
    withTaskBrowseStory({
      tasks: [
        storyBrowseTask({
          id: 'mine',
          title: 'Hang three shelves',
          poster: { id: 'viewer-1' },
        }),
        storyBrowseTask({
          id: 'quoted',
          title: 'Assemble a standing desk',
          quotes: [
            {
              id: 'q-1',
              taskId: 'quoted',
              workerUserId: 'viewer-1',
              status: 'PENDING',
              createdAt: '2026-10-14T09:00:00.000Z',
            },
          ],
        }),
        storyBrowseTask({ id: 'other', title: 'Clear a small garden' }),
      ],
    }),
  ],
  beforeEach: () => {
    useUserStore.setState({
      user: {
        id: 'viewer-1',
        email: 'sam@example.com',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    })
    return () => useUserStore.setState({ user: null })
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Hang three shelves')
    // Cards fade in one after another.
    await waitFor(() => expect(canvas.getByText('Hosted')).toBeVisible())
    await waitFor(() => expect(canvas.getByText('Quoted')).toBeVisible())
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
    // The card expands with an animation; allow for a busy parallel run.
    await waitFor(
      () =>
        expect(
          canvas.getByRole('link', { name: 'View task', hidden: false }),
        ).toBeVisible(),
      { timeout: 3000 },
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
