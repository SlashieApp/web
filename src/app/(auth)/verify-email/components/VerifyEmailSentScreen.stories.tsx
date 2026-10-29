import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import {
  cardParts,
  gapsBetweenChildren,
} from '@/app/(auth)/helpers/authSpacing.testing'
import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import { storyMe } from '@/app/(auth)/helpers/authStoryFixtures'
import { formSpace } from '@/theme/styles'
import { gapBelow, heightOf } from '@/ui/FormField/formGap.testing'

import { VerifyEmailSentScreen } from './VerifyEmailSentScreen'

const unverified = storyMe({ emailVerified: false })

/** /verify-email/sent: check your inbox; carry on now or resend. */
const meta = {
  title: 'Auth/Verify email/VerifyEmailSentScreen',
  component: VerifyEmailSentScreen,
  parameters: {
    layout: 'padded',
    nextjs: { navigation: { pathname: '/verify-email/sent' } },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 448, margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof VerifyEmailSentScreen>

export default meta
type Story = StoryObj<typeof meta>

type Canvas = ReturnType<typeof within>

/**
 * A status page (wiki: Foundations-Form-Spacing), measured between visible
 * edges: icon 24 above the title, title 8 above the description, 24 to the
 * first block (an alert, a note or the buttons), then 20 to the buttons, which
 * are 48 tall and 8 apart.
 */
async function expectStatusSpacing(canvas: Canvas, buttons: HTMLElement[]) {
  const { icon, title, subtitle, below } = await cardParts(canvas)
  const column = below[0].firstElementChild as HTMLElement
  await expect(gapBelow(icon as HTMLElement, title)).toBe(
    formSpace.headerToBody,
  )
  await expect(gapBelow(title, subtitle)).toBe(formSpace.titleToSubtitle)
  await expect(gapBelow(subtitle, column.firstElementChild as Element)).toBe(
    formSpace.headerToBody,
  )
  // The blocks (an alert or a note, then the buttons) are 20 apart.
  for (const gap of gapsBetweenChildren(column)) {
    await expect(gap).toBe(formSpace.fieldGap)
  }
  for (const button of buttons) {
    await expect(heightOf(button)).toBe(formSpace.controlHeight)
  }
  // Stacked buttons are 8 apart.
  for (let i = 1; i < buttons.length; i++) {
    await expect(gapBelow(buttons[i - 1], buttons[i])).toBe(
      formSpace.alternativesGap,
    )
  }
}

/** Signed in after sign-up: continue now, or resend. */
export const SignedIn: Story = {
  decorators: [withSession({ token: true, me: unverified })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('sam.carter@example.com')
    const next = await canvas.findByRole('link', { name: 'Continue' })
    const resend = canvas.getByRole('button', {
      name: 'Resend verification email',
    })
    await expectStatusSpacing(canvas, [next, resend])
  },
}

/** Signed out: log in to resend. */
export const SignedOut: Story = {
  decorators: [withSession()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const login = await canvas.findByRole('link', { name: 'Log in' })
    await expectStatusSpacing(canvas, [login])
    // The prompt is a note: 24 under the header, then 20 to the Log in button.
    const prompt = canvas.getByText(/Log in to resend/i)
    await expect(gapBelow(prompt, login)).toBe(formSpace.bodyToAction)
  },
}

/** Resent: a success line. */
export const Resent: Story = {
  decorators: [
    withSession({
      token: true,
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
      await canvas.findByRole('button', { name: 'Resend verification email' }),
    )
    const alert = await canvas.findByRole('status')
    expect(alert).toHaveTextContent(
      'Verification email sent. Check your inbox.',
    )
    // Header 24, the alert, 20, then Continue and Resend 8 apart.
    const next = canvas.getByRole('link', { name: 'Continue' })
    const resend = canvas.getByRole('button', {
      name: 'Resend verification email',
    })
    await expectStatusSpacing(canvas, [next, resend])
    await expect(gapBelow(alert, next)).toBe(formSpace.bodyToAction)
  },
}

/** Resent too soon. */
export const ResendTooSoon: Story = {
  decorators: [
    withSession({
      token: true,
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
      await canvas.findByRole('button', { name: 'Resend verification email' }),
    )
    const alert = await canvas.findByRole('alert')
    expect(alert).toHaveTextContent('Please wait 2 minutes before resending.')
    const next = canvas.getByRole('link', { name: 'Continue' })
    await expect(gapBelow(alert, next)).toBe(formSpace.bodyToAction)
  },
}

/** Phones: the same gaps. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [withSession({ token: true, me: unverified })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const next = await canvas.findByRole('link', { name: 'Continue' })
    const resend = canvas.getByRole('button', {
      name: 'Resend verification email',
    })
    await expectStatusSpacing(canvas, [next, resend])
  },
}

/** Already verified: the splash while it moves on. */
export const AlreadyVerified: Story = {
  decorators: [withSession({ token: true, me: storyMe() })],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Just a moment…')
  },
}
