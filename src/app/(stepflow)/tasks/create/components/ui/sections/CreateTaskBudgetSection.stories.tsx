import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { CreateTaskBudgetSection } from './CreateTaskBudgetSection'

const meta: Meta<typeof CreateTaskBudgetSection> = {
  title: 'stepflow/tasks/create/ui/sections/CreateTaskBudgetSection',
  component: CreateTaskBudgetSection,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
