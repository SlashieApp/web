import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { type MyTasksTab, MyTasksViewSwitch } from './MyTasksViewSwitch'

/**
 * The list / chart control beside the My Tasks title: it swaps the task list
 * and Your activity, on every screen size.
 */
const meta = {
  title: 'My tasks/MyTasksViewSwitch',
  component: MyTasksViewSwitch,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  globals: { viewport: { value: 'mobile1' } },
  args: {
    view: 'tasks',
    onChange: fn(),
  },
} satisfies Meta<typeof MyTasksViewSwitch>

export default meta
type Story = StoryObj<typeof meta>

/** The task list is showing: the list button is pressed. */
export const TasksSelected: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(
      await canvas.findByRole('button', { name: 'Show tasks' }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      canvas.getByRole('button', { name: 'Show your activity' }),
    ).toHaveAttribute('aria-pressed', 'false')
  },
}

/** The activity summary is showing: the chart button is pressed. */
export const ActivitySelected: Story = {
  args: { view: 'achievements' },
  play: async ({ canvasElement }) => {
    expect(
      await within(canvasElement).findByRole('button', {
        name: 'Show your activity',
      }),
    ).toHaveAttribute('aria-pressed', 'true')
  },
}

/** Pressing a button asks for that view, and the pressed state follows. */
export const Interactive: Story = {
  render: function SwitchDemo() {
    const [view, setView] = useState<MyTasksTab>('tasks')
    return <MyTasksViewSwitch view={view} onChange={setView} />
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Show your activity' }),
    )
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Show your activity' }),
      ).toHaveAttribute('aria-pressed', 'true'),
    )
  },
}

/** Desktop: the same switch (one column on every screen). */
export const Desktop: Story = {
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    expect(
      await within(canvasElement).findByRole('button', { name: 'Show tasks' }),
    ).toBeVisible()
  },
}
