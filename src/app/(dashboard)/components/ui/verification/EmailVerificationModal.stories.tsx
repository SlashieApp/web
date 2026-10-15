import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import { storyMe } from '@/app/(auth)/helpers/authStoryFixtures'

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
