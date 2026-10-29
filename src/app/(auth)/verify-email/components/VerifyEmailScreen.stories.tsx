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

type Canvas = ReturnType<typeof within>

/**
 * A status page (wiki: Foundations-Form-Spacing), measured between visible
 * edges: icon 24 above the title, title 8 above the description, 24 to the
 * first block (an alert or the button), the blocks 20 apart, the one button
 * 48 tall.
 */
async function expectStatusSpacing(canvas: Canvas, button: HTMLElement) {
  const { icon, title, subtitle, below } = await cardParts(canvas)
  const column = below[0].firstElementChild as HTMLElement
  await expect(gapBelow(icon as HTMLElement, title)).toBe(
    formSpace.headerToBody,
  )
  await expect(gapBelow(title, subtitle)).toBe(formSpace.titleToSubtitle)
  await expect(gapBelow(subtitle, column.firstElementChild as Element)).toBe(
    formSpace.headerToBody,
  )
  await expect(column.lastElementChild).toBe(button)
  for (const gap of gapsBetweenChildren(column)) {
    await expect(gap).toBe(formSpace.fieldGap)
  }
  await expect(heightOf(button)).toBe(formSpace.controlHeight)
}

/** Nothing under the header: it gives no 24 of its own, so the card ends at the description. */
async function expectNoBody(canvas: Canvas) {
  const { header, column, below } = await cardParts(canvas)
  await expect(below).toHaveLength(0)
  await expect(
    column.getBoundingClientRect().bottom -
      header.getBoundingClientRect().bottom,
  ).toBeCloseTo(0, 2)
}

/** Checking the link. */
export const Verifying: Story = {
  parameters: withToken,
  decorators: [withSession()],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('heading', {
      level: 1,
      name: 'Verifying your email...',
    })
    await expectNoBody(within(canvasElement))
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
    await expectNoBody(within(canvasElement))
  },
}

/** No token in the link, signed out: log in to get a new one. */
export const InvalidLink: Story = {
  decorators: [withSession()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { level: 1, name: 'Invalid link' })
    const button = await canvas.findByRole('link', { name: 'Log in to resend' })
    await expectStatusSpacing(canvas, button)
  },
}

/** No token in the link, signed in: resend straight away. */
export const InvalidLinkSignedIn: Story = {
  decorators: [
    withSession({ token: true, me: storyMe({ emailVerified: false }) }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = await canvas.findByRole('button', {
      name: 'Resend verification email',
    })
    await expectStatusSpacing(canvas, button)
  },
}

/** Signed in, resent: the confirmation is 24 under the header and 20 above the button. */
export const InvalidLinkResent: Story = {
  decorators: [
    withSession({
      token: true,
      me: storyMe({ emailVerified: false }),
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
    const button = await canvas.findByRole('button', {
      name: 'Resend verification email',
    })
    await userEvent.click(button)
    const alert = await canvas.findByRole('status')
    await expect(alert).toHaveTextContent(
      'Verification email sent. Check your inbox.',
    )
    await expectStatusSpacing(canvas, button)
    await expect(gapBelow(alert, button)).toBe(formSpace.bodyToAction)
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
    await expectStatusSpacing(
      canvas,
      canvas.getByRole('link', { name: 'Log in to resend' }),
    )
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
    const canvas = within(canvasElement)
    await canvas.findByText(
      'This email is already registered to another account.',
    )
    await expectStatusSpacing(
      canvas,
      canvas.getByRole('link', { name: 'Log in to resend' }),
    )
  },
}

/** Phones: the same gaps. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [withSession()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = await canvas.findByRole('link', {
      name: 'Log in to resend',
    })
    await expectStatusSpacing(canvas, button)
  },
}
