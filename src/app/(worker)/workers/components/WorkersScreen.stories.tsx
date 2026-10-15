import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { WorkersScreen } from './WorkersScreen'
import { withWorkersApollo } from './workersStoryDecorator'
import { storyWorkers } from './workersStoryFixtures'

/**
 * Worker directory: area map on top, the search bar over it, results below.
 * The map loads live Mapbox tiles when a token is configured, otherwise it
 * shows its "Map preview unavailable" band. Search results are story data.
 */
const meta = {
  title: 'Workers/WorkersScreen',
  component: WorkersScreen,
  parameters: { layout: 'fullscreen' },
  args: { initialUrlState: {} },
} satisfies Meta<typeof WorkersScreen>

export default meta
type Story = StoryObj<typeof meta>

/** Results for the default area (London) at 10 miles. */
export const Default: Story = {
  decorators: [withWorkersApollo()],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole(
        'heading',
        { name: '8 workers near London' },
        { timeout: 5000 },
      ),
    ).toBeVisible()
  },
}

/** Opened from a shared link: skills search, identity filter and a 25 mile radius already applied. */
export const SharedFilters: Story = {
  args: {
    initialUrlState: {
      radiusMiles: 25,
      searchText: 'plumbing',
      verifiedOnly: true,
    },
  },
  decorators: [
    withWorkersApollo({
      workers: storyWorkers.filter((worker) => worker.isVerified).slice(0, 4),
    }),
  ],
}

/** Phone: compact search bar under the map, two-column results. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [withWorkersApollo()],
}

/** Search still loading: skeleton title and cards under the map. */
export const Loading: Story = {
  decorators: [withWorkersApollo({ workers: null })],
}

/** No workers in the area: the empty-state card. */
export const Empty: Story = {
  decorators: [withWorkersApollo({ workers: [] })],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(
        'No workers here yet',
        {},
        { timeout: 5000 },
      ),
    ).toBeVisible()
  },
}
