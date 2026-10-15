import { Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { clearAuthToken } from '@/utils/auth'

import {
  withWorkerAccount,
  workerSetupStoryMe,
} from '../../workerSetupStoryFixtures'
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
  // No auth cookie: the gate then never asks the live API for the user.
  beforeEach: () => clearAuthToken(),
} satisfies Meta<typeof WorkerSetupAuthGate>

export default meta
type Story = StoryObj<typeof meta>

/** Signed in: the gate gets out of the way and shows setup. */
export const SignedIn: Story = {
  decorators: [withWorkerAccount(workerSetupStoryMe())],
}

/** Signed out: the session splash shows while the gate redirects to login. */
export const SignedOut: Story = {
  decorators: [withWorkerAccount(null)],
}
