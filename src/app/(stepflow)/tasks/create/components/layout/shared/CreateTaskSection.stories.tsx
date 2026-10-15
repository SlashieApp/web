import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { CreateTaskSection } from './CreateTaskSection'

const meta: Meta<typeof CreateTaskSection> = {
  title: 'Create task/CreateTaskSection',
  component: CreateTaskSection,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
