import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkersAreaInput } from './WorkersSearchFields'

const meta: Meta<typeof WorkersAreaInput> = {
  title: 'worker/workers/ui/WorkersSearchFields',
  component: WorkersAreaInput,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
