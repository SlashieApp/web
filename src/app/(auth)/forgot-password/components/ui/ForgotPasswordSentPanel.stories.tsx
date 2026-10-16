import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import {
  withAuthWidgets,
  withResetEmail,
  withSession,
} from '@/app/(auth)/helpers/authStoryDecorator'
import { isTurnstileConfigured } from '@/app/(auth)/helpers/turnstileConfig'

import { ForgotPasswordSentPanel } from './ForgotPasswordSentPanel'

const EMAIL = 'sam.carter@example.com'

const meta = {
  title: 'Auth/Forgot password/ForgotPasswordSentPanel',
  component: ForgotPasswordSentPanel,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ForgotPasswordSentPanel>

export default meta
type Story = StoryObj<typeof meta>

const resendButton = (canvas: ReturnType<typeof within>) =>
  canvas.findByRole('button', { name: /Resend/ })

/** Link requested: names the saved email; resend waits for the security check. */
export const Sent: Story = {
  decorators: [withResetEmail(EMAIL), withAuthWidgets(), withSession()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText(EMAIL)).toBeVisible()
    // The security check only gates resend when a Turnstile site key is set.
    if (isTurnstileConfigured()) {
      await expect(await resendButton(canvas)).toBeDisabled()
    }
  },
}

/** Security check solved: Resend reset link is ready. */
export const ReadyToResend: Story = {
  decorators: [
    withResetEmail(EMAIL),
    withAuthWidgets({ captchaSolved: true }),
    withSession(),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitFor(async () => expect(await resendButton(canvas)).toBeEnabled())
  },
}

/** Resent: a confirmation shows and the button counts down before it can be used again. */
export const Resent: Story = {
  decorators: [
    withResetEmail(EMAIL),
    withAuthWidgets({ captchaSolved: true }),
    withSession({
      responses: {
        ForgotPassword: {
          kind: 'data',
          data: {
            forgotPassword: { success: true, cooldownSecondsRemaining: 60 },
          },
        },
      },
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitFor(async () => expect(await resendButton(canvas)).toBeEnabled())
    await userEvent.click(await resendButton(canvas))
    await expect(
      await canvas.findByText(/we sent a password reset link\.$/),
    ).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: /Try again in \d+s/ }),
    ).toBeDisabled()
  },
}

/** Opened directly, with no saved email: the session splash while it sends the visitor back to the form. */
export const OpenedDirectly: Story = {
  decorators: [withResetEmail(''), withAuthWidgets(), withSession()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Just a moment…')).toBeVisible()
  },
}

/** Phones: the card fills the width. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [withResetEmail(EMAIL), withAuthWidgets(), withSession()],
}
