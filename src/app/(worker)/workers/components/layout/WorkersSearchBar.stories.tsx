import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkersSearchBar } from './WorkersSearchBar'

const meta: Meta<typeof WorkersSearchBar> = {
  title: 'worker/workers/layout/WorkersSearchBar',
  component: WorkersSearchBar,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
