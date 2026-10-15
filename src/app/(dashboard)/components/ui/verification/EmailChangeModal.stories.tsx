import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import { storyMe } from '@/app/(auth)/helpers/authStoryFixtures'

import { EmailChangeModal } from './EmailChangeModal'

const me = storyMe({ email: 'sam@example.com' })

const meta = {
  title: 'Dashboard/Shared/EmailChangeModal',
  component: EmailChangeModal,
  parameters: { layout: 'padded' },
  args: { open: true, onOpenChange: fn() },
} satisfies Meta<typeof EmailChangeModal>

export default meta
type Story = StoryObj<typeof meta>

/** Fills the form and presses Send link. */
async function submit(
  canvasElement: HTMLElement,
  { email = '', password = '' }: { email?: string; password?: string },
) {
  const page = within(canvasElement.ownerDocument.body)
  if (email)
    await userEvent.type(await page.findByLabelText('New email'), email)
  if (password) {
    await userEvent.type(page.getByLabelText('Current password'), password)
  }
  await userEvent.click(page.getByRole('button', { name: 'Send link' }))
  return page
}

/** Open: explains that the current email stays until the link is opened. */
export const Default: Story = {
  decorators: [withSession({ me })],
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body)
    await expect(
      await page.findByRole('dialog', { name: 'Change email' }),
    ).toBeInTheDocument()
  },
}

/** Closed: nothing is rendered. */
export const Closed: Story = {
  args: { open: false },
  decorators: [withSession({ me })],
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body)
    await expect(page.queryByRole('dialog')).toBeNull()
  },
}

/** Not an email address: an inline error, nothing is sent. */
export const InvalidEmail: Story = {
  decorators: [withSession({ me })],
  play: async ({ canvasElement }) => {
    const page = await submit(canvasElement, {
      email: 'sam@',
      password: 'secret',
    })
    await expect(await page.findByRole('alert')).toHaveTextContent(
      'Enter a valid email address.',
    )
  },
}

/** The new address is the one already on the account. */
export const SameEmail: Story = {
  decorators: [withSession({ me })],
  play: async ({ canvasElement }) => {
    const page = await submit(canvasElement, {
      email: 'Sam@Example.com',
      password: 'secret',
    })
    await expect(await page.findByRole('alert')).toHaveTextContent(
      "That's already your email.",
    )
  },
}

/** A valid new email but no password. */
export const MissingPassword: Story = {
  decorators: [withSession({ me })],
  play: async ({ canvasElement }) => {
    const page = await submit(canvasElement, { email: 'sam.new@example.com' })
    await expect(await page.findByRole('alert')).toHaveTextContent(
      'Enter your current password.',
    )
  },
}

/** Sent and waiting for the API: Send link is busy. */
export const Sending: Story = {
  decorators: [withSession({ me })],
  play: async ({ canvasElement }) => {
    await submit(canvasElement, {
      email: 'sam.new@example.com',
      password: 'secret',
    })
    await waitFor(() =>
      expect(
        canvasElement.ownerDocument.querySelector('button[data-loading]'),
      ).toBeDisabled(),
    )
  },
}

/** The API rejects the password. */
export const WrongPassword: Story = {
  decorators: [
    withSession({
      me,
      responses: {
        RequestEmailChange: {
          kind: 'graphqlError',
          code: 'INVALID_CREDENTIALS',
        },
      },
    }),
  ],
  play: async ({ canvasElement }) => {
    const page = await submit(canvasElement, {
      email: 'sam.new@example.com',
      password: 'wrong',
    })
    await expect(await page.findByRole('alert')).toHaveTextContent(
      'That password is incorrect.',
    )
  },
}
