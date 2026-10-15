import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { withSession } from '../../helpers/authStoryDecorator'
import { storyMe } from '../../helpers/authStoryFixtures'
import { AccountSuspendedBanner } from './AccountSuspendedBanner'

const meta = {
  title: 'Auth/AccountSuspendedBanner',
  component: AccountSuspendedBanner,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof AccountSuspendedBanner>

export default meta
type Story = StoryObj<typeof meta>

/** Suspended account: the notice names the support address. */
export const Suspended: Story = {
  decorators: [withSession({ me: storyMe({ disabled: true }) })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      'accounts@slashie.app',
    )
  },
}

/** The API answered ACCOUNT_DISABLED before `me` loaded: the session flag alone shows the notice. */
export const SuspendedBeforeProfileLoads: Story = {
  decorators: [withSession({ suspended: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByRole('alert')).toBeVisible()
  },
}

/** Active account: nothing is shown. */
export const Active: Story = {
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.queryByRole('alert')).toBeNull()
  },
}
