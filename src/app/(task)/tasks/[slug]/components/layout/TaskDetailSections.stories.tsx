import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskInfoSections } from './TaskDetailSections'

const meta: Meta<typeof TaskInfoSections> = {
  title: 'task/tasks/layout/TaskDetailSections',
  component: TaskInfoSections,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
