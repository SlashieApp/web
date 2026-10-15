import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerSetupProfilePreview } from './WorkerSetupProfilePreview'

const meta: Meta<typeof WorkerSetupProfilePreview> = {
  title: 'Worker setup/WorkerSetupProfilePreview',
  component: WorkerSetupProfilePreview,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
