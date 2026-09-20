import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerSetupMobileAccordion } from './WorkerSetupMobileAccordion'

const meta: Meta<typeof WorkerSetupMobileAccordion> = {
  title: 'stepflow/worker/setup/layout/steppers/WorkerSetupMobileAccordion',
  component: WorkerSetupMobileAccordion,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
