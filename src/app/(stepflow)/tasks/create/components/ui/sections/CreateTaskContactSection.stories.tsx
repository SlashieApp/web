import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { CreateTaskContactSection } from './CreateTaskContactSection'

const meta: Meta<typeof CreateTaskContactSection> = {
  title: 'stepflow/tasks/create/ui/sections/CreateTaskContactSection',
  component: CreateTaskContactSection,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
