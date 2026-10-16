import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import {
  ZH_HK_SETUP,
  withWorkerSetup,
  withZhHk,
} from '../../workerSetupStoryFixtures'
import { WorkerSetupProgressBar } from './WorkerSetupProgressBar'

const meta: Meta<typeof WorkerSetupProgressBar> = {
  title: 'Worker setup/WorkerSetupProgressBar',
  component: WorkerSetupProgressBar,
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof meta>

/** Mid-flow: step 3 of 6. */
export const Default: Story = {
  decorators: [withWorkerSetup()],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('Step 3 of 6 · Your profile'),
    ).toBeVisible()
  },
}

/** First screen. */
export const FirstStep: Story = {
  decorators: [withWorkerSetup({ screen: 'about' })],
}

/** The review: the bar is full. */
export const ReviewStep: Story = {
  decorators: [withWorkerSetup({ screen: 'review' })],
}

/** zh-HK. */
export const ZhHk: Story = {
  parameters: ZH_HK_SETUP,
  decorators: [withWorkerSetup({ screen: 'area' }), withZhHk],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('第 4 步（共 6 步）· 工作地區'),
    ).toBeVisible()
  },
}
