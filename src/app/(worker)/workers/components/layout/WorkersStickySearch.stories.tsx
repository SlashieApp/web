import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor } from 'storybook/test'

import { withWorkersStory } from '../workersStoryDecorator'
import { WorkersStickySearch } from './WorkersStickySearch'

/**
 * The search bar sits over the map, then pins to the top of the scrolling
 * `<main>` and docks full width. It watches its nearest `main`, so the story
 * puts it in a short scrolling one.
 */
const meta = {
  title: 'Workers/WorkersStickySearch',
  component: WorkersStickySearch,
  parameters: { layout: 'fullscreen' },
  decorators: [withWorkersStory()],
  render: () => (
    <Box
      as="main"
      h="420px"
      overflowY="auto"
      bg="bg.canvas"
      borderWidth="1px"
      borderColor="border.default"
    >
      <Box h="160px" bg="bg.subtle" />
      <WorkersStickySearch />
      <Box h="900px" />
    </Box>
  ),
} satisfies Meta<typeof WorkersStickySearch>

export default meta
type Story = StoryObj<typeof meta>

/** At the top of the page: a floating rounded card over the map area. */
export const Floating: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-stuck="false"]'),
    ).not.toBeNull()
  },
}

/** Scrolled past the map: the bar pins to the top and docks full width. */
export const Docked: Story = {
  play: async ({ canvasElement }) => {
    const main = canvasElement.querySelector('main')
    if (!main) throw new Error('Story scroll pane not found')
    main.scrollTop = 260
    await waitFor(() =>
      expect(canvasElement.querySelector('[data-stuck="true"]')).not.toBeNull(),
    )
  },
}

/** Phone, docked: the compact area field and Filters button across the full width. */
export const PhoneDocked: Story = {
  ...Docked,
  globals: { viewport: { value: 'mobile1' } },
}
