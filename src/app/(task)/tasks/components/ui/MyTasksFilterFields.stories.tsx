import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'

import { gapsBetweenChildren } from '@/app/(dashboard)/components/ui/dialogSpacing.testing'
import { LocaleProvider } from '@/i18n/LocaleProvider'
import { formSpace } from '@/theme/styles'
import { gapBelow, heightOf } from '@/ui/FormField/formGap.testing'

import type { MyTasksQuery } from '../../helpers/myTasksHubFilters'
import {
  MyTasksFilterFields,
  type MyTasksFilterFieldsProps,
} from './MyTasksFilterFields'

const categories = [
  { category: 'CLEANING', label: 'Cleaning' },
  { category: 'HANDYMAN', label: 'Handyman' },
  { category: 'MOVING', label: 'Moving' },
]

const active: MyTasksQuery = { q: 'tap', category: 'HANDYMAN', role: 'hosted' }

/**
 * Search, Show (posted or quoted) and Category: the controls the phone
 * drawer and the desktop rail share. They only report changes; the drawer
 * waits for Apply and the rail applies at once.
 */
const meta = {
  title: 'My tasks/MyTasksFilterFields',
  component: MyTasksFilterFields,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '272px' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    query: { q: '', category: '', role: '' },
    categories,
    showRole: true,
    onSearchChange: fn(),
    onSearchCommit: fn(),
    onSearchClear: fn(),
    onRoleChange: fn(),
    onCategoryChange: fn(),
  },
} satisfies Meta<typeof MyTasksFilterFields>

export default meta
type Story = StoryObj<typeof meta>

/** The fields in a page that keeps the choices, as the drawer and the rail do. */
function FieldsInPage(args: MyTasksFilterFieldsProps) {
  const [query, setQuery] = useState(args.query)
  return (
    <MyTasksFilterFields
      {...args}
      query={query}
      onSearchChange={(q) => {
        args.onSearchChange(q)
        setQuery({ ...query, q })
      }}
      onSearchClear={() => {
        args.onSearchClear()
        setQuery({ ...query, q: '' })
      }}
      onRoleChange={(role) => {
        args.onRoleChange(role)
        setQuery({ ...query, role })
      }}
      onCategoryChange={(category) => {
        args.onCategoryChange(category)
        setQuery({ ...query, category })
      }}
    />
  )
}

/** Nothing chosen: All tasks and All categories are pressed. Each choice is reported and shown. */
export const NothingChosen: Story = {
  render: (args) => <FieldsInPage {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('group', { name: 'Search' })).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'All tasks' }),
    ).toHaveAttribute('aria-pressed', 'true')
    await expect(
      canvas.getByRole('button', { name: 'All categories' }),
    ).toHaveAttribute('aria-pressed', 'true')

    await userEvent.type(canvas.getByRole('searchbox'), 'tap{Enter}')
    await expect(args.onSearchChange).toHaveBeenLastCalledWith('tap')
    await expect(args.onSearchCommit).toHaveBeenCalledTimes(1)

    await userEvent.click(canvas.getByRole('button', { name: 'Moving' }))
    await expect(args.onCategoryChange).toHaveBeenCalledWith('MOVING')
    await expect(
      canvas.getByRole('button', { name: 'Moving' }),
    ).toHaveAttribute('aria-pressed', 'true')

    await userEvent.click(canvas.getByRole('button', { name: 'Quoted by you' }))
    await expect(args.onRoleChange).toHaveBeenCalledWith('quoted')

    await userEvent.click(canvas.getByRole('button', { name: 'Clear search' }))
    await expect(args.onSearchClear).toHaveBeenCalledTimes(1)
    await expect(canvas.getByRole('searchbox')).toHaveValue('')
  },
}

/** Filters on: the search text, Posted by you and Handyman are chosen. */
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
      canvas.getByRole('button', { name: 'All tasks' }),
    ).toHaveAttribute('aria-pressed', 'false')
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

/** No categories to choose from: no Category group. */
export const NoCategories: Story = {
  args: { categories: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('group', { name: 'Show' })).toBeVisible()
    await expect(canvas.queryByRole('group', { name: 'Category' })).toBeNull()
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
    await expect(canvas.getByRole('group', { name: '搜尋' })).toBeVisible()
    await expect(canvas.getByRole('group', { name: '顯示' })).toBeVisible()
    await expect(canvas.getByRole('group', { name: '類別' })).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: '我發布的' }),
    ).toHaveAttribute('aria-pressed', 'true')
  },
}

/**
 * Form spacing (FE-481): the three groups are a FormStack (20 apart), each
 * legend is the form label (8 above its control) and Search is a field (48
 * tall). The component sets this itself, so a caller adds nothing around it.
 */
export const Spacing: Story = {
  args: { query: active },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const column = canvas.getByRole('group', { name: 'Search' })
      .parentElement as HTMLElement
    for (const gap of gapsBetweenChildren(column)) {
      await expect(gap).toBe(formSpace.fieldGap)
    }
    await expect(column.children).toHaveLength(3)

    for (const name of ['Search', 'Show', 'Category']) {
      const legend = canvas.getByText(name, { selector: 'legend' })
      await expect(gapBelow(legend, legend.nextElementSibling as Element)).toBe(
        formSpace.labelToControl,
      )
    }
    const search = canvas.getByRole('searchbox').parentElement as HTMLElement
    await expect(heightOf(search)).toBe(formSpace.controlHeight)
    // The label is 14px, weight 500, on the form label's own 20px line.
    const legend = getComputedStyle(
      canvas.getByText('Search', { selector: 'legend' }),
    )
    await expect(legend.fontSize).toBe('14px')
    await expect(legend.fontWeight).toBe('500')
    await expect(legend.lineHeight).toBe('20px')
  },
}
