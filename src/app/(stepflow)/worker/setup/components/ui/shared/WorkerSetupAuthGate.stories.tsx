import { Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { getRouter } from '@storybook/nextjs-vite/navigation.mock'
import { expect, waitFor, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'

import { withZhHk, workerSetupStoryMe } from '../../workerSetupStoryFixtures'
import { WorkerSetupAuthGate } from './WorkerSetupAuthGate'

const meta = {
  title: 'Worker setup/WorkerSetupAuthGate',
  component: WorkerSetupAuthGate,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      navigation: {
        pathname: '/worker/setup',
        query: { next: '/tasks/example' },
      },
    },
  },
  args: {
    children: (
      <Text p={6}>Worker setup opens here once you are signed in.</Text>
    ),
  },
} satisfies Meta<typeof WorkerSetupAuthGate>

export default meta
type Story = StoryObj<typeof meta>

/** Signed in: the gate gets out of the way and shows setup. */
export const SignedIn: Story = {
  decorators: [withSession({ me: workerSetupStoryMe() })],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(
        'Worker setup opens here once you are signed in.',
      ),
    ).toBeVisible()
  },
}

/** Signed out: off to log in, coming back with the task link kept. */
export const SignedOut: Story = {
  decorators: [withSession()],
  play: async () => {
    await waitFor(() =>
      expect(getRouter().replace).toHaveBeenCalledWith(
        `/login?next=${encodeURIComponent('/worker/setup?next=%2Ftasks%2Fexample')}`,
      ),
    )
  },
}

/** Signed out in zh-HK: the login page opens in zh-HK too. */
export const SignedOutZhHk: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/zh-hk/worker/setup',
        query: { next: '/tasks/example' },
      },
    },
  },
  decorators: [withSession(), withZhHk],
  play: async () => {
    await waitFor(() =>
      expect(getRouter().replace).toHaveBeenCalledWith(
        `/zh-hk/login?next=${encodeURIComponent('/worker/setup?next=%2Ftasks%2Fexample')}`,
      ),
    )
  },
}

/** The session is there but the account didn't load: Try again, not log in. */
export const LoadFailed: Story = {
  decorators: [withSession({ token: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText("We couldn't load your account"),
    ).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Try again' }),
    ).toBeVisible()
  },
}
