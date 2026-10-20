import { LoginMethod } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import { storyMe } from '@/app/(auth)/helpers/authStoryFixtures'

import { PhoneVerificationModal } from './PhoneVerificationModal'

const PHONE = '+447700900123'

const meta = {
  title: 'Dashboard/Shared/PhoneVerificationModal',
  component: PhoneVerificationModal,
  parameters: { layout: 'padded' },
  args: { open: true, onOpenChange: fn() },
} satisfies Meta<typeof PhoneVerificationModal>

export default meta
type Story = StoryObj<typeof meta>

const page = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body)

/** No number saved: add one and get a code (no password for a first number). */
export const AddNumber: Story = {
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    await expect(
      await page(canvasElement).findByRole('dialog', {
        name: 'Add contact phone number',
      }),
    ).toBeInTheDocument()
    await expect(
      page(canvasElement).getByLabelText('Mobile number'),
    ).toHaveValue('')
    await expect(
      page(canvasElement).queryByLabelText('Current password'),
    ).toBeNull()
  },
}

/** A saved number that is not verified yet: it is prefilled. */
export const VerifySavedNumber: Story = {
  decorators: [
    withSession({ me: storyMe({ profile: { contactNumber: PHONE } }) }),
  ],
  play: async ({ canvasElement }) => {
    await expect(
      await page(canvasElement).findByLabelText('Mobile number'),
    ).toHaveDisplayValue(/7700 ?900123/)
  },
}

/** A verified number on a password account: a blank field and the password to confirm. */
export const ChangeVerifiedNumber: Story = {
  decorators: [
    withSession({
      me: storyMe({ phoneVerified: true, profile: { contactNumber: PHONE } }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await expect(
      await page(canvasElement).findByRole('dialog', {
        name: 'Change phone number',
      }),
    ).toBeInTheDocument()
    await expect(
      page(canvasElement).getByLabelText('Current password'),
    ).toBeInTheDocument()
  },
}

/** Changing without the password: asks for it before anything is sent. */
export const ChangeNeedsPassword: Story = {
  decorators: [
    withSession({
      me: storyMe({ phoneVerified: true, profile: { contactNumber: PHONE } }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await userEvent.type(
      await page(canvasElement).findByLabelText('Mobile number'),
      '7700900456',
    )
    await userEvent.click(
      page(canvasElement).getByRole('button', { name: 'Send code' }),
    )
    await expect(
      await page(canvasElement).findByText('Enter your current password.'),
    ).toBeInTheDocument()
  },
}

/** Google-only account changing a verified number: no password field (the API checks a recent sign-in). */
export const ChangeWithoutPassword: Story = {
  decorators: [
    withSession({
      me: storyMe({
        phoneVerified: true,
        enabledLoginMethods: [LoginMethod.Google],
        profile: { contactNumber: PHONE },
      }),
      responses: {
        SendPhoneVerification: {
          kind: 'graphqlError',
          code: 'REAUTH_REQUIRED',
        },
      },
    }),
  ],
  play: async ({ canvasElement }) => {
    await userEvent.type(
      await page(canvasElement).findByLabelText('Mobile number'),
      '7700900456',
    )
    await expect(
      page(canvasElement).queryByLabelText('Current password'),
    ).toBeNull()
    await userEvent.click(
      page(canvasElement).getByRole('button', { name: 'Send code' }),
    )
    await expect(
      await page(canvasElement).findByText(/sign out and sign in again/),
    ).toBeInTheDocument()
  },
}

/** A change is waiting for its SMS code: opens on the code step. */
export const EnterCode: Story = {
  decorators: [
    withSession({
      me: storyMe({
        phoneVerified: true,
        pendingPhone: '+447700900456',
        profile: { contactNumber: PHONE },
      }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await expect(
      await page(canvasElement).findByText(/enter the 6-digit code we sent to/),
    ).toBeInTheDocument()
  },
}

/** Send code with no number: an inline error, nothing is sent. */
export const MissingNumber: Story = {
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await page(canvasElement).findByRole('button', { name: 'Send code' }),
    )
    await expect(
      await page(canvasElement).findByText('Enter your mobile number.'),
    ).toBeInTheDocument()
  },
}

/** Code step verified empty: asks for the 6 digits. */
export const CodeIncomplete: Story = {
  decorators: [
    withSession({
      me: storyMe({
        phoneVerified: true,
        pendingPhone: '+447700900456',
        profile: { contactNumber: PHONE },
      }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await page(canvasElement).findByRole('button', { name: 'Verify' }),
    )
    await expect(
      await page(canvasElement).findByText(
        'Enter the 6-digit code from your SMS.',
      ),
    ).toBeInTheDocument()
  },
}

/** Closed: nothing is rendered. */
export const Closed: Story = {
  args: { open: false },
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    await expect(page(canvasElement).queryByRole('dialog')).toBeNull()
  },
}
