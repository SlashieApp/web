import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import {
  storyAvatarUrl,
  storyMe,
  storyWorker,
  storyWorkerDraft,
  storyWorkerMe,
} from '@/app/(auth)/helpers/authStoryFixtures'
import type { MeSnapshot } from '@/app/(auth)/store/user'
import { PAGE_CONTAINER_MAX_W } from '@/theme/pageContainer'

import { ProfileHub } from './ProfileHub'

/** Story for one signed-in user: the hub reads `me` as a prop and from the store. */
function hubFor(me: MeSnapshot): Story {
  return { args: { me }, decorators: [withSession({ me })] }
}

const meta = {
  title: 'Dashboard/Profile/ProfileHub',
  component: ProfileHub,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { me: storyWorkerMe() },
  decorators: [
    (Story) => (
      <Box bg="bg.page" minH="100vh" p={{ base: 4, md: 8 }}>
        <Box maxW={PAGE_CONTAINER_MAX_W} mx="auto">
          <Story />
        </Box>
      </Box>
    ),
  ],
} satisfies Meta<typeof ProfileHub>

export default meta
type Story = StoryObj<typeof meta>

/** Customer account, no worker profile yet. */
export const Registered: Story = {
  ...hubFor(storyMe({ profile: { contactNumber: '+447700900123' } })),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      (await canvas.findAllByRole('link', { name: 'Become a worker' })).length,
    ).toBeGreaterThan(0)
  },
}

/** Worker setup in progress: a private draft, Continue setup. */
export const SetupInProgress: Story = hubFor(
  storyMe({
    profile: { contactNumber: '+447700900123' },
    worker: storyWorkerDraft(),
  }),
)

/** Published worker with a verified phone. */
export const ActiveWorker: Story = {
  ...hubFor(storyWorkerMe()),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findAllByText('Worker active'),
    ).not.toHaveLength(0)
  },
}

/** Setup complete but the phone is not verified: the next step asks for it. */
export const ActionRequired: Story = hubFor(
  storyWorkerMe({ phoneVerified: false }),
)

/** A fully filled-in worker with a photo and a private profile. */
export const PrivateProfile: Story = hubFor(
  storyWorkerMe({
    profile: { avatarUrl: storyAvatarUrl('SC') },
    settings: { isProfilePrivate: true },
    worker: storyWorker({ portfolioUrls: [storyAvatarUrl('P1', '#b4533c')] }),
  }),
)

/** The personal information drawer open over the hub. */
export const EditDrawer: Story = {
  ...hubFor(storyWorkerMe()),
  args: { me: storyWorkerMe(), initialEditSection: 'personal' },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole('dialog', {
        name: 'Edit personal information',
      }),
    ).toBeInTheDocument()
  },
}

/** The contact drawer opened from the action-required next step. */
export const EditContactDrawer: Story = {
  ...hubFor(storyWorkerMe({ phoneVerified: false })),
  args: {
    me: storyWorkerMe({ phoneVerified: false }),
    initialEditSection: 'contact',
  },
}

/** Phones: the next step sits above the hero and the sidebar cards stack under the body. */
export const Phone: Story = {
  ...hubFor(storyWorkerMe({ phoneVerified: false })),
  globals: { viewport: { value: 'mobile1' } },
}
