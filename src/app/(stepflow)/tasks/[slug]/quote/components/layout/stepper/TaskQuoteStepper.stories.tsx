import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskQuoteStepper } from './TaskQuoteStepper'

const meta: Meta<typeof TaskQuoteStepper> = {
  title: 'Quote flow/TaskQuoteStepper',
  component: TaskQuoteStepper,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
