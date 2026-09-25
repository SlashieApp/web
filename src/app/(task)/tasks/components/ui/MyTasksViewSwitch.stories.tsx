import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { type MyTasksMobileView, MyTasksViewSwitch } from './MyTasksViewSwitch'

function SwitchDemo() {
  const [view, setView] = useState<MyTasksMobileView>('tasks')
  return <MyTasksViewSwitch view={view} onChange={setView} />
}

const meta = {
  title: 'task/tasks/ui/MyTasksViewSwitch',
  component: MyTasksViewSwitch,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    view: 'tasks',
    onChange: () => undefined,
  },
} satisfies Meta<typeof MyTasksViewSwitch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <SwitchDemo />,
}
