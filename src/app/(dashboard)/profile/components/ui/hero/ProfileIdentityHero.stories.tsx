import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import {
  storyAvatarUrl,
  storyMe,
  storyWorkerDraft,
  storyWorkerMe,
} from '@/app/(auth)/helpers/authStoryFixtures'
import type { MeSnapshot } from '@/app/(auth)/store/user'

import { getProfileLifecycle } from '../../../helpers/profileLifecycle'
import { ProfileIdentityHero } from './ProfileIdentityHero'

/** Story for one signed-in user: the hero reads the lifecycle derived from `me`. */
function heroFor(me: MeSnapshot): Story {
  return {
    args: { me, lifecycle: getProfileLifecycle(me) },
    decorators: [withSession({ me })],
  }
}

const meta = {
  title: 'Dashboard/Profile/ProfileIdentityHero',
  component: ProfileIdentityHero,
  parameters: { layout: 'padded' },
  args: {
    me: storyMe(),
    lifecycle: getProfileLifecycle(storyMe()),
    onEditPhoto: fn(),
  },
} satisfies Meta<typeof ProfileIdentityHero>

export default meta
type Story = StoryObj<typeof meta>

/** Customer account: neutral badge, no public profile link. */
export const Customer: Story = {
  ...heroFor(storyMe()),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Customer account')).toBeVisible()
    await expect(
      canvas.queryByRole('link', { name: /View public profile/ }),
    ).toBeNull()
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit profile photo' }),
    )
    await expect(args.onEditPhoto).toHaveBeenCalled()
  },
}

/** Worker setup unfinished: warning badge, the public profile link already points at the draft. */
export const SetupInProgress: Story = heroFor(
  storyMe({
    profile: { contactNumber: '+447700900123' },
    worker: storyWorkerDraft(),
  }),
)

/** Published worker with a verified phone: success badge and the public profile link. */
export const ActiveWorker: Story = {
  ...heroFor(storyWorkerMe()),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Worker active')).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: /View public profile/ }),
    ).toBeVisible()
  },
}

/** Worker whose phone is not verified yet: danger badge asks for action. */
export const ActionRequired: Story = heroFor(
  storyWorkerMe({ phoneVerified: false }),
)

/** With a profile photo. */
export const WithPhoto: Story = heroFor(
  storyWorkerMe({ profile: { avatarUrl: storyAvatarUrl('SC') } }),
)

/** No display name: the name falls back to the email address. */
export const NoDisplayName: Story = heroFor(
  storyMe({ email: 'jordan.lee@example.com', profile: { name: null } }),
)

/** A long name and email truncate instead of overflowing. */
export const LongNameAndEmail: Story = heroFor(
  storyMe({
    email:
      'alexandria.montgomery-featherstonehaugh@a-very-long-company-name.example.com',
    profile: { name: 'Alexandria Montgomery-Featherstonehaugh' },
  }),
)

/** Phones: avatar and details stack above the badge. */
export const Phone: Story = {
  ...heroFor(storyWorkerMe()),
  globals: { viewport: { value: 'mobile1' } },
}
