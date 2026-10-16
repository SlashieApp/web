import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { LocaleProvider } from '@/i18n/LocaleProvider'

import { EDIT_TASK_VIEWS, type EditTaskViewName } from '../views'
import { EditTaskStatus } from './EditTaskStatus'

type StatusView = Extract<
  EditTaskViewName,
  | 'edit.loadError'
  | 'edit.notFound'
  | 'edit.notOwner'
  | 'edit.booked'
  | 'edit.cancelled'
>

function config(name: StatusView) {
  const view = EDIT_TASK_VIEWS[name]
  if (view.layout !== 'status') throw new Error(`${name} is not a status view`)
  return view
}

/** One story per edit view that explains why the task can't be edited. */
const meta = {
  title: 'Edit task/EditTaskStatus',
  component: EditTaskStatus,
  parameters: { layout: 'fullscreen' },
  args: { config: config('edit.notFound'), taskId: 'task-1', onRetry: fn() },
} satisfies Meta<typeof EditTaskStatus>

export default meta
type Story = StoryObj<typeof meta>

/** edit.loadError: Try again, or back to My tasks. */
export const LoadError: Story = {
  args: { config: config('edit.loadError') },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('heading', { name: "We couldn't load this task" }),
    ).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: 'Try again' }))
    await expect(args.onRetry).toHaveBeenCalled()
  },
}

/** edit.notFound: removed or a bad link. */
export const NotFound: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('link', { name: 'Back to my tasks' }),
    ).toHaveAttribute('href', '/tasks')
  },
}

/** edit.notOwner: someone else's task. */
export const NotOwner: Story = {
  args: { config: config('edit.notOwner') },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('link', { name: 'View task' }),
    ).toHaveAttribute('href', '/tasks/task-1')
  },
}

/** edit.booked: a worker is booked, so the details are locked. */
export const Booked: Story = {
  args: { config: config('edit.booked') },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText(
        'A worker is booked, so the details are locked. Message them about any change.',
      ),
    ).toBeVisible()
  },
}

/** edit.cancelled: nothing to edit, but it can be posted again. */
export const Cancelled: Story = {
  args: { config: config('edit.cancelled') },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('link', { name: 'Post it again' }),
    ).toHaveAttribute('href', '/tasks/create?repost=task-1')
  },
}

/** zh-HK. */
export const ZhHk: Story = {
  args: { config: config('edit.booked') },
  parameters: {
    nextjs: { navigation: { pathname: '/zh-hk/tasks/task-1/edit' } },
  },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('heading', {
        name: '此任務暫時無法編輯',
      }),
    ).toBeVisible()
  },
}

/** Phones. */
export const Phone: Story = {
  args: { config: config('edit.cancelled') },
  globals: { viewport: { value: 'mobile1' } },
}
