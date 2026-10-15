import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { withWorkerProfile } from '../shared/workerProfileStoryDecorator'
import {
  LONG_WORKER_BIO,
  workerProfileFixture,
} from '../shared/workerProfileStoryFixtures'
import { WorkerAboutSection } from './WorkerAboutSection'

/**
 * About card: the worker's bio, or a fallback line when they have not written
 * one. Long bios collapse to three lines behind "Read more" on phones only.
 * While the profile loads the section renders nothing.
 */
const meta = {
  title: 'Worker profile/WorkerAboutSection',
  component: WorkerAboutSection,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof WorkerAboutSection>

export default meta
type Story = StoryObj<typeof meta>

/** Three-paragraph bio on desktop: shown in full, no collapse control. */
export const Default: Story = {
  decorators: [
    withWorkerProfile({ worker: workerProfileFixture, maxWidth: '720px' }),
  ],
}

/** Short bio: no collapse on any screen. */
export const ShortBio: Story = {
  decorators: [
    withWorkerProfile({
      worker: {
        ...workerProfileFixture,
        bio: 'Handyman across North London. Flat-pack, shelves and small repairs.',
      },
      maxWidth: '720px',
    }),
  ],
}

/** Very long bio on desktop: still shown in full. */
export const LongBio: Story = {
  decorators: [
    withWorkerProfile({
      worker: { ...workerProfileFixture, bio: LONG_WORKER_BIO },
      maxWidth: '720px',
    }),
  ],
}

/** Phone: a long bio clamps to three lines with a "Read more" button. */
export const PhoneCollapsed: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [
    withWorkerProfile({
      worker: { ...workerProfileFixture, bio: LONG_WORKER_BIO },
    }),
  ],
}

/** Phone after tapping "Read more": the full bio and "Show less". */
export const PhoneExpanded: Story = {
  ...PhoneCollapsed,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Read more' }),
    )
    await expect(
      await canvas.findByRole('button', { name: 'Show less' }),
    ).toBeVisible()
  },
}

/** No bio written: a fallback line names the worker and points at the rest of the page. */
export const NoBio: Story = {
  decorators: [
    withWorkerProfile({
      worker: { ...workerProfileFixture, bio: null },
      maxWidth: '720px',
    }),
  ],
}
