import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { withWorkersStory } from '../workersStoryDecorator'
import { WorkersFiltersDrawer } from './WorkersFiltersDrawer'

/**
 * Phone filters drawer: skills, distance and the identity toggle, with an
 * Apply button. Closed it renders nothing, so each story opens it on mount.
 */
const meta = {
  title: 'Workers/WorkersFiltersDrawer',
  component: WorkersFiltersDrawer,
  parameters: { layout: 'fullscreen' },
  globals: { viewport: { value: 'mobile1' } },
} satisfies Meta<typeof WorkersFiltersDrawer>

export default meta
type Story = StoryObj<typeof meta>

/** Open with the default filters: empty skills, 16 km, identity toggle off. */
export const Open: Story = {
  decorators: [withWorkersStory({ filtersOpen: true })],
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body)
    await expect(
      await page.findByRole('button', { name: 'Apply filters' }),
    ).toBeVisible()
  },
}

/** Open with filters already applied: skills text, a 25 mile (40 km) radius and the identity toggle on. */
export const OpenWithFilters: Story = {
  decorators: [
    withWorkersStory({
      filtersOpen: true,
      searchText: 'plumbing',
      verifiedOnly: true,
      radiusMiles: 25,
    }),
  ],
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body)
    await expect(await page.findByDisplayValue('plumbing')).toBeVisible()
  },
}
