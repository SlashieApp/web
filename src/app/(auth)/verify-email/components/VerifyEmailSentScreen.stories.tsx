import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import { storyMe } from '@/app/(auth)/helpers/authStoryFixtures'

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

/** Signed in after sign-up: continue now, or resend. */
export const SignedIn: Story = {
  decorators: [withSession({ token: true, me: unverified })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('sam.carter@example.com')
    await canvas.findByRole('link', { name: 'Continue' })
  },
}

/** Signed out: log in to resend. */
export const SignedOut: Story = {
  decorators: [withSession()],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('link', { name: 'Log in' })
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
    expect(await canvas.findByRole('status')).toHaveTextContent(
      'Verification email sent. Check your inbox.',
    )
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
    expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Please wait 2 minutes before resending.',
    )
  },
}

/** Already verified: the splash while it moves on. */
export const AlreadyVerified: Story = {
  decorators: [withSession({ token: true, me: storyMe() })],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Just a moment…')
  },
}
