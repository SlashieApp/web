import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { CreateTaskVisualsSection } from './CreateTaskVisualsSection'

const meta: Meta<typeof CreateTaskVisualsSection> = {
  title: 'stepflow/tasks/create/ui/sections/CreateTaskVisualsSection',
  component: CreateTaskVisualsSection,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
