import { LoginMethod } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import { storyMe } from '@/app/(auth)/helpers/authStoryFixtures'

import { DeleteAccountSection } from './DeleteAccountSection'

const meta = {
  title: 'Dashboard/Account/DeleteAccountSection',
  component: DeleteAccountSection,
  parameters: { layout: 'padded' },
  args: { enabledLoginMethods: [LoginMethod.Password] },
  decorators: [withSession({ me: storyMe() })],
} satisfies Meta<typeof DeleteAccountSection>

export default meta
type Story = StoryObj<typeof meta>

const page = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body)

/** Closed: the card explains the 30 days and offers Delete account. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('button', {
        name: 'Delete account',
      }),
    ).toBeVisible()
    await expect(page(canvasElement).queryByRole('dialog')).toBeNull()
  },
}

/** Delete account pressed: the confirm dialog opens on a password field. */
export const DialogOpen: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await within(canvasElement).findByRole('button', {
        name: 'Delete account',
      }),
    )
    await expect(
      await page(canvasElement).findByRole('dialog', {
        name: 'Delete your account?',
      }),
    ).toBeInTheDocument()
    await expect(
      page(canvasElement).getByLabelText('Your password'),
    ).toBeInTheDocument()
  },
}

/** Back from the Google re-auth (`?delete=confirm`): the dialog reopens, ready to confirm. */
export const ReturnedFromReauth: Story = {
  args: { enabledLoginMethods: [LoginMethod.Google] },
  parameters: {
    nextjs: {
      navigation: { pathname: '/account', query: { delete: 'confirm' } },
    },
  },
  play: async ({ canvasElement }) => {
    await expect(
      await page(canvasElement).findByText(/You can confirm now/),
    ).toBeInTheDocument()
  },
}
