import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { LocaleProvider } from '@/i18n/LocaleProvider'

import { MY_TASKS_VIEWS } from '../../views'
import {
  customerSections,
  dualRoleSections,
  workerSections,
} from '../myTasksStoryFixtures'
import { MyTasksList } from './MyTasksList'

const meta = {
  title: 'My tasks/MyTasksList',
  component: MyTasksList,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    config: MY_TASKS_VIEWS.list,
    sections: dualRoleSections,
    filtered: false,
    errorMessage: null,
    onRetry: fn(),
    onClearFilters: fn(),
    onOpen: fn(),
  },
} satisfies Meta<typeof MyTasksList>

export default meta
type Story = StoryObj<typeof meta>

function headings(canvasElement: HTMLElement) {
  return within(canvasElement)
    .getAllByRole('heading', { level: 2 })
    .map((heading) => heading.textContent)
}

/** `list`, posts and quotes: Needs you first, then Booked / In progress; Completed shows 3 of 5. */
export const DualRole: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(headings(canvasElement)).toEqual([
      'Needs you (3)',
      'Booked / In progress (2)',
      'Open (2)',
      'Completed (5)',
    ])
    const completed = canvas.getByRole('region', { name: 'Completed' })
    await expect(
      within(completed).getAllByRole('button', { name: /Open task/ }),
    ).toHaveLength(3)
    await userEvent.click(canvas.getByRole('button', { name: 'Show all (5)' }))
    await expect(
      within(completed).getAllByRole('button', { name: /Open task/ }),
    ).toHaveLength(5)
    await userEvent.click(
      canvas.getByRole('button', { name: /^Mount a 55-inch TV/ }),
    )
    await expect(args.onOpen).toHaveBeenCalledWith('booked-today')
  },
}

/** `list`, posts only: every card says Hosted; the booked time leads. */
export const CustomerOnly: Story = {
  args: { sections: customerSections },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getAllByText('Hosted')).toHaveLength(3)
    await expect(canvas.getByText('Today 14:00')).toBeVisible()
    await expect(canvas.getAllByText('With Alex Kim')).toHaveLength(2)
  },
}

/** `list`, quotes only: Quoted, Overdue in red on the booked job, Not selected on a lost quote. */
export const WorkerOnly: Story = {
  args: { sections: workerSections },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Not selected')).toBeVisible()
    await expect(canvas.getByText('Overdue')).toBeVisible()
    await expect(canvas.getByText('Hosted by Jordan Lee')).toBeVisible()
  },
}

/** A search is on: Completed shows every match. */
export const Filtered: Story = {
  args: { filtered: true },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByRole('button', { name: /Show all/ }),
    ).toBeNull()
  },
}

/** A refresh failed with tasks still on screen: the note and Try again above the groups. */
export const RefreshFailed: Story = {
  args: { errorMessage: "Can't reach Slashie. Check your connection." },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Try again' }),
    )
    await expect(args.onRetry).toHaveBeenCalled()
  },
}

/** `loading`: card placeholders on the first load. */
export const Loading: Story = {
  args: { config: MY_TASKS_VIEWS.loading, sections: [] },
}

/** `searching`: placeholders while a new search loads. */
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

/** `empty`: a new user; Post a task or Browse tasks. */
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

/** `noMatches`: the search leaves nothing; Clear filters. */
export const NoMatches: Story = {
  args: { config: MY_TASKS_VIEWS.noMatches, sections: [], filtered: true },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Clear filters' }),
    )
    await expect(args.onClearFilters).toHaveBeenCalled()
  },
}

/** Phone width: one column of cards. */
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
    await expect(headings(canvasElement).slice(0, 2)).toEqual([
      '需要你處理 (3)',
      '已預約 / 進行中 (2)',
    ])
  },
}
