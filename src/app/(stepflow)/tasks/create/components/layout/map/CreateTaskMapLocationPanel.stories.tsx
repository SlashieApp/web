import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { CreateTaskMapLocationPanel } from './CreateTaskMapLocationPanel'

const meta: Meta<typeof CreateTaskMapLocationPanel> = {
  title: 'Create task/CreateTaskMapLocationPanel',
  component: CreateTaskMapLocationPanel,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
