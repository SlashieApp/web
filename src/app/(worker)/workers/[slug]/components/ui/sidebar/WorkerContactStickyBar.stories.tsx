import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerContactStickyBar } from './WorkerContactStickyBar'

const meta: Meta<typeof WorkerContactStickyBar> = {
  title: 'Worker profile/WorkerContactStickyBar',
  component: WorkerContactStickyBar,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
