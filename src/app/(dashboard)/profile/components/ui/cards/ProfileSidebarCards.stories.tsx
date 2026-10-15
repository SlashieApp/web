import { Stack } from '@chakra-ui/react'
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

import { getProfileLifecycle } from '../../../helpers/profileLifecycle'
import {
  NextStepCard,
  PrivacyVisibilityCard,
  ProfileStrengthCard,
} from './ProfileSidebarCards'

/** The three sidebar cards; action-required opens the editor like the hub does. */
function SidebarCards({ me }: { me: MeSnapshot }) {
  const lifecycle = getProfileLifecycle(me)
  return (
    <Stack gap={5} maxW="360px">
      <NextStepCard
        lifecycle={lifecycle}
        onAction={lifecycle.kind === 'actionRequired' ? () => {} : undefined}
      />
      <ProfileStrengthCard me={me} />
      <PrivacyVisibilityCard me={me} />
    </Stack>
  )
}

/** Story for one signed-in user. */
function cardsFor(me: MeSnapshot): Story {
  return { args: { me }, decorators: [withSession({ me })] }
}

const meta = {
  title: 'Dashboard/Profile/ProfileSidebarCards',
  component: SidebarCards,
  parameters: { layout: 'padded' },
  args: { me: storyMe() },
} satisfies Meta<typeof SidebarCards>

export default meta
type Story = StoryObj<typeof meta>

/** Customer: next step is Become a worker, and there is no profile strength card. */
export const Customer: Story = {
  ...cardsFor(storyMe()),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('link', { name: 'Become a worker' }),
    ).toBeVisible()
    await expect(canvas.queryByText('Profile strength')).toBeNull()
  },
}

/** Worker setup unfinished: Continue setup and a low strength score. */
export const SetupInProgress: Story = cardsFor(
  storyMe({
    profile: { contactNumber: '+447700900123' },
    worker: storyWorkerDraft(),
  }),
)

/** Published worker, phone verified: View public profile, most strength items ticked. */
export const ActiveWorker: Story = {
  ...cardsFor(storyWorkerMe()),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('link', {
        name: /View public profile/,
      }),
    ).toBeVisible()
  },
}

/** Phone not verified: the next step is a button that opens the contact editor. */
export const ActionRequired: Story = {
  ...cardsFor(storyWorkerMe({ phoneVerified: false })),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('button', {
        name: 'Verify phone',
      }),
    ).toBeVisible()
  },
}

/** Every strength item done, including the optional portfolio: 100%. */
export const FullStrength: Story = {
  ...cardsFor(
    storyWorkerMe({
      profile: { avatarUrl: storyAvatarUrl('SC') },
      worker: storyWorker({
        portfolioUrls: [storyAvatarUrl('P1', '#b4533c')],
      }),
    }),
  ),
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText('100%')).toBeVisible()
  },
}

/** Private profile: the privacy card says only the owner can see it. */
export const PrivateProfile: Story = {
  ...cardsFor(storyWorkerMe({ settings: { isProfilePrivate: true } })),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('Your profile is private'),
    ).toBeVisible()
  },
}
