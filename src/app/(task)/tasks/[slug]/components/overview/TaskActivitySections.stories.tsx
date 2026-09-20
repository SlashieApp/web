import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskActivitySections } from './TaskActivitySections'

const meta: Meta<typeof TaskActivitySections> = {
  title: 'task/tasks/overview/TaskActivitySections',
  component: TaskActivitySections,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
