import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { withWorkersStory } from '../workersStoryDecorator'
import { WorkersSearchBar } from './WorkersSearchBar'

/**
 * Worker search bar. Desktop is one row (area, skills, distance, identity
 * toggle, Search); phones get the area field and a Filters button that opens
 * the filters drawer. `stuck` is the docked look once it pins to the top.
 */
const meta = {
  title: 'Workers/WorkersSearchBar',
  component: WorkersSearchBar,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof WorkersSearchBar>

export default meta
type Story = StoryObj<typeof meta>

/** Desktop, no filters: area, skills, distance slider, identity toggle and Search in one row. */
export const Default: Story = {
  decorators: [withWorkersStory()],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('button', { name: 'Search' }),
    ).toBeVisible()
  },
}

/** Desktop with filters applied: skills text, identity toggle on and a 25 mile radius. */
export const FiltersApplied: Story = {
  decorators: [
    withWorkersStory({
      searchText: 'plumbing',
      verifiedOnly: true,
      radiusMiles: 25,
    }),
  ],
}

/** Desktop, docked to the top of the page: square edges and no shadow. */
export const Stuck: Story = {
  args: { stuck: true },
  decorators: [withWorkersStory()],
}

/** Phone, no filters: the area field and a secondary Filters button. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [withWorkersStory()],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('button', {
        name: 'Open filters',
      }),
    ).toBeVisible()
  },
}

/** Phone with filters applied: the Filters button turns primary and counts them for screen readers. */
export const PhoneFiltersApplied: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [
    withWorkersStory({
      searchText: 'plumbing',
      verifiedOnly: true,
      radiusMiles: 25,
    }),
  ],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('button', {
        name: 'Open filters, 3 active',
      }),
    ).toBeVisible()
  },
}

/** Phone, docked to the top of the page. */
export const PhoneStuck: Story = {
  globals: { viewport: { value: 'mobile1' } },
  args: { stuck: true },
  decorators: [withWorkersStory()],
}
