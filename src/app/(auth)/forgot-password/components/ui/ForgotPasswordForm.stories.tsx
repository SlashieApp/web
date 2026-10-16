import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import {
  withAuthWidgets,
  withResetEmail,
  withSession,
} from '@/app/(auth)/helpers/authStoryDecorator'
import { isTurnstileConfigured } from '@/app/(auth)/helpers/turnstileConfig'

import { ForgotPasswordForm } from './ForgotPasswordForm'

const EMAIL = 'sam.carter@example.com'

const meta = {
  title: 'Auth/Forgot password/ForgotPasswordForm',
  component: ForgotPasswordForm,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ForgotPasswordForm>

export default meta
type Story = StoryObj<typeof meta>

const sendButton = (canvas: ReturnType<typeof within>) =>
  canvas.findByRole('button', { name: /Send reset link|Send again/ })

/** First visit: the email field is blank, so Send reset link is disabled. */
export const Empty: Story = {
  decorators: [withResetEmail(''), withAuthWidgets(), withSession()],
  play: async ({ canvasElement }) => {
    await expect(await sendButton(within(canvasElement))).toBeDisabled()
  },
}

/** Coming from the login form: the email it typed is filled in, the security check still open. */
export const Prefilled: Story = {
  decorators: [withResetEmail(EMAIL), withAuthWidgets(), withSession()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByDisplayValue(EMAIL)).toBeVisible()
    // The security check only gates the form when a Turnstile site key is set.
    if (isTurnstileConfigured()) {
      await expect(await sendButton(canvas)).toBeDisabled()
    }
  },
}

/** Email filled in and the security check solved: ready to send. */
export const ReadyToSend: Story = {
  decorators: [
    withResetEmail(EMAIL),
    withAuthWidgets({ captchaSolved: true }),
    withSession(),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByDisplayValue(EMAIL)).toBeVisible()
    await waitFor(async () => expect(await sendButton(canvas)).toBeEnabled())
  },
}

/** Sent and waiting for the API: the button is busy. */
export const Sending: Story = {
  decorators: [
    withResetEmail(EMAIL),
    withAuthWidgets({ captchaSolved: true }),
    withSession(),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitFor(async () => expect(await sendButton(canvas)).toBeEnabled())
    await userEvent.click(await sendButton(canvas))
    await waitFor(() =>
      expect(
        canvasElement.querySelector('button[data-loading]'),
      ).toBeDisabled(),
    )
  },
}

/** Asked again too soon: the API answers with a cooldown, shown as a message and a countdown on the button. */
export const CooldownActive: Story = {
  decorators: [
    withResetEmail(EMAIL),
    withAuthWidgets({ captchaSolved: true }),
    withSession({
      responses: {
        ForgotPassword: {
          kind: 'data',
          data: {
            forgotPassword: { success: true, cooldownSecondsRemaining: 45 },
          },
        },
      },
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitFor(async () => expect(await sendButton(canvas)).toBeEnabled())
    await userEvent.click(await sendButton(canvas))
    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Please wait before requesting another reset link.',
    )
    await expect(
      canvas.getByRole('button', { name: /Try again in \d+s/ }),
    ).toBeDisabled()
  },
}

/** The API rejects the security check: a danger message asks for it again. */
export const SecurityCheckFailed: Story = {
  decorators: [
    withResetEmail(EMAIL),
    withAuthWidgets({ captchaSolved: true }),
    withSession({
      responses: {
        ForgotPassword: { kind: 'graphqlError', code: 'CAPTCHA_FAILED' },
      },
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitFor(async () => expect(await sendButton(canvas)).toBeEnabled())
    await userEvent.click(await sendButton(canvas))
    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Security check failed or expired',
    )
  },
}

/** Phones: the card fills the width. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [withResetEmail(''), withAuthWidgets(), withSession()],
}
