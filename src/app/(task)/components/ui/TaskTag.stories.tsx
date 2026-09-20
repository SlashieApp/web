import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskTag } from './TaskTag'

const meta: Meta<typeof TaskTag> = {
  title: 'task/ui/TaskTag',
  component: TaskTag,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
