import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { CreateTaskHeader } from './CreateTaskHeader'

const meta: Meta<typeof CreateTaskHeader> = {
  title: 'stepflow/tasks/create/layout/shared/CreateTaskHeader',
  component: CreateTaskHeader,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
