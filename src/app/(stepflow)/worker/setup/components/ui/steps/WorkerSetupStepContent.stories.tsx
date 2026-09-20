import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerSetupStepContent } from './WorkerSetupStepContent'

const meta: Meta<typeof WorkerSetupStepContent> = {
  title: 'stepflow/worker/setup/ui/steps/WorkerSetupStepContent',
  component: WorkerSetupStepContent,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
