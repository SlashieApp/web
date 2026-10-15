import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'

import { withTaskBrowseQuery } from '../../helpers/taskBrowseStoryDecorator'
import { storyBrowseTasks } from '../../helpers/taskBrowseStoryFixtures'
import { SearchScreen } from './SearchScreen'

/**
 * The whole /search screen: search panel (desktop) or search bar and carousel
 * (phone) over the map. The map itself lives in the layout's persistent host,
 * so a story shows a plain surface behind it.
 */
const meta = {
  title: 'Search/SearchScreen',
  component: SearchScreen,
  parameters: {
    layout: 'fullscreen',
    nextjs: { navigation: { pathname: '/search' } },
  },
  args: { initialUrlState: {} },
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
} satisfies Meta<typeof SearchScreen>

export default meta
type Story = StoryObj<typeof meta>

/** Both layouts stay mounted (CSS hides one), so wait for a visible match. */
async function expectShown(find: () => HTMLElement[]) {
  await waitFor(() =>
    expect(find().filter((el) => el.checkVisibility()).length).toBeGreaterThan(
      0,
    ),
  )
}

const desktop = { globals: { viewport: { value: 'desktop' } } } as const
const phone = { globals: { viewport: { value: 'mobile1' } } } as const

/** Desktop: the search panel lists tasks nearest first, none selected until picked. */
export const Desktop: Story = {
  ...desktop,
  decorators: [withTaskBrowseQuery()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { name: '5 tasks near London' })
    await expectShown(() => canvas.queryAllByText(storyBrowseTasks[0].title))
    // The phone carousel stays mounted (hidden) on desktop and used to select
    // its first card while setting up, a moment after the results showed.
    await new Promise((resolve) => setTimeout(resolve, 500))
    await expect(
      canvas.getByRole('button', {
        name: `${storyBrowseTasks[0].title}. Select to highlight on map.`,
      }),
    ).not.toHaveAttribute('aria-current')
  },
}

/** Desktop while the first page loads: skeleton title and cards. */
export const DesktopLoading: Story = {
  ...desktop,
  decorators: [withTaskBrowseQuery({ query: 'loading' })],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('searchbox', {
      name: 'Search a task',
    })
  },
}

/** Desktop, nothing matches the search: the empty state with Clear filters. */
export const DesktopNoResults: Story = {
  ...desktop,
  args: { initialUrlState: { taskSearchText: 'chandelier' } },
  decorators: [withTaskBrowseQuery({ tasks: [] })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expectShown(() => canvas.queryAllByText('No tasks match your search'))
    await canvas.findByRole('button', { name: 'Clear filters' })
  },
}

/** Desktop after the request failed: a warning row with Try again. */
export const DesktopLoadFailed: Story = {
  ...desktop,
  decorators: [withTaskBrowseQuery({ query: 'error' })],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('button', { name: 'Try again' })
  },
}

/** A shared link: centre, radius and search come from the URL. */
export const DesktopSharedLink: Story = {
  ...desktop,
  args: {
    initialUrlState: {
      lat: 51.5362,
      lng: -0.1033,
      radiusMiles: 5,
      taskSearchText: 'tap',
    },
  },
  decorators: [withTaskBrowseQuery()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { name: '5 tasks near this area' })
    await expectShown(() => canvas.queryAllByDisplayValue('tap'))
  },
}

/** Phone: logo, search bar and filter chips on top, task cards at the bottom. */
export const Mobile: Story = {
  ...phone,
  decorators: [withTaskBrowseQuery()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expectShown(() => canvas.queryAllByText(storyBrowseTasks[0].title))
    await canvas.findByRole('textbox', { name: 'Search a task' })
    // The centred card starts selected, so its pin is highlighted.
    await expectShown(() =>
      canvas
        .queryAllByLabelText(`${storyBrowseTasks[0].title}. View task details.`)
        .filter((el) => el.getAttribute('aria-current') === 'true'),
    )
  },
}

/** Phone while the first page loads: one skeleton card. */
export const MobileLoading: Story = {
  ...phone,
  decorators: [withTaskBrowseQuery({ query: 'loading' })],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('textbox', {
      name: 'Search a task',
    })
  },
}

/** Phone, nothing matches the search: the empty-state card replaces the cards. */
export const MobileNoResults: Story = {
  ...phone,
  args: { initialUrlState: { taskSearchText: 'chandelier' } },
  decorators: [withTaskBrowseQuery({ tasks: [] })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expectShown(() => canvas.queryAllByText('No tasks match your search'))
  },
}
