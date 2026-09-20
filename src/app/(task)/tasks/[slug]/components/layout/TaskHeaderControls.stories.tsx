import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskBackButton } from './TaskHeaderControls'

const meta: Meta<typeof TaskBackButton> = {
  title: 'task/tasks/layout/TaskHeaderControls',
  component: TaskBackButton,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
