import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { LocaleProvider } from '@/i18n/LocaleProvider'

import { MyTasksSearch } from './MyTasksSearch'

const categories = [
  { category: 'CLEANING', label: 'Cleaning' },
  { category: 'HANDYMAN', label: 'Handyman' },
  { category: 'MOVING', label: 'Moving' },
]

const meta = {
  title: 'My tasks/MyTasksSearch',
  component: MyTasksSearch,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    value: '',
    pending: false,
    onValueChange: fn(),
    onCommit: fn(),
    onClearSearch: fn(),
    category: '',
    categories,
    onCategoryChange: fn(),
    role: '',
    showRole: true,
    onRoleChange: fn(),
    onClearAll: fn(),
  },
} satisfies Meta<typeof MyTasksSearch>

export default meta
type Story = StoryObj<typeof meta>

/** Posts and quotes: search, Category and Hosted / Quoted chips. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Hosted / Quoted' }),
    )
    await userEvent.click(canvas.getByRole('button', { name: 'Quoted' }))
    await expect(args.onRoleChange).toHaveBeenCalledWith('quoted')
    await userEvent.type(canvas.getByRole('searchbox'), 'tap{Enter}')
    await expect(args.onCommit).toHaveBeenCalled()
  },
}

/** Filters set: green chips with their values and Clear all. */
export const Filtered: Story = {
  args: { value: 'tap', category: 'HANDYMAN', role: 'hosted' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: 'Handyman' })).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Hosted' })).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: 'Clear all' }))
    await expect(args.onClearAll).toHaveBeenCalled()
  },
}

/** Typed text not applied yet, or results loading: the spinner shows. */
export const Pending: Story = {
  args: { value: 'garden', pending: true },
}

/** Only one kind of task: no Hosted / Quoted chip. */
export const OneRole: Story = {
  args: { showRole: false },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByRole('button', { name: 'Hosted / Quoted' }),
    ).toBeNull()
  },
}

/** Phone width: the chips wrap under the search bar. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
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
    await expect(
      within(canvasElement).getByRole('button', { name: '我發布 / 我報價' }),
    ).toBeVisible()
  },
}
