import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import { storyMe } from '@/app/(auth)/helpers/authStoryFixtures'
import { formSpace } from '@/theme/styles'
import { gapBelow, heightOf } from '@/ui/FormField/formGap.testing'

import {
  barButton,
  expectNoHorizontalOverflow,
  expectPhoneWidth,
  fieldOf,
  labelOf,
  openDialog,
  phone390,
  shellOf,
} from '../dialogSpacing.testing'
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

/**
 * The spec's gaps (wiki: Foundations-Form-Spacing), measured between visible
 * edges: the description 8 under the title, 24 to the first field, label 8,
 * fields 20 apart, the last field 20 above the buttons; fields 48 tall.
 */
async function expectEmailChangeSpacing(canvasElement: HTMLElement) {
  const { dialog, title, description, body } = await openDialog(
    canvasElement,
    'Change email',
  )
  const newEmail = fieldOf(dialog, 'New email')
  const password = fieldOf(dialog, 'Current password')
  const send = barButton(dialog, 'Send link')

  // The intro is the dialog's description, with the current address in it.
  await expect(description).not.toBeNull()
  await expect(dialog).toHaveAccessibleDescription(
    /sam@example.com stays on your account until you open it/,
  )
  await expect(gapBelow(title, description as HTMLElement)).toBe(
    formSpace.titleToSubtitle,
  )
  await expect(gapBelow(description as HTMLElement, newEmail)).toBe(
    formSpace.headerToBody,
  )
  await expect(gapBelow(newEmail, password)).toBe(formSpace.fieldGap)
  await expect(gapBelow(password, send)).toBe(formSpace.bodyToAction)
  for (const field of [newEmail, password]) {
    await expect(gapBelow(labelOf(field), shellOf(field))).toBe(
      formSpace.labelToControl,
    )
    await expect(heightOf(shellOf(field))).toBe(formSpace.controlHeight)
  }
  expectNoHorizontalOverflow(body)
}

/** Gaps: header 8 and 24, fields 20 apart, the last field 20 above the buttons. */
export const Spacing: Story = {
  decorators: [withSession({ me })],
  play: ({ canvasElement }) => expectEmailChangeSpacing(canvasElement),
}

/** The same gaps at phone width. */
export const SpacingPhone: Story = {
  ...phone390,
  decorators: [withSession({ me })],
  play: async ({ canvasElement }) => {
    expectPhoneWidth(canvasElement)
    await expectEmailChangeSpacing(canvasElement)
  },
}

/** A form-level error is one more field group: 20 under the last field, 20 above the buttons. */
export const ErrorSpacing: Story = {
  decorators: [withSession({ me })],
  play: async ({ canvasElement }) => {
    await submit(canvasElement, { email: 'sam@', password: 'secret' })
    const { dialog } = await openDialog(canvasElement, 'Change email')
    const alert = within(dialog).getByRole('alert')
    const password = fieldOf(dialog, 'Current password')
    const send = barButton(dialog, 'Send link')

    await expect(gapBelow(password, alert)).toBe(formSpace.fieldGap)
    await expect(gapBelow(alert, send)).toBe(formSpace.bodyToAction)
  },
}
