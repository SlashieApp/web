import { LoginMethod } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { DeleteAccountDialog } from './DeleteAccountDialog'

const meta = {
  title: 'dashboard/account/DeleteAccountDialog',
  component: DeleteAccountDialog,
  args: {
    open: true,
    onOpenChange: () => {},
    enabledLoginMethods: [LoginMethod.Password],
    reauthed: false,
  },
} satisfies Meta<typeof DeleteAccountDialog>

export default meta
type Story = StoryObj<typeof meta>

/** Password accounts confirm with their password. */
export const PasswordAccount: Story = {}

/** Google-only: sign in again before confirming. */
export const GoogleOnly: Story = {
  args: { enabledLoginMethods: [LoginMethod.Google] },
}

/** Back from the Google re-auth: ready to confirm. */
export const GoogleReauthed: Story = {
  args: { enabledLoginMethods: [LoginMethod.Google], reauthed: true },
}
