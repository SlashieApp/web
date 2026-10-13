import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useEffect } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'

import { meStoryFixture } from '../../profileStoryFixtures'
import { ProfileEditDrawer, type ProfileEditSection } from './ProfileEditDrawer'

function SignedInDrawer({ section }: { section: ProfileEditSection }) {
  // The editors read the signed-in user from the store.
  useEffect(() => {
    useUserStore.getState().setMe(meStoryFixture())
  }, [])
  return <ProfileEditDrawer section={section} onOpenChange={() => {}} />
}

const meta = {
  title: 'dashboard/profile/ui/edit/ProfileEditDrawer',
  component: SignedInDrawer,
  parameters: { layout: 'padded' },
  args: { section: 'personal' },
} satisfies Meta<typeof SignedInDrawer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
