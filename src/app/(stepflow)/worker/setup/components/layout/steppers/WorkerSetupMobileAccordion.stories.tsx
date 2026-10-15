import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withWorkerSetup } from '../../workerSetupStoryFixtures'
import { WorkerSetupMobileAccordion } from './WorkerSetupMobileAccordion'

const meta: Meta<typeof WorkerSetupMobileAccordion> = {
  title: 'Worker setup/WorkerSetupMobileAccordion',
  component: WorkerSetupMobileAccordion,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { decorators: [withWorkerSetup()] }
