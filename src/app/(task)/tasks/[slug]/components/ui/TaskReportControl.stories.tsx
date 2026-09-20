import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskReportControl } from './TaskReportControl'

const meta: Meta<typeof TaskReportControl> = {
  title: 'task/tasks/ui/TaskReportControl',
  component: TaskReportControl,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
