import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskDetailMainCta } from './TaskDetailMainCta'

const meta: Meta<typeof TaskDetailMainCta> = {
  title: 'task/tasks/layout/TaskDetailMainCta',
  component: TaskDetailMainCta,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
