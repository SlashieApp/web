import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { withWorkerProfile } from '../shared/workerProfileStoryDecorator'
import {
  ownWorkerProfileFixture,
  workerProfileFixture,
} from '../shared/workerProfileStoryFixtures'
import { WorkerContactStickyBar } from './WorkerContactStickyBar'

/**
 * Sticky bottom Contact bar. It only exists below the `lg` breakpoint, so
 * every story here is a phone; on desktop it renders nothing.
 */
const meta = {
  title: 'Worker profile/WorkerContactStickyBar',
  component: WorkerContactStickyBar,
  parameters: { layout: 'fullscreen' },
  globals: { viewport: { value: 'mobile1' } },
} satisfies Meta<typeof WorkerContactStickyBar>

export default meta
type Story = StoryObj<typeof meta>

/** Phone, signed-out visitor: pinned to the bottom with the "details are safe" line. */
export const Default: Story = {
  decorators: [withWorkerProfile({ worker: workerProfileFixture })],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('button', {
        name: 'Contact James',
      }),
    ).toBeVisible()
  },
}

/** Phone, the worker's own profile: the Contact button is disabled. */
export const OwnProfile: Story = {
  decorators: [withWorkerProfile({ worker: ownWorkerProfileFixture })],
}

/** Phone, profile still loading: a skeleton where the button goes. */
export const Loading: Story = {
  decorators: [withWorkerProfile()],
}
