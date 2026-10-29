import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { gapsBetweenChildren } from '@/app/(dashboard)/components/ui/dialogSpacing.testing'
import { LocaleProvider } from '@/i18n/LocaleProvider'
import { formSpace } from '@/theme/styles'
import { gapBelow, heightOf } from '@/ui/FormField/formGap.testing'
import { Button } from '@ui'

import {
  EMPTY_MY_TASKS_QUERY,
  type MyTasksQuery,
} from '../../helpers/myTasksHubFilters'
import {
  MyTasksFiltersRail,
  type MyTasksFiltersRailProps,
} from './MyTasksFiltersRail'

const categories = [
  { category: 'CLEANING', label: 'Cleaning' },
  { category: 'HANDYMAN', label: 'Handyman' },
  { category: 'MOVING', label: 'Moving' },
]

const active: MyTasksQuery = { q: 'tap', category: 'HANDYMAN', role: 'hosted' }

/** Longer than the search's 300 ms pause, so a call that was going to happen has. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 450))

/**
 * Desktop (`lg` and up): the My Tasks filters as an always-open rail left of
 * the list. Changes apply straight away: chips at once, the search after a
 * 300 ms pause in typing or on Enter. Below `lg` it is hidden and the filter
 * icon with its drawer (`MyTasksFilters`) takes over.
 */
const meta = {
  title: 'My tasks/MyTasksFiltersRail',
  component: MyTasksFiltersRail,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  globals: { viewport: { value: 'desktop' } },
  args: {
    query: { q: '', category: '', role: '' },
    categories,
    showRole: true,
    onChange: fn(),
  },
} satisfies Meta<typeof MyTasksFiltersRail>

export default meta
type Story = StoryObj<typeof meta>

/** The rail in a page that keeps the filters, as My tasks does (it is in the URL there). */
function RailInPage(args: MyTasksFiltersRailProps) {
  const [query, setQuery] = useState(args.query)
  return (
    <MyTasksFiltersRail
      {...args}
      query={query}
      onChange={(next) => {
        args.onChange(next)
        setQuery(next)
      }}
    />
  )
}

/** Nothing on: every group is open, All tasks and All categories are chosen, no Clear filters. */
export const NoFilters: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('complementary', { name: 'Filter tasks' }),
    ).toBeVisible()
    await expect(canvas.getByRole('group', { name: 'Search' })).toBeVisible()
    await expect(canvas.getByRole('group', { name: 'Show' })).toBeVisible()
    await expect(canvas.getByRole('group', { name: 'Category' })).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'All tasks' }),
    ).toHaveAttribute('aria-pressed', 'true')
    await expect(
      canvas.getByRole('button', { name: 'All categories' }),
    ).toHaveAttribute('aria-pressed', 'true')
    await expect(
      canvas.queryByRole('button', { name: 'Clear filters' }),
    ).toBeNull()
    // No filter icon and no drawer here.
    await expect(canvas.queryByRole('button', { name: /^Filters/ })).toBeNull()
  },
}

/** Filters on: the search text and chips show them, and Clear filters appears. */
export const FiltersOn: Story = {
  args: { query: active },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('searchbox')).toHaveValue('tap')
    await expect(
      canvas.getByRole('button', { name: 'Posted by you' }),
    ).toHaveAttribute('aria-pressed', 'true')
    await expect(
      canvas.getByRole('button', { name: 'Handyman' }),
    ).toHaveAttribute('aria-pressed', 'true')
    await expect(
      canvas.getByRole('button', { name: 'Clear filters' }),
    ).toBeVisible()
  },
}

/** A chip applies the moment it is pressed, with the other filters kept. */
export const ChipsApplyAtOnce: Story = {
  args: { query: { q: 'tap', category: '', role: '' } },
  render: (args) => <RailInPage {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Moving' }))
    await expect(args.onChange).toHaveBeenCalledTimes(1)
    await expect(args.onChange).toHaveBeenLastCalledWith({
      q: 'tap',
      category: 'MOVING',
      role: '',
    })
    await userEvent.click(canvas.getByRole('button', { name: 'Quoted by you' }))
    await expect(args.onChange).toHaveBeenCalledTimes(2)
    await expect(args.onChange).toHaveBeenLastCalledWith({
      q: 'tap',
      category: 'MOVING',
      role: 'quoted',
    })
    await expect(
      canvas.getByRole('button', { name: 'Quoted by you' }),
    ).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(canvas.getByRole('button', { name: 'All tasks' }))
    await expect(args.onChange).toHaveBeenLastCalledWith({
      q: 'tap',
      category: 'MOVING',
      role: '',
    })
  },
}

/** Choosing what is already chosen changes nothing, so nothing is sent. */
export const SameChipSendsNothing: Story = {
  render: (args) => <RailInPage {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'All tasks' }))
    await userEvent.click(
      canvas.getByRole('button', { name: 'All categories' }),
    )
    await expect(args.onChange).not.toHaveBeenCalled()
  },
}

/** Typing applies the search once the typing stops (300 ms), not on every key. */
export const SearchWaitsForAPause: Story = {
  render: (args) => <RailInPage {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByRole('searchbox'), ' tap ')
    await expect(args.onChange).not.toHaveBeenCalled()
    await waitFor(() => expect(args.onChange).toHaveBeenCalledTimes(1), {
      timeout: 2000,
    })
    // Sent trimmed, and the field keeps what was typed.
    await expect(args.onChange).toHaveBeenCalledWith({
      q: 'tap',
      category: '',
      role: '',
    })
    await expect(canvas.getByRole('searchbox')).toHaveValue(' tap ')
    await expect(
      canvas.getByRole('button', { name: 'Clear filters' }),
    ).toBeVisible()
  },
}

/** Enter applies the search at once, and the wait for a pause is dropped. */
export const SearchEnter: Story = {
  render: (args) => <RailInPage {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByRole('searchbox'), 'garden{Enter}')
    await expect(args.onChange).toHaveBeenCalledTimes(1)
    await expect(args.onChange).toHaveBeenCalledWith({
      q: 'garden',
      category: '',
      role: '',
    })
    await settle()
    await expect(args.onChange).toHaveBeenCalledTimes(1)
  },
}

/** A chip pressed while typing sends the typed search with it, once. */
export const ChipTakesTypedSearch: Story = {
  render: (args) => <RailInPage {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByRole('searchbox'), 'tap')
    await userEvent.click(canvas.getByRole('button', { name: 'Posted by you' }))
    await expect(args.onChange).toHaveBeenCalledTimes(1)
    await expect(args.onChange).toHaveBeenCalledWith({
      q: 'tap',
      category: '',
      role: 'hosted',
    })
    await settle()
    await expect(args.onChange).toHaveBeenCalledTimes(1)
  },
}

/** The X in the search field clears the search at once. */
export const ClearSearchX: Story = {
  args: { query: active },
  render: (args) => <RailInPage {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Clear search' }))
    await expect(args.onChange).toHaveBeenCalledTimes(1)
    await expect(args.onChange).toHaveBeenCalledWith({
      q: '',
      category: 'HANDYMAN',
      role: 'hosted',
    })
    await expect(canvas.getByRole('searchbox')).toHaveValue('')
    // The other two filters are still on.
    await expect(
      canvas.getByRole('button', { name: 'Clear filters' }),
    ).toBeVisible()
  },
}

/** Clear filters turns everything off at once, then goes away and keeps focus in the rail. */
export const ClearFilters: Story = {
  args: { query: active },
  render: (args) => <RailInPage {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Clear filters' }))
    await expect(args.onChange).toHaveBeenCalledTimes(1)
    await expect(args.onChange).toHaveBeenCalledWith({
      q: '',
      category: '',
      role: '',
    })
    await expect(canvas.getByRole('searchbox')).toHaveValue('')
    await expect(
      canvas.getByRole('button', { name: 'All tasks' }),
    ).toHaveAttribute('aria-pressed', 'true')
    await expect(
      canvas.queryByRole('button', { name: 'Clear filters' }),
    ).toBeNull()
    await expect(
      canvas.getByRole('complementary', { name: 'Filter tasks' }),
    ).toHaveFocus()
  },
}

/** Typed text that is not applied yet already counts: Clear filters shows, and clears it. */
export const ClearFiltersWhileTyping: Story = {
  render: (args) => <RailInPage {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByRole('searchbox'), 'tap')
    await userEvent.click(canvas.getByRole('button', { name: 'Clear filters' }))
    await expect(canvas.getByRole('searchbox')).toHaveValue('')
    await settle()
    // Nothing had been applied, so there was nothing to undo and nothing is sent.
    await expect(args.onChange).not.toHaveBeenCalled()
  },
}

/** The search changes somewhere else (Clear filters under the list): the field follows. */
function RailWithOutsideClear(args: MyTasksFiltersRailProps) {
  const [query, setQuery] = useState(args.query)
  return (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={() => setQuery(EMPTY_MY_TASKS_QUERY)}
      >
        Clear filters under the list
      </Button>
      <MyTasksFiltersRail
        {...args}
        query={query}
        onChange={(next) => {
          args.onChange(next)
          setQuery(next)
        }}
      />
    </>
  )
}

/** The page clears the filters from outside the rail: the search field and chips follow. */
export const FollowsOutsideChange: Story = {
  args: { query: active },
  render: (args) => <RailWithOutsideClear {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('searchbox')).toHaveValue('tap')
    await userEvent.click(
      canvas.getByRole('button', { name: 'Clear filters under the list' }),
    )
    await expect(canvas.getByRole('searchbox')).toHaveValue('')
    await expect(
      canvas.getByRole('button', { name: 'All categories' }),
    ).toHaveAttribute('aria-pressed', 'true')
    await expect(
      canvas.queryByRole('button', { name: 'Clear filters' }),
    ).toBeNull()
    await expect(args.onChange).not.toHaveBeenCalled()
  },
}

/** Only one kind of task: no Show group. */
export const OneRole: Story = {
  args: { showRole: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('group', { name: 'Category' })).toBeVisible()
    await expect(canvas.queryByRole('group', { name: 'Show' })).toBeNull()
  },
}

/** Phone: the rail is hidden (the filter icon and its drawer are used instead). */
export const Phone: Story = {
  tags: ['!autodocs'],
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.queryByRole('complementary')).toBeNull()
    await expect(
      canvas.getByRole('complementary', { hidden: true }),
    ).not.toBeVisible()
  },
}

/** Tablet (below `lg`): hidden as on a phone. */
export const Tablet: Story = {
  tags: ['!autodocs'],
  globals: { viewport: { value: 'tablet', isRotated: false } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('complementary')).toBeNull()
  },
}

/** Traditional Chinese copy (from the `/zh-hk` URL prefix). */
export const TraditionalChinese: Story = {
  args: { query: active },
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/tasks' } } },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('complementary', { name: '篩選任務' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: '我發布的' }),
    ).toHaveAttribute('aria-pressed', 'true')
    await expect(canvas.getByRole('button', { name: '清除篩選' })).toBeVisible()
  },
}

/**
 * Form spacing (FE-481): the first filter is 24 under the heading's text, and
 * the three filters are 20 apart (each label 8 above its control, Search 48
 * tall). Clear filters is taller than the heading line, but it adds no height
 * to the row: the heading does not move, and the 24 does not change, when the
 * button appears.
 */
export const Spacing: Story = {
  render: (args) => <RailInPage {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const heading = canvas.getByRole('heading', { name: 'Filter tasks' })
    const search = canvas.getByText('Search', { selector: 'legend' })
    const topBefore = heading.getBoundingClientRect().top
    await expect(gapBelow(heading, search)).toBe(formSpace.headerToBody)

    const column = canvas.getByRole('group', { name: 'Search' })
      .parentElement as HTMLElement
    for (const gap of gapsBetweenChildren(column)) {
      await expect(gap).toBe(formSpace.fieldGap)
    }
    await expect(
      heightOf(canvas.getByRole('searchbox').parentElement as HTMLElement),
    ).toBe(formSpace.controlHeight)

    // Typing turns Clear filters on; the heading and the gap below it stay put.
    await userEvent.type(canvas.getByRole('searchbox'), 'tap')
    await expect(
      canvas.getByRole('button', { name: 'Clear filters' }),
    ).toBeVisible()
    await expect(heading.getBoundingClientRect().top).toBe(topBefore)
    await expect(gapBelow(heading, search)).toBe(formSpace.headerToBody)
  },
}
