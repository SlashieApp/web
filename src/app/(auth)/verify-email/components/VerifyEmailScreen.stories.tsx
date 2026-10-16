import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import { storyMe } from '@/app/(auth)/helpers/authStoryFixtures'

import { VerifyEmailScreen } from './VerifyEmailScreen'

const withToken = {
  nextjs: {
    navigation: { pathname: '/verify-email', query: { token: 'story' } },
  },
}

/** /verify-email: confirms the emailed link, then carries on. */
const meta = {
  title: 'Auth/Verify email/VerifyEmailScreen',
  component: VerifyEmailScreen,
  parameters: {
    layout: 'padded',
    nextjs: { navigation: { pathname: '/verify-email' } },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 448, margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof VerifyEmailScreen>

export default meta
type Story = StoryObj<typeof meta>

/** Checking the link. */
export const Verifying: Story = {
  parameters: withToken,
  decorators: [withSession()],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('heading', {
      level: 1,
      name: 'Verifying your email...',
    })
  },
}

/** Confirmed: on the way to the next page. */
export const Verified: Story = {
  parameters: withToken,
  decorators: [
    withSession({
      responses: {
        VerifyEmail: {
          kind: 'data',
          data: {
            verifyEmail: {
              __typename: 'AuthPayload',
              token: 'story-token',
              user: {
                __typename: 'User',
                id: 'user-story',
                email: 'sam.carter@example.com',
                emailVerified: true,
                emailVerifiedAt: '2030-01-01T12:00:00.000Z',
              },
            },
          },
        },
      },
    }),
  ],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('heading', {
      level: 1,
      name: 'Email confirmed',
    })
  },
}

/** No token in the link, signed out: log in to get a new one. */
export const InvalidLink: Story = {
  decorators: [withSession()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { level: 1, name: 'Invalid link' })
    await canvas.findByRole('link', { name: 'Log in to resend' })
  },
}

/** No token in the link, signed in: resend straight away. */
export const InvalidLinkSignedIn: Story = {
  decorators: [
    withSession({ token: true, me: storyMe({ emailVerified: false }) }),
  ],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('button', {
      name: 'Resend verification email',
    })
  },
}

/** The link expired. */
export const Expired: Story = {
  parameters: withToken,
  decorators: [
    withSession({
      responses: {
        VerifyEmail: {
          kind: 'graphqlError',
          code: 'INVALID_OR_EXPIRED_VERIFICATION',
        },
      },
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', {
      level: 1,
      name: 'Link expired or invalid',
    })
    expect(
      canvas.getByText('This verification link is invalid or has expired.'),
    ).toBeVisible()
  },
}

/** The address now belongs to another account. */
export const EmailInUse: Story = {
  parameters: withToken,
  decorators: [
    withSession({
      responses: {
        VerifyEmail: { kind: 'graphqlError', code: 'EMAIL_OR_PHONE_IN_USE' },
      },
    }),
  ],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText(
      'This email is already registered to another account.',
    )
  },
}
