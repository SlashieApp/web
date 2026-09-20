import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { CreateTaskStepper } from './CreateTaskStepper'

const meta: Meta<typeof CreateTaskStepper> = {
  title: 'stepflow/tasks/create/layout/shared/CreateTaskStepper',
  component: CreateTaskStepper,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
