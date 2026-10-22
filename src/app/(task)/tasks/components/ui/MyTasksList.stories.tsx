import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { LocaleProvider } from '@/i18n/LocaleProvider'

import { MY_TASKS_VIEWS } from '../../views'
import { allSections, emptySections } from '../myTasksStoryFixtures'
import { MyTasksList } from './MyTasksList'

const meta = {
  title: 'My tasks/MyTasksList',
  component: MyTasksList,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  // The page's centred column.
  decorators: [
    (Story) => (
      <Box maxW="2xl" mx="auto">
        <Story />
      </Box>
    ),
  ],
  args: {
    config: MY_TASKS_VIEWS.list,
    sections: allSections,
    filtered: false,
    errorMessage: null,
    onRetry: fn(),
    onClearFilters: fn(),
  },
} satisfies Meta<typeof MyTasksList>

export default meta
type Story = StoryObj<typeof meta>

function headings(canvasElement: HTMLElement) {
  return within(canvasElement)
    .getAllByRole('heading', { level: 2 })
    .map((heading) => heading.textContent)
}

/** `list`, posts and quotes: Upcoming cards (Overdue first), Open rows, Past led by a card; Past shows 3 of 5 until Show all. */
export const AllSections: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(headings(canvasElement)).toEqual(['Upcoming', 'Open', 'Past'])

    const upcoming = within(canvas.getByRole('region', { name: 'Upcoming' }))
    await expect(upcoming.getAllByRole('listitem')).toHaveLength(5)
    await expect(upcoming.getByText('Overdue')).toBeVisible()
    await expect(upcoming.getByText('On Wednesday')).toBeVisible()
    await expect(
      upcoming.getByRole('link', { name: /^Mark done: / }),
    ).toBeVisible()

    const open = within(canvas.getByRole('region', { name: 'Open' }))
    await expect(
      open.getByRole('link', { name: /^Compare quotes: / }),
    ).toBeVisible()
    // Rows without a button have the ⋮ menu.
    await expect(
      open.getAllByRole('button', { name: /^Options for / }),
    ).toHaveLength(2)

    const past = within(canvas.getByRole('region', { name: 'Past' }))
    await expect(past.getAllByRole('listitem')).toHaveLength(3)
    await expect(past.getByRole('link', { name: /^Review: / })).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: 'Show all (5)' }))
    await expect(past.getAllByRole('listitem')).toHaveLength(5)
  },
}

/** `list` with empty sections: Upcoming and Past say so in plain words. */
export const EmptySections: Story = {
  args: { sections: emptySections },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(headings(canvasElement)).toEqual(['Upcoming', 'Open', 'Past'])
    await expect(
      canvas.getByText(
        'No booked jobs yet. A job shows here once a quote is accepted.',
      ),
    ).toBeVisible()
    await expect(
      canvas.getByText(
        'Nothing finished yet. Completed and cancelled tasks show here.',
      ),
    ).toBeVisible()
  },
}

/** Filters on: a section with no matches is left out, and Past shows every match. */
export const Filtered: Story = {
  args: {
    filtered: true,
    sections: [
      { id: 'upcoming', rows: [] },
      ...allSections.filter((section) => section.id !== 'upcoming'),
    ],
  },
  play: async ({ canvasElement }) => {
    await expect(headings(canvasElement)).toEqual(['Open', 'Past'])
    await expect(
      within(canvasElement).queryByRole('button', { name: /Show all/ }),
    ).toBeNull()
  },
}

/** A refresh failed with tasks still on screen: the note and Try again above the sections. */
export const RefreshFailed: Story = {
  args: { errorMessage: "Can't reach Slashie. Check your connection." },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Try again' }),
    )
    await expect(args.onRetry).toHaveBeenCalled()
  },
}

/** `loading`: placeholders on the first load. */
export const Loading: Story = {
  args: { config: MY_TASKS_VIEWS.loading, sections: [] },
}

/** `searching`: placeholders while new filters load. */
export const Searching: Story = {
  args: { config: MY_TASKS_VIEWS.searching, sections: [], filtered: true },
}

/** `error`: nothing loaded; the reason and Try again. */
export const LoadFailed: Story = {
  args: {
    config: MY_TASKS_VIEWS.error,
    sections: [],
    errorMessage: "Can't reach Slashie. Check your connection.",
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('alert')).toHaveTextContent(
      'Could not load your tasks',
    )
  },
}

/** `empty`: a new user with no tasks at all; Post a task or Browse tasks. */
export const Empty: Story = {
  args: { config: MY_TASKS_VIEWS.empty, sections: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('link', { name: 'Post a task' }),
    ).toHaveAttribute('href', '/tasks/create')
    await expect(
      canvas.getByRole('link', { name: 'Browse tasks' }),
    ).toHaveAttribute('href', '/search')
  },
}

/** `noMatches`: the filters leave nothing; Clear filters. */
export const NoMatches: Story = {
  args: { config: MY_TASKS_VIEWS.noMatches, sections: [], filtered: true },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Clear filters' }),
    )
    await expect(args.onClearFilters).toHaveBeenCalled()
  },
}

/** Phone width: one column, cards then rows. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Desktop: the same single column, centred. */
export const Desktop: Story = {
  globals: { viewport: { value: 'desktop' } },
}

/** Traditional Chinese copy (from the `/zh-hk` URL prefix). */
export const TraditionalChinese: Story = {
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/tasks' } } },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    await expect(headings(canvasElement)).toEqual([
      '即將進行',
      '開放中',
      '過往',
    ])
  },
}
