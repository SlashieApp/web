import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerSetupScreen } from './WorkerSetupScreen'
import { withWorkerSetup } from './workerSetupStoryFixtures'

const meta: Meta<typeof WorkerSetupScreen> = {
  title: 'Worker setup/WorkerSetupScreen',
  component: WorkerSetupScreen,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { decorators: [withWorkerSetup()] }

/** Phones: the accordion replaces the side stepper. */
export const Mobile: Story = {
  decorators: [withWorkerSetup()],
  globals: { viewport: { value: 'mobile1' } },
}

export const Loading: Story = {
  decorators: [withWorkerSetup({ isHydrated: false })],
}

/** The setup query failed: retry instead of a blank screen (FE-207). */
export const LoadError: Story = {
  decorators: [withWorkerSetup({ isHydrated: false, loadError: true })],
}
