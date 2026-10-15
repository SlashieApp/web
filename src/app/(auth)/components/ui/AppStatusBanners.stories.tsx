import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { withSession } from '../../helpers/authStoryDecorator'
import { storyMe } from '../../helpers/authStoryFixtures'
import { AppStatusBanners } from './AppStatusBanners'

const meta = {
  title: 'Auth/AppStatusBanners',
  component: AppStatusBanners,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof AppStatusBanners>

export default meta
type Story = StoryObj<typeof meta>

/** Verified, active account: no banner is shown. */
export const Clear: Story = {
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.queryByRole('alert')).toBeNull()
    await expect(canvas.queryByText(/Verify your email/)).toBeNull()
  },
}

/** Unverified email: the verify notice with Check inbox and Resend email. */
export const EmailUnverified: Story = {
  decorators: [withSession({ me: storyMe({ emailVerified: false }) })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText(/Verify your email/)).toBeVisible()
  },
}

/** Suspended account: only the suspension notice. */
export const Suspended: Story = {
  decorators: [withSession({ me: storyMe({ disabled: true }) })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByRole('alert')).toBeVisible()
    await expect(canvas.queryByText(/Verify your email/)).toBeNull()
  },
}

/** Suspended and unverified: suspension first, then the email notice. */
export const SuspendedAndUnverified: Story = {
  decorators: [
    withSession({ me: storyMe({ disabled: true, emailVerified: false }) }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const suspension = await canvas.findByRole('alert')
    const verify = await canvas.findByText(/Verify your email/)
    await expect(
      suspension.compareDocumentPosition(verify) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  },
}
