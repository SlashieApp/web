import { Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { getProfileLifecycle } from '../../../helpers/profileLifecycle'
import { meStoryFixture } from '../../profileStoryFixtures'
import {
  NextStepCard,
  PrivacyVisibilityCard,
  ProfileStrengthCard,
} from './ProfileSidebarCards'

function SidebarCards({ worker }: { worker: boolean }) {
  const me = meStoryFixture(worker)
  return (
    <Stack gap={5} maxW="360px">
      <NextStepCard lifecycle={getProfileLifecycle(me)} />
      <ProfileStrengthCard me={me} />
      <PrivacyVisibilityCard me={me} />
    </Stack>
  )
}

const meta = {
  title: 'Dashboard/Profile/ProfileSidebarCards',
  component: SidebarCards,
  parameters: { layout: 'padded' },
  args: { worker: false },
} satisfies Meta<typeof SidebarCards>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Worker: Story = { args: { worker: true } }
