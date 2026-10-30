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

/**
 * A check that belongs to one field is that field's error: the text, the
 * field marked invalid and described by it, and focus back in the field.
 */
async function expectFieldError(
  page: ReturnType<typeof within>,
  label: string,
  message: string,
) {
  const input = await page.findByLabelText(label)
  const error = await page.findByText(message)
  await expect(input).toBeInvalid()
  await expect(input).toHaveAccessibleDescription(message)
  await expect(error.id).not.toBe('')
  await waitFor(() => expect(input).toHaveFocus())
  // It is the field's own line, not a form-level alert.
  await expect(page.queryByRole('alert')).toBeNull()
  return { input, error }
}

/** Not an email address: New email's error, nothing is sent. */
export const InvalidEmail: Story = {
  decorators: [withSession({ me })],
  play: async ({ canvasElement }) => {
    const page = await submit(canvasElement, {
      email: 'sam@',
      password: 'secret',
    })
    await expectFieldError(page, 'New email', 'Enter a valid email address.')
    await expect(page.getByLabelText('Current password')).not.toBeInvalid()
  },
}

/** The new address is the one already on the account: New email's error. */
export const SameEmail: Story = {
  decorators: [withSession({ me })],
  play: async ({ canvasElement }) => {
    const page = await submit(canvasElement, {
      email: 'Sam@Example.com',
      password: 'secret',
    })
    await expectFieldError(page, 'New email', "That's already your email.")
  },
}

/** A valid new email but no password: Current password's error. */
export const MissingPassword: Story = {
  decorators: [withSession({ me })],
  play: async ({ canvasElement }) => {
    const page = await submit(canvasElement, { email: 'sam.new@example.com' })
    await expectFieldError(
      page,
      'Current password',
      'Enter your current password.',
    )
    await expect(page.getByLabelText('New email')).not.toBeInvalid()
  },
}

/** Typing in the field takes its error away. */
export const ErrorClearsWhenTyping: Story = {
  decorators: [withSession({ me })],
  play: async ({ canvasElement }) => {
    const page = await submit(canvasElement, {
      email: 'sam@',
      password: 'secret',
    })
    const input = await page.findByLabelText('New email')
    await page.findByText('Enter a valid email address.')
    await userEvent.type(input, 'x')
    await waitFor(() =>
      expect(page.queryByText('Enter a valid email address.')).toBeNull(),
    )
    await expect(input).not.toBeInvalid()
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

/**
 * A field's error is part of its field: 4 under its control, then the field
 * gap to the next field. On the last field, the 20 to the buttons is below it.
 */
export const FieldErrorSpacing: Story = {
  decorators: [withSession({ me })],
  play: async ({ canvasElement }) => {
    await submit(canvasElement, { email: 'sam@', password: 'secret' })
    const { dialog } = await openDialog(canvasElement, 'Change email')
    const newEmail = fieldOf(dialog, 'New email')
    const password = fieldOf(dialog, 'Current password')
    const error = within(dialog).getByText('Enter a valid email address.')

    await expect(gapBelow(shellOf(newEmail), error)).toBe(
      formSpace.controlToHelper,
    )
    await expect(gapBelow(newEmail, password)).toBe(formSpace.fieldGap)
    await expect(heightOf(error)).toBe(16)
  },
}

/** The last field's error: 4 under it, 20 above the buttons. */
export const LastFieldErrorSpacing: Story = {
  decorators: [withSession({ me })],
  play: async ({ canvasElement }) => {
    await submit(canvasElement, { email: 'sam.new@example.com' })
    const { dialog } = await openDialog(canvasElement, 'Change email')
    const password = fieldOf(dialog, 'Current password')
    const error = within(dialog).getByText('Enter your current password.')
    const send = barButton(dialog, 'Send link')

    await expect(gapBelow(shellOf(password), error)).toBe(
      formSpace.controlToHelper,
    )
    await expect(gapBelow(password, send)).toBe(formSpace.bodyToAction)
  },
}

/** A failed request is one more field group: 20 under the last field, 20 above the buttons. */
export const ErrorSpacing: Story = {
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
    await submit(canvasElement, {
      email: 'sam.new@example.com',
      password: 'wrong',
    })
    const { dialog } = await openDialog(canvasElement, 'Change email')
    const alert = await within(dialog).findByRole('alert')
    const password = fieldOf(dialog, 'Current password')
    const send = barButton(dialog, 'Send link')

    await expect(gapBelow(password, alert)).toBe(formSpace.fieldGap)
    await expect(gapBelow(alert, send)).toBe(formSpace.bodyToAction)
  },
}
