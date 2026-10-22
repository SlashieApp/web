import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { LocaleProvider } from '@/i18n/LocaleProvider'

import type { MyTasksQuery } from '../../helpers/myTasksHubFilters'
import { MyTasksFilters } from './MyTasksFilters'

const categories = [
  { category: 'CLEANING', label: 'Cleaning' },
  { category: 'HANDYMAN', label: 'Handyman' },
  { category: 'MOVING', label: 'Moving' },
]

const active: MyTasksQuery = { q: 'tap', category: 'HANDYMAN', role: 'hosted' }

const meta = {
  title: 'My tasks/MyTasksFilters',
  component: MyTasksFilters,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    query: { q: '', category: '', role: '' },
    categories,
    showRole: true,
    onApply: fn(),
  },
} satisfies Meta<typeof MyTasksFilters>

export default meta
type Story = StoryObj<typeof meta>

/** Taps the filter icon and returns the page once the drawer is open. */
async function openDrawer(
  canvasElement: HTMLElement,
  button: string,
  title = 'Filter tasks',
) {
  await userEvent.click(
    within(canvasElement).getByRole('button', { name: button }),
  )
  const page = within(canvasElement.ownerDocument.body)
  await expect(await page.findByRole('dialog', { name: title })).toBeVisible()
  return page
}

function pressed(page: ReturnType<typeof within>, name: string) {
  return expect(page.getByRole('button', { name })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
}

/** No filters on: the plain filter icon. */
export const NoFilters: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: 'Filters' }),
    ).toBeVisible()
  },
}

/** One filter on: the icon is tinted and shows 1. */
export const OneActive: Story = {
  args: { query: { q: '', category: 'MOVING', role: '' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('button', { name: 'Filters, 1 active' }),
    ).toBeVisible()
    await expect(canvas.getByText('1')).toBeVisible()
  },
}

/** Three filters on: the icon shows 3. */
export const ActiveCount: Story = {
  args: { query: active },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('button', { name: 'Filters, 3 active' }),
    ).toBeVisible()
    await expect(canvas.getByText('3')).toBeVisible()
  },
}

// Open stories are left off the autodocs page: an open drawer would cover it.
/** The drawer open with filters on: the search text, Posted by you and Handyman chosen. */
export const OpenWithActiveFilters: Story = {
  tags: ['!autodocs'],
  args: { query: active },
  play: async ({ canvasElement }) => {
    const page = await openDrawer(canvasElement, 'Filters, 3 active')
    await expect(page.getByRole('group', { name: 'Search' })).toBeVisible()
    await expect(page.getByRole('searchbox')).toHaveValue('tap')
    await pressed(page, 'Posted by you')
    await pressed(page, 'Handyman')
    await expect(
      page.getByRole('button', { name: 'All tasks' }),
    ).toHaveAttribute('aria-pressed', 'false')
    await expect(
      page.getByRole('button', { name: 'All categories' }),
    ).toHaveAttribute('aria-pressed', 'false')
  },
}

/** Nothing on yet: All tasks and All categories are chosen. */
export const OpenNoFilters: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const page = await openDrawer(canvasElement, 'Filters')
    await pressed(page, 'All tasks')
    await pressed(page, 'All categories')
  },
}

/** Changes wait for Apply, which sends them together (the search trimmed) and closes. */
export const Apply: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement, args }) => {
    const page = await openDrawer(canvasElement, 'Filters')
    await userEvent.type(page.getByRole('searchbox'), ' tap ')
    await userEvent.click(page.getByRole('button', { name: 'Moving' }))
    await userEvent.click(page.getByRole('button', { name: 'Quoted by you' }))
    await expect(args.onApply).not.toHaveBeenCalled()
    await userEvent.click(page.getByRole('button', { name: 'Apply' }))
    await expect(args.onApply).toHaveBeenCalledWith({
      q: 'tap',
      category: 'MOVING',
      role: 'quoted',
    })
    await waitFor(() =>
      expect(page.queryByRole('dialog', { name: 'Filter tasks' })).toBeNull(),
    )
  },
}

/** All tasks and All categories turn those filters off. */
export const PickAll: Story = {
  tags: ['!autodocs'],
  args: { query: active },
  play: async ({ canvasElement, args }) => {
    const page = await openDrawer(canvasElement, 'Filters, 3 active')
    await userEvent.click(page.getByRole('button', { name: 'All tasks' }))
    await userEvent.click(page.getByRole('button', { name: 'All categories' }))
    await userEvent.click(page.getByRole('button', { name: 'Apply' }))
    await expect(args.onApply).toHaveBeenCalledWith({
      q: 'tap',
      category: '',
      role: '',
    })
  },
}

/** Enter in the search applies and closes the drawer. */
export const SearchEnter: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement, args }) => {
    const page = await openDrawer(canvasElement, 'Filters')
    await userEvent.type(page.getByRole('searchbox'), 'garden{Enter}')
    await expect(args.onApply).toHaveBeenCalledWith({
      q: 'garden',
      category: '',
      role: '',
    })
    await waitFor(() =>
      expect(page.queryByRole('dialog', { name: 'Filter tasks' })).toBeNull(),
    )
  },
}

/** Clear turns every filter off at once and closes the drawer. */
export const Clear: Story = {
  tags: ['!autodocs'],
  args: { query: active },
  play: async ({ canvasElement, args }) => {
    const page = await openDrawer(canvasElement, 'Filters, 3 active')
    await userEvent.click(page.getByRole('button', { name: 'Clear' }))
    await expect(args.onApply).toHaveBeenCalledWith({
      q: '',
      category: '',
      role: '',
    })
    await waitFor(() =>
      expect(page.queryByRole('dialog', { name: 'Filter tasks' })).toBeNull(),
    )
  },
}

/** Only one kind of task: no Show choice. */
export const OneRole: Story = {
  tags: ['!autodocs'],
  args: { showRole: false },
  play: async ({ canvasElement }) => {
    const page = await openDrawer(canvasElement, 'Filters')
    await expect(page.getByRole('group', { name: 'Category' })).toBeVisible()
    await expect(page.queryByRole('group', { name: 'Show' })).toBeNull()
  },
}

/** Phone: the drawer is a bottom sheet. */
export const Phone: Story = {
  tags: ['!autodocs'],
  args: { query: active },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    await openDrawer(canvasElement, 'Filters, 3 active')
  },
}

/** Desktop: the drawer is a side panel. */
export const Desktop: Story = {
  tags: ['!autodocs'],
  args: { query: active },
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    await openDrawer(canvasElement, 'Filters, 3 active')
  },
}

/** Traditional Chinese copy (from the `/zh-hk` URL prefix). */
export const TraditionalChinese: Story = {
  tags: ['!autodocs'],
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
    const page = await openDrawer(
      canvasElement,
      '篩選，已套用 3 項',
      '篩選任務',
    )
    await pressed(page, '我發布的')
    await expect(page.getByRole('button', { name: '套用' })).toBeVisible()
  },
}
