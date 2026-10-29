import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import {
  cardParts,
  controlShell,
  formColumn,
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

import { ForgotPasswordForm } from './ForgotPasswordForm'

const EMAIL = 'sam.carter@example.com'

const meta = {
  title: 'Auth/Forgot password/ForgotPasswordForm',
  component: ForgotPasswordForm,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ForgotPasswordForm>

export default meta
type Story = StoryObj<typeof meta>

type Canvas = ReturnType<typeof within>

const sendButton = (canvas: Canvas) =>
  canvas.findByRole('button', { name: /Send reset link|Send again|Try again/ })

/**
 * The spec's gaps (wiki: Foundations-Form-Spacing), measured between visible
 * edges: header 8 and 24, label 8, the field, the security check and any alert
 * 20 apart, 20 to the main button; the field and the button 48 tall.
 */
async function expectFormSpacing(canvas: Canvas) {
  const { title, subtitle, below } = await cardParts(canvas)
  const column = formColumn(below[0])
  const field = column.firstElementChild as HTMLElement
  const label = field.querySelector('label') as HTMLElement
  const main = await sendButton(canvas)

  await expect(gapBelow(title, subtitle)).toBe(formSpace.titleToSubtitle)
  await expect(gapBelow(subtitle, field)).toBe(formSpace.headerToBody)
  await expect(gapBelow(label, controlShell(field))).toBe(
    formSpace.labelToControl,
  )
  // Every block in the form (the field, the security check, an alert, the
  // button) is one field group apart; the button is the last.
  await expect(column.lastElementChild).toBe(main)
  for (const gap of gapsBetweenChildren(column)) {
    await expect(gap).toBe(formSpace.fieldGap)
  }
  await expect(heightOf(controlShell(field))).toBe(formSpace.controlHeight)
  await expect(heightOf(main)).toBe(formSpace.controlHeight)
}

/** First visit: the email field is blank, so Send reset link is disabled. */
export const Empty: Story = {
  decorators: [withResetEmail(''), withAuthWidgets(), withSession()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await sendButton(canvas)).toBeDisabled()
    await expectFormSpacing(canvas)
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
    const alert = await canvas.findByRole('alert')
    await expect(alert).toHaveTextContent(
      'Please wait before requesting another reset link.',
    )
    const main = canvas.getByRole('button', { name: /Try again in \d+s/ })
    await expect(main).toBeDisabled()
    // The message is one more field: 20 above it and 20 to the button.
    await expect(gapBelow(alert, main)).toBe(formSpace.bodyToAction)
    await expectFormSpacing(canvas)
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
    const alert = await canvas.findByRole('alert')
    await expect(alert).toHaveTextContent('Security check failed or expired')
    await expect(gapBelow(alert, await sendButton(canvas))).toBe(
      formSpace.bodyToAction,
    )
    await expectFormSpacing(canvas)
  },
}

/** Phones: the card fills the width, with the same gaps. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [withResetEmail(''), withAuthWidgets(), withSession()],
  play: async ({ canvasElement }) => {
    await expectFormSpacing(within(canvasElement))
  },
}
