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

/** No number saved: add one and get a code. */
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

/** A verified number: changing it starts with a blank field. */
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
