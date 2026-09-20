import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerSetupReviewStep } from './WorkerSetupReviewStep'

const meta: Meta<typeof WorkerSetupReviewStep> = {
  title: 'stepflow/worker/setup/ui/steps/WorkerSetupReviewStep',
  component: WorkerSetupReviewStep,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
