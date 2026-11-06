import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { getRouter } from '@storybook/nextjs-vite/navigation.mock'
import { expect, waitFor, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import { storyMe } from '@/app/(auth)/helpers/authStoryFixtures'
import {
  boxOf,
  expectPx,
  expectWindowWidth,
  viewportAt,
} from '@/ui/PageContainer/pageLines.testing'
import { expectCentredCardBox } from '@/ui/StatusCard/statusCard.testing'

import { AccountAuthGate } from './AccountAuthGate'

const meta = {
  title: 'Dashboard/Shared/AccountAuthGate',
  component: AccountAuthGate,
  parameters: {
    layout: 'fullscreen',
    nextjs: { navigation: { pathname: '/account' } },
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
        '/login?next=%2Faccount',
      ),
    )
  },
}

/** The session error card: the shared status card (R6), centred, 448 wide. */
const expectSessionCard = async (canvasElement: HTMLElement, width: number) => {
  const card = await within(canvasElement).findByRole('alert', {
    name: "We couldn't load your account",
  })
  // The alert is the card itself: no live region around the page's main.
  expect(card.tagName).toBe('SECTION')
  expect(card.querySelector('main')).toBeNull()
  expect(canvasElement.querySelectorAll('[role="alert"]')).toHaveLength(1)
  expectCentredCardBox(canvasElement, card)
  expectPx(boxOf(card).width, width)
}

/** The session is there but the account didn't load: Try again or Log out, no sign-in. */
export const LoadFailed: Story = {
  ...viewportAt(1366),
  decorators: [withSession({ token: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText("We couldn't load your account"),
    ).toBeVisible()
    expectWindowWidth(canvasElement, 1366)
    await expectSessionCard(canvasElement, 448)
    await expect(
      canvas.getByRole('button', { name: 'Try again' }),
    ).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Log out' })).toBeVisible()
    await expect(canvas.queryByText('Signed-in page')).toBeNull()
  },
}

/** Phone: the session error card is the container, 358 wide at 390. */
export const LoadFailedPhone: Story = {
  ...viewportAt(390),
  decorators: [withSession({ token: true })],
  play: async ({ canvasElement }) => {
    expectWindowWidth(canvasElement, 390)
    await expectSessionCard(canvasElement, 358)
    await expect(
      within(canvasElement).getByRole('button', { name: 'Try again' }),
    ).toBeVisible()
  },
}
