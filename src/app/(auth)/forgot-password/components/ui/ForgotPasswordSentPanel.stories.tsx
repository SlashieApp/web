import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import {
  cardParts,
  gapsBetweenChildren,
} from '@/app/(auth)/helpers/authSpacing.testing'
import {
  withAuthWidgets,
  withResetEmail,
  withSession,
} from '@/app/(auth)/helpers/authStoryDecorator'
import { isTurnstileConfigured } from '@/app/(auth)/helpers/turnstileConfig'
import { formSpace } from '@/theme/styles'
import { gapBelow, heightOf } from '@/ui/FormField/formGap.testing'

import { ForgotPasswordSentPanel } from './ForgotPasswordSentPanel'

const EMAIL = 'sam.carter@example.com'

const meta = {
  title: 'Auth/Forgot password/ForgotPasswordSentPanel',
  component: ForgotPasswordSentPanel,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ForgotPasswordSentPanel>

export default meta
type Story = StoryObj<typeof meta>

type Canvas = ReturnType<typeof within>

const resendButton = (canvas: Canvas) =>
  canvas.findByRole('button', { name: /Resend|Try again/ })

/**
 * A status page (wiki: Foundations-Form-Spacing), measured between visible
 * edges: icon 24 above the title, title 8 above the description, 24 to the
 * first block (the security check, an alert or the button), those blocks 20
 * apart down to Resend, which is 48 tall.
 */
async function expectStatusSpacing(canvas: Canvas) {
  const { icon, title, subtitle, below } = await cardParts(canvas)
  const column = below[0].firstElementChild as HTMLElement
  const resend = await resendButton(canvas)

  await expect(gapBelow(icon as HTMLElement, title)).toBe(
    formSpace.headerToBody,
  )
  await expect(gapBelow(title, subtitle)).toBe(formSpace.titleToSubtitle)
  await expect(gapBelow(subtitle, column.firstElementChild as Element)).toBe(
    formSpace.headerToBody,
  )
  await expect(column.lastElementChild).toBe(resend)
  for (const gap of gapsBetweenChildren(column)) {
    await expect(gap).toBe(formSpace.fieldGap)
  }
  await expect(heightOf(resend)).toBe(formSpace.controlHeight)
}

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
    await expectStatusSpacing(canvas)
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
    const sent = await canvas.findByText(/we sent a password reset link\.$/)
    await expect(sent).toBeVisible()
    const resend = canvas.getByRole('button', { name: /Try again in \d+s/ })
    await expect(resend).toBeDisabled()
    // The confirmation is the alert: 20 above the button.
    await expect(
      gapBelow(sent.closest('[role="status"]') as HTMLElement, resend),
    ).toBe(formSpace.bodyToAction)
    await expectStatusSpacing(canvas)
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

/** Phones: the card fills the width, with the same gaps. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [withResetEmail(EMAIL), withAuthWidgets(), withSession()],
  play: async ({ canvasElement }) => {
    await expectStatusSpacing(within(canvasElement))
  },
}
