import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { phone390 } from '@/app/(dashboard)/components/ui/dialogSpacing.testing'
import { formSpace } from '@/theme/styles'
import {
  expectBar,
  expectFiltersApart,
  expectLabelAbove,
  expectNoLines,
  openDrawer,
} from '@/ui/Drawer/drawerSpacing.testing'
import { gapBelow, heightOf } from '@/ui/FormField/formGap.testing'

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

/**
 * Form spacing (FE-481), at a real 390 phone. The first filter is 24 under the
 * title, the three filters are 20 apart, each label is 8 above its control, the
 * Skills field is a field (48 tall), and Apply is 20 under the last filter with
 * no line above it.
 */
export const Spacing: Story = {
  ...phone390,
  decorators: [withWorkersStory({ filtersOpen: true })],
  play: async ({ canvasElement }) => {
    const { dialog, title, footer, column } = await openDrawer(
      canvasElement,
      'Filters',
    )
    const inDrawer = within(dialog)
    const skills = inDrawer.getByText('Skills')
    const distance = inDrawer.getByText('Distance')
    const verified = inDrawer.getAllByText(
      'Identity verified',
    )[0] as HTMLElement
    const toggle = inDrawer.getByRole('button', { name: 'Identity verified' })
    const apply = inDrawer.getByRole('button', { name: 'Apply filters' })
    const field = inDrawer.getByRole('searchbox').parentElement as HTMLElement
    const slider = dialog.querySelector(
      '[data-scope="slider"][data-part="root"]',
    ) as HTMLElement

    await expect(gapBelow(title, skills)).toBe(formSpace.headerToBody)
    await expectLabelAbove(skills, field, { height: formSpace.controlHeight })
    // The distance label and its value are one line, 8 above the slider.
    await expectLabelAbove(distance, slider)
    await expectLabelAbove(verified, toggle)
    await expect(gapBelow(field, distance)).toBe(formSpace.fieldGap)
    await expect(gapBelow(slider, verified)).toBe(formSpace.fieldGap)
    await expectFiltersApart(column)
    await expectBar(toggle, [apply])
    await expectNoLines(dialog)
    await expect(footer).not.toBeNull()
    // Nothing is wider than the phone.
    await expect(dialog.scrollWidth).toBeLessThanOrEqual(390)
    await expect(heightOf(field)).toBe(formSpace.controlHeight)
  },
}
