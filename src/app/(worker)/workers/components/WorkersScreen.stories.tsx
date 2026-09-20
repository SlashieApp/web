import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkersScreen } from './WorkersScreen'

const meta: Meta<typeof WorkersScreen> = {
  title: 'worker/workers/WorkersScreen',
  component: WorkersScreen,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
