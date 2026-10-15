import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { browseDatePresetRange } from '../../../helpers/taskBrowseHelpers'
import { withTaskBrowseStory } from '../../../helpers/taskBrowseStoryDecorator'
import {
  storyBrowseTaskPage,
  storyBrowseTasks,
} from '../../../helpers/taskBrowseStoryFixtures'
import { MobileSearchLayout, WebSearchLayout } from './SearchLayouts'

/** Both layouts fill the screen over the map; a story shows a plain surface. */
const meta = {
  title: 'Search/SearchLayouts',
  component: WebSearchLayout,
  parameters: {
    layout: 'fullscreen',
    nextjs: { navigation: { pathname: '/search' } },
  },
  decorators: [
    (Story) => (
      <Box
        position="relative"
        h="100dvh"
        w="full"
        display="flex"
        flexDirection="column"
        bg="bg.subtle"
      >
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof WebSearchLayout>

export default meta
type Story = StoryObj<typeof meta>

const desktop = { globals: { viewport: { value: 'desktop' } } } as const
const phone = { globals: { viewport: { value: 'mobile1' } } } as const
const mobileLayout = { render: () => <MobileSearchLayout /> } as const

/** Desktop: search field, Date and Budget chips and results in a left panel. */
export const WebResults: Story = {
  ...desktop,
  decorators: [withTaskBrowseStory()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { name: '5 tasks near London' })
    await canvas.findByRole('button', { name: /Mount a 55-inch TV/ })
  },
}

/** Desktop with a task selected: its card expands with the details arrow. */
export const WebSelected: Story = {
  ...desktop,
  decorators: [withTaskBrowseStory({ selectedTaskId: 'browse-task-2' })],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('link', { name: 'View task' })
  },
}

/** Desktop while the first page loads: skeleton title and cards. */
export const WebLoading: Story = {
  ...desktop,
  decorators: [withTaskBrowseStory({ query: 'loading' })],
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelector('[aria-busy]')).not.toBeNull(),
    )
  },
}

/** Desktop with a search that matches nothing: empty state, Clear filters. */
export const WebNoResults: Story = {
  ...desktop,
  decorators: [
    withTaskBrowseStory({
      tasks: [],
      initialState: { searchText: 'chandelier' },
    }),
  ],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('button', { name: 'Clear filters' })
  },
}

/** Desktop after the request failed: a warning row with Try again. */
export const WebLoadFailed: Story = {
  ...desktop,
  decorators: [withTaskBrowseStory({ query: 'error' })],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('button', { name: 'Try again' })
  },
}

/** Desktop with search, date and budget applied: active chips and Clear all. */
export const WebWithFilters: Story = {
  ...desktop,
  decorators: [
    withTaskBrowseStory({
      initialState: { searchText: 'tv' },
      dateFilter: browseDatePresetRange('week'),
      budget: { min: '50', max: '200' },
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('button', { name: 'Remove Date filter' })
    await canvas.findByRole('button', { name: 'Remove Budget filter' })
  },
}

/** Desktop with a full page of results: "100+ tasks" and Load more. */
export const WebHasMore: Story = {
  ...desktop,
  decorators: [withTaskBrowseStory({ tasks: storyBrowseTaskPage() })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { name: '100+ tasks near London' })
  },
}

/** Desktop after the map was panned: "Search this area" floats at the bottom. */
export const WebSearchThisArea: Story = {
  ...desktop,
  decorators: [withTaskBrowseStory({ searchThisArea: true })],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('button', {
      name: 'Search this area',
    })
  },
}

/** Phone: logo, search bar and chips on top, the task cards at the bottom. */
export const MobileResults: Story = {
  ...phone,
  ...mobileLayout,
  decorators: [withTaskBrowseStory({ isDesktop: false })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText(storyBrowseTasks[0].title)
    await canvas.findByRole('textbox', { name: 'Search a task' })
  },
}

/** Phone with a task selected: the card strip scrolls to it. */
export const MobileSelected: Story = {
  ...phone,
  ...mobileLayout,
  decorators: [
    withTaskBrowseStory({ isDesktop: false, selectedTaskId: 'browse-task-3' }),
  ],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText(storyBrowseTasks[2].title)
  },
}

/** Phone while the first page loads: one skeleton card. */
export const MobileLoading: Story = {
  ...phone,
  ...mobileLayout,
  decorators: [withTaskBrowseStory({ isDesktop: false, query: 'loading' })],
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelector('[aria-busy]')).not.toBeNull(),
    )
  },
}

/** Phone with a search that matches nothing: the empty-state card. */
export const MobileNoResults: Story = {
  ...phone,
  ...mobileLayout,
  decorators: [
    withTaskBrowseStory({
      isDesktop: false,
      tasks: [],
      initialState: { searchText: 'chandelier' },
    }),
  ],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('button', { name: 'Clear filters' })
  },
}

/** Phone with a search applied: the bar shows it and filter chips sit below. */
export const MobileWithFilters: Story = {
  ...phone,
  ...mobileLayout,
  decorators: [
    withTaskBrowseStory({
      isDesktop: false,
      initialState: { searchText: 'tv' },
      dateFilter: browseDatePresetRange('week'),
    }),
  ],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('button', { name: 'Clear all' })
  },
}

/** Phone after the map was panned: "Search this area" sits above the cards. */
export const MobileSearchThisArea: Story = {
  ...phone,
  ...mobileLayout,
  decorators: [withTaskBrowseStory({ isDesktop: false, searchThisArea: true })],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('button', {
      name: 'Search this area',
    })
  },
}

/** Phone: tapping the search bar opens the search sheet over the screen. */
export const MobileSheetOpen: Story = {
  ...phone,
  ...mobileLayout,
  decorators: [withTaskBrowseStory({ isDesktop: false })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('textbox', { name: 'Search a task' }),
    )
    await within(canvasElement.ownerDocument.body).findByRole('dialog')
  },
}
