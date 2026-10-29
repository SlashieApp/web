import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { phone390 } from '@/app/(dashboard)/components/ui/dialogSpacing.testing'
import { formSpace } from '@/theme/styles'
import { openDrawer } from '@/ui/Drawer/drawerSpacing.testing'
import { gapBelow, heightOf } from '@/ui/FormField/formGap.testing'

import { withTaskBrowseStory } from '../../../helpers/taskBrowseStoryDecorator'
import { storyBrowseTasks } from '../../../helpers/taskBrowseStoryFixtures'
import { SearchResultsListTitle } from '../../../search/components/results/SearchResultsListTitle'
import { TaskSearch } from '../../ui/TaskSearch'
import { TaskTag } from '../../ui/TaskTag'
import { MobileTaskSearchSheet } from './MobileTaskSearchSheet'

/** The collapsed search bar and filter chips, with the sheet they open. */
const meta = {
  title: 'Tasks/MobileTaskSearchSheet',
  component: MobileTaskSearchSheet,
  parameters: {
    layout: 'padded',
    nextjs: { navigation: { pathname: '/search' } },
  },
  render: (args) => (
    <>
      <Box maxW="420px" display="flex" flexDirection="column" gap={2}>
        <TaskSearch mode="trigger" />
        <TaskTag />
      </Box>
      <MobileTaskSearchSheet {...args} />
    </>
  ),
} satisfies Meta<typeof MobileTaskSearchSheet>

export default meta
type Story = StoryObj<typeof meta>

const phone = {
  globals: { viewport: { value: 'mobile1' } },
} as const

/** The sheet portals to the page, outside the story canvas. */
const page = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body)

/** Closed: only the search bar shows. Tapping it opens the sheet. */
export const Collapsed: Story = {
  ...phone,
  decorators: [withTaskBrowseStory({ isDesktop: false })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('textbox'))
    await page(canvasElement).findByRole('dialog')
  },
}

/** Collapsed with a search applied: the bar shows it, chips sit below. */
export const CollapsedWithFilters: Story = {
  ...phone,
  decorators: [
    withTaskBrowseStory({
      isDesktop: false,
      initialState: { searchText: 'chandelier' },
    }),
  ],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('button', { name: 'Clear all' })
  },
}

/** Open: search field, Date and Budget chips, and the results nearest first. */
export const Open: Story = {
  ...phone,
  decorators: [withTaskBrowseStory({ isDesktop: false, sheetOpen: true })],
  play: async ({ canvasElement }) => {
    const sheet = page(canvasElement)
    await sheet.findByText(storyBrowseTasks[0].title)
    await sheet.findByRole('button', { name: /Date/ })
  },
}

/**
 * Form spacing (FE-481), at a real 390 phone: the search field is 24 under the
 * title, the Date and Budget chips are 20 under it (the search bar keeps its
 * own height, under a field's 48), and an open panel hangs 8 under the chips.
 */
export const OpenSpacing: Story = {
  ...phone390,
  decorators: [withTaskBrowseStory({ isDesktop: false, sheetOpen: true })],
  play: async ({ canvasElement }) => {
    const { dialog, title } = await openDrawer(canvasElement, 'Search tasks')
    const sheet = within(dialog)
    const search = sheet.getByRole('searchbox').parentElement as HTMLElement
    const chips = sheet.getByRole('button', { name: /Date/ })
      .parentElement as HTMLElement
    await expect(gapBelow(title, search)).toBe(formSpace.headerToBody)
    // The bar is the search bar, not a field of a form: it stays under the 48 of a field.
    await expect(heightOf(search)).toBeLessThan(formSpace.controlHeight)
    await expect(gapBelow(search, chips)).toBe(formSpace.fieldGap)

    await userEvent.click(sheet.getByRole('button', { name: /Budget/ }))
    const panel = await sheet.findByRole('group', { name: 'Budget' })
    const row = chips.parentElement as HTMLElement
    await expect(gapBelow(row, panel)).toBe(8)
    await expect(dialog.scrollWidth).toBeLessThanOrEqual(390)
  },
}

/** Open with a results title above the list (as on /search). */
export const OpenWithResultsTitle: Story = {
  ...phone,
  args: { listHeader: <SearchResultsListTitle /> },
  decorators: [withTaskBrowseStory({ isDesktop: false, sheetOpen: true })],
  play: async ({ canvasElement }) => {
    await page(canvasElement).findByRole('heading', {
      name: '5 tasks near London',
    })
  },
}

/** Open while the first page loads: skeleton cards. */
export const OpenLoading: Story = {
  ...phone,
  decorators: [
    withTaskBrowseStory({
      isDesktop: false,
      sheetOpen: true,
      query: 'loading',
    }),
  ],
  play: async ({ canvasElement }) => {
    const sheet = page(canvasElement)
    await sheet.findByRole('dialog')
    await waitFor(() =>
      expect(
        canvasElement.ownerDocument.querySelector('[aria-busy]'),
      ).not.toBeNull(),
    )
  },
}

/** Open with a search that matches nothing: empty state with Clear filters. */
export const OpenNoResults: Story = {
  ...phone,
  decorators: [
    withTaskBrowseStory({
      isDesktop: false,
      sheetOpen: true,
      tasks: [],
      initialState: { searchText: 'chandelier' },
    }),
  ],
  play: async ({ canvasElement }) => {
    await page(canvasElement).findByText('No tasks match your search')
  },
}

/** Open after the request failed: a warning row with Try again. */
export const OpenLoadFailed: Story = {
  ...phone,
  decorators: [
    withTaskBrowseStory({ isDesktop: false, sheetOpen: true, query: 'error' }),
  ],
  play: async ({ canvasElement }) => {
    await page(canvasElement).findByRole('button', { name: 'Try again' })
  },
}

/** Desktop: the web layout has its own panel, so the phone sheet never opens. */
export const HiddenOnDesktop: Story = {
  decorators: [withTaskBrowseStory({ sheetOpen: true })],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('textbox')
    expect(page(canvasElement).queryByRole('dialog')).toBeNull()
  },
}
