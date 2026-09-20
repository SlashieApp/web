import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { CreateTaskBasicsSection } from './CreateTaskBasicsSection'

const meta: Meta<typeof CreateTaskBasicsSection> = {
  title: 'stepflow/tasks/create/ui/sections/CreateTaskBasicsSection',
  component: CreateTaskBasicsSection,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
