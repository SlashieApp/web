import { Container } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { withWorkersStory } from '../workersStoryDecorator'
import { storyWorkers } from '../workersStoryFixtures'
import { WorkersResultsGrid } from './WorkersResultsGrid'

/**
 * Directory results: a "N workers near ..." title, then a grid of worker
 * cards, or a skeleton grid while loading and an empty-state card for no hits.
 */
const meta = {
  title: 'Workers/WorkersResultsGrid',
  component: WorkersResultsGrid,
  parameters: { layout: 'fullscreen' },
  render: () => (
    <Container py={6}>
      <WorkersResultsGrid />
    </Container>
  ),
} satisfies Meta<typeof WorkersResultsGrid>

export default meta
type Story = StoryObj<typeof meta>

/** Eight workers near London: verified and not, with and without photo and rating. */
export const Default: Story = {
  decorators: [withWorkersStory()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: '8 workers near London' }),
    ).toBeVisible()
    await expect(await canvas.findByText('Maya Okafor')).toBeVisible()
  },
}

/** One result: the title reads "1 worker near ...". */
export const SingleResult: Story = {
  decorators: [withWorkersStory({ workers: storyWorkers.slice(0, 1) })],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('heading', {
        name: '1 worker near London',
      }),
    ).toBeVisible()
  },
}

/** Phone: the grid drops to two columns. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [withWorkersStory()],
}

/** Phone with filters applied: the active filters show as chips under the title. */
export const PhoneFiltersApplied: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [
    withWorkersStory({
      workers: storyWorkers.filter((worker) => worker.isVerified).slice(0, 4),
      area: { label: 'Camden', lat: 51.539, lng: -0.1426 },
      searchText: 'plumbing',
      verifiedOnly: true,
      radiusMiles: 25,
    }),
  ],
}

/** Search still loading: a skeleton title and six skeleton cards. */
export const Loading: Story = {
  decorators: [withWorkersStory({ workers: null })],
}

/** No workers in the area: an empty-state card with a Clear filters button. */
export const Empty: Story = {
  decorators: [withWorkersStory({ workers: [] })],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('No workers here yet'),
    ).toBeVisible()
  },
}

/** No workers match the filters: the empty state names the searched area. */
export const EmptyWithFilters: Story = {
  decorators: [
    withWorkersStory({
      workers: [],
      area: { label: 'Camden', lat: 51.539, lng: -0.1426 },
      searchText: 'welding',
      verifiedOnly: true,
    }),
  ],
}

/** The search request failed: the provider drops the error, so the title reads "0 workers" over an empty grid. */
export const QueryFailed: Story = {
  decorators: [withWorkersStory({ failed: true })],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('heading', {
        name: '0 workers near London',
      }),
    ).toBeVisible()
  },
}
