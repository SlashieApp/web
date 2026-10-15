import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { CreateTaskStepper } from './CreateTaskStepper'

const meta: Meta<typeof CreateTaskStepper> = {
  title: 'Create task/CreateTaskStepper',
  component: CreateTaskStepper,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
