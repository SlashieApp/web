import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskBrowseSearchThisAreaButton } from './TaskBrowseSearchThisAreaButton'

const meta: Meta<typeof TaskBrowseSearchThisAreaButton> = {
  title: 'task/ui/TaskBrowseSearchThisAreaButton',
  component: TaskBrowseSearchThisAreaButton,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
