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

import { PROFILE_VIEWS, type ProfileView } from '../../../views'
import { ProfileIdentityHero } from './ProfileIdentityHero'

/** Story for one signed-in user in one view. */
function heroFor(me: MeSnapshot, view: ProfileView): Story {
  return {
    args: { me, config: PROFILE_VIEWS[view] },
    decorators: [withSession({ me })],
  }
}

const meta = {
  title: 'Dashboard/Profile/ProfileIdentityHero',
  component: ProfileIdentityHero,
  parameters: { layout: 'padded' },
  args: {
    me: storyMe(),
    config: PROFILE_VIEWS.customer,
    onEditPhoto: fn(),
    onEditDetails: fn(),
  },
} satisfies Meta<typeof ProfileIdentityHero>

export default meta
type Story = StoryObj<typeof meta>

/** Customer: Customer badge, Edit details and the public profile link. */
export const Customer: Story = {
  ...heroFor(storyMe(), 'customer'),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Customer')).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: /View public profile/ }),
    ).toHaveAttribute('href', '/profile/user-story')
    await userEvent.click(canvas.getByRole('button', { name: 'Edit details' }))
    await expect(args.onEditDetails).toHaveBeenCalled()
  },
}

/** Private profile: Hidden badge and "See what others see" (the owner preview). */
export const Hidden: Story = {
  ...heroFor(
    storyMe({ settings: { isProfilePrivate: true } }),
    'customerHidden',
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Hidden')).toBeVisible()
    await expect(
      canvas.queryByRole('link', { name: /View public profile/ }),
    ).toBeNull()
    await expect(
      canvas.getByRole('link', { name: /See what others see/ }),
    ).toBeVisible()
  },
}

/** Worker setup unfinished: Setup in progress, no public link. */
export const WorkerSetup: Story = heroFor(
  storyWorkerMe({ worker: storyWorkerDraft() }),
  'workerSetup',
)

/** Finished worker without a verified phone: Action required. */
export const WorkerVerifyPhone: Story = heroFor(
  storyWorkerMe({ phoneVerified: false }),
  'workerVerifyPhone',
)

/** Finished, verified worker: Worker active and the public link. */
export const WorkerReady: Story = {
  ...heroFor(storyWorkerMe(), 'workerReady'),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('Worker active'),
    ).toBeVisible()
  },
}

const ready = heroFor(storyWorkerMe(), 'workerReady')

/** Suspended: no photo button and no Edit details. */
export const ReadOnly: Story = {
  ...ready,
  args: { ...ready.args, readOnly: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Worker active')).toBeVisible()
    await expect(
      canvas.queryByRole('button', { name: 'Edit profile photo' }),
    ).toBeNull()
    await expect(
      canvas.queryByRole('button', { name: 'Edit details' }),
    ).toBeNull()
  },
}

/** With a profile photo. */
export const WithPhoto: Story = heroFor(
  storyWorkerMe({ profile: { avatarUrl: storyAvatarUrl('SC') } }),
  'workerReady',
)

/** A long name wraps inside the hero. */
export const LongName: Story = heroFor(
  storyMe({ profile: { name: 'Alexandria Montgomery-Featherstonehaugh' } }),
  'customer',
)

/** Phones: the actions wrap under the name. */
export const Phone: Story = {
  ...heroFor(storyWorkerMe(), 'workerReady'),
  globals: { viewport: { value: 'mobile1' } },
}
