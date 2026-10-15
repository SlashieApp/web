import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { withSession } from '../../helpers/authStoryDecorator'
import { storyMe } from '../../helpers/authStoryFixtures'
import { EmailVerificationBanner } from './EmailVerificationBanner'

const unverified = storyMe({ emailVerified: false })

const meta = {
  title: 'Auth/EmailVerificationBanner',
  component: EmailVerificationBanner,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof EmailVerificationBanner>

export default meta
type Story = StoryObj<typeof meta>

/** Unverified email: prompts to verify, with Check inbox and Resend email. */
export const Unverified: Story = {
  decorators: [withSession({ me: unverified })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('button', { name: 'Resend email' }),
    ).toBeEnabled()
  },
}

/** Resend pressed and the API has not answered yet: the button is busy. */
export const Sending: Story = {
  decorators: [withSession({ me: unverified })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Resend email' }),
    )
    await waitFor(() =>
      expect(
        canvasElement.querySelector('button[data-loading]'),
      ).toBeDisabled(),
    )
  },
}

/** The API accepted the resend: a confirmation sits beside the buttons. */
export const Sent: Story = {
  decorators: [
    withSession({
      me: unverified,
      responses: {
        ResendVerificationEmail: {
          kind: 'data',
          data: { resendVerificationEmail: true },
        },
      },
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Resend email' }),
    )
    await expect(
      await canvas.findByText('Verification email sent. Check your inbox.'),
    ).toBeVisible()
  },
}

/** Resent too soon: the API rate limit message shows in the danger colour. */
export const RateLimited: Story = {
  decorators: [
    withSession({
      me: unverified,
      responses: {
        ResendVerificationEmail: {
          kind: 'graphqlError',
          code: 'RESEND_VERIFICATION_RATE_LIMITED',
        },
      },
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Resend email' }),
    )
    await expect(
      await canvas.findByText('Please wait 2 minutes before resending.'),
    ).toBeVisible()
  },
}

/** Verified email: the banner is not shown. */
export const Verified: Story = {
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.queryByText(/Verify your email/)).toBeNull()
  },
}

/** Signed out: nothing to verify, so no banner. */
export const SignedOut: Story = {
  decorators: [withSession()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.queryByText(/Verify your email/)).toBeNull()
  },
}
