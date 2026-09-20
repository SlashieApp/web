import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { StatusHeader } from './StatusHeader'

const meta: Meta<typeof StatusHeader> = {
  title: 'task/tasks/layout/StatusHeader',
  component: StatusHeader,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
