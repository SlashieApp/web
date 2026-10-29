import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import { storyMe } from '@/app/(auth)/helpers/authStoryFixtures'
import { formSpace } from '@/theme/styles'
import { gapBelow } from '@/ui/FormField/formGap.testing'

import {
  barButton,
  expectNoHorizontalOverflow,
  expectPhoneWidth,
  openDialog,
  phone390,
} from '../dialogSpacing.testing'
import { EmailVerificationModal } from './EmailVerificationModal'

const unverified = storyMe({
  email: 'sam@example.com',
  emailVerified: false,
})

const meta = {
  title: 'Dashboard/Shared/EmailVerificationModal',
  component: EmailVerificationModal,
  parameters: { layout: 'padded' },
  args: { open: true, onOpenChange: fn() },
} satisfies Meta<typeof EmailVerificationModal>

export default meta
type Story = StoryObj<typeof meta>

const resend = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body).findByRole('button', {
    name: 'Resend email',
  })

/** Unverified: names the address and offers to resend the link. */
export const Unverified: Story = {
  decorators: [withSession({ me: unverified })],
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body)
    await expect(
      await page.findByRole('dialog', { name: 'Verify your email' }),
    ).toHaveTextContent('sam@example.com')
    await expect(await resend(canvasElement)).toBeEnabled()
  },
}

/** Already verified: a confirmation and no footer. */
export const AlreadyVerified: Story = {
  decorators: [withSession({ me: storyMe({ email: 'sam@example.com' }) })],
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body)
    await expect(
      await page.findByText('Your email is verified.'),
    ).toBeInTheDocument()
    await expect(
      page.queryByRole('button', { name: 'Resend email' }),
    ).toBeNull()
  },
}

/** Closed: nothing is rendered. */
export const Closed: Story = {
  args: { open: false },
  decorators: [withSession({ me: unverified })],
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement.ownerDocument.body).queryByRole('dialog'),
    ).toBeNull()
  },
}

/** Resend pressed and the API has not answered yet: the button is busy. */
export const Sending: Story = {
  decorators: [withSession({ me: unverified })],
  play: async ({ canvasElement }) => {
    await userEvent.click(await resend(canvasElement))
    await waitFor(() =>
      expect(
        canvasElement.ownerDocument.querySelector('button[data-loading]'),
      ).toBeDisabled(),
    )
  },
}

/** The API accepted the resend: a confirmation line shows. */
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
    await userEvent.click(await resend(canvasElement))
    await expect(
      await within(canvasElement.ownerDocument.body).findByText(
        'Verification email sent. Check your inbox.',
      ),
    ).toBeInTheDocument()
  },
}

/** Resent too soon: the rate limit message shows in the danger colour. */
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
    await userEvent.click(await resend(canvasElement))
    await expect(
      await within(canvasElement.ownerDocument.body).findByText(
        'Please wait 2 minutes before resending.',
      ),
    ).toBeInTheDocument()
  },
}

/**
 * Gaps: the intro is the description (8 under the title), the first block is
 * 24 below it, and the link is 20 above the buttons.
 */
async function expectUnverifiedSpacing(canvasElement: HTMLElement) {
  const { dialog, title, description, body } = await openDialog(
    canvasElement,
    'Verify your email',
  )
  const link = within(dialog).getByRole('link', { name: 'Check inbox' })
  const resend = barButton(dialog, 'Resend email')

  await expect(dialog).toHaveAccessibleDescription(
    /We'll send a verification link to sam@example.com/,
  )
  await expect(gapBelow(title, description as HTMLElement)).toBe(
    formSpace.titleToSubtitle,
  )
  await expect(gapBelow(description as HTMLElement, link)).toBe(
    formSpace.headerToBody,
  )
  await expect(gapBelow(link, resend)).toBe(formSpace.bodyToAction)
  expectNoHorizontalOverflow(body)
}

/** Unverified: description 8, then 24 to the link, 20 to the buttons. */
export const Spacing: Story = {
  decorators: [withSession({ me: unverified })],
  play: ({ canvasElement }) => expectUnverifiedSpacing(canvasElement),
}

/** The same gaps at phone width. */
export const SpacingPhone: Story = {
  ...phone390,
  decorators: [withSession({ me: unverified })],
  play: async ({ canvasElement }) => {
    expectPhoneWidth(canvasElement)
    await expectUnverifiedSpacing(canvasElement)
  },
}

/** A status line is one more block: 24 under the description, 20 above the link. */
export const StatusSpacing: Story = {
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
    await userEvent.click(await resend(canvasElement))
    const { dialog, description } = await openDialog(
      canvasElement,
      'Verify your email',
    )
    const status = await within(dialog).findByText(
      'Verification email sent. Check your inbox.',
    )
    const link = within(dialog).getByRole('link', { name: 'Check inbox' })
    const bar = barButton(dialog, 'Resend email')

    await expect(gapBelow(description as HTMLElement, status)).toBe(
      formSpace.headerToBody,
    )
    await expect(gapBelow(status, link)).toBe(formSpace.fieldGap)
    await expect(gapBelow(link, bar)).toBe(formSpace.bodyToAction)
  },
}

/** Verified: no description and no buttons, the line is 24 under the title. */
export const VerifiedSpacing: Story = {
  decorators: [withSession({ me: storyMe({ email: 'sam@example.com' }) })],
  play: async ({ canvasElement }) => {
    const { dialog, title, description, body } = await openDialog(
      canvasElement,
      'Verify your email',
    )
    const line = within(dialog).getByText('Your email is verified.')
    await expect(description).toBeNull()
    await expect(gapBelow(title, line)).toBe(formSpace.headerToBody)
    // No bar: the body ends 24 under the line, as every dialog without one.
    await expect(
      Math.round(
        body.getBoundingClientRect().bottom -
          line.getBoundingClientRect().bottom,
      ),
    ).toBe(24)
  },
}
