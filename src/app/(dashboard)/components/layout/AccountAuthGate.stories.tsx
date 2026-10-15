import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { getRouter } from '@storybook/nextjs-vite/navigation.mock'
import { expect, waitFor, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import { storyMe } from '@/app/(auth)/helpers/authStoryFixtures'

import { AccountAuthGate } from './AccountAuthGate'

const meta = {
  title: 'Dashboard/Shared/AccountAuthGate',
  component: AccountAuthGate,
  parameters: {
    layout: 'fullscreen',
    nextjs: { navigation: { pathname: '/dashboard' } },
  },
  args: { children: 'Signed-in page' },
} satisfies Meta<typeof AccountAuthGate>

export default meta
type Story = StoryObj<typeof meta>

/** Signed in: the page shows through. */
export const SignedIn: Story = {
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Signed-in page')).toBeVisible()
  },
}

/** Cookie found, `me` still loading: the branded wait screen. */
export const Loading: Story = {
  decorators: [withSession({ token: true, authLoading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Just a moment…')).toBeVisible()
    await expect(canvas.queryByText('Signed-in page')).toBeNull()
  },
}

/** Signed out: the wait screen shows while the visitor is sent to log in and back. */
export const SignedOut: Story = {
  decorators: [withSession()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Just a moment…')).toBeVisible()
    await waitFor(() =>
      expect(getRouter().replace).toHaveBeenCalledWith(
        '/login?next=%2Fdashboard',
      ),
    )
  },
}
