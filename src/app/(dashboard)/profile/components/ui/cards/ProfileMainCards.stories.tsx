import { Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { getProfileLifecycle } from '../../../helpers/profileLifecycle'
import { meStoryFixture } from '../../profileStoryFixtures'
import {
  ContactCard,
  PersonalInfoCard,
  PublicPreviewCard,
  WorkerProfileCard,
} from './ProfileMainCards'

function MainCards({ worker }: { worker: boolean }) {
  const me = meStoryFixture(worker)
  const lifecycle = getProfileLifecycle(me)
  return (
    <Stack gap={5} maxW="720px">
      <PersonalInfoCard me={me} onEdit={() => {}} />
      <ContactCard me={me} onEdit={() => {}} />
      <WorkerProfileCard me={me} lifecycle={lifecycle} onEdit={() => {}} />
      <PublicPreviewCard me={me} lifecycle={lifecycle} />
    </Stack>
  )
}

const meta = {
  title: 'Dashboard/Profile/ProfileMainCards',
  component: MainCards,
  parameters: { layout: 'padded' },
  args: { worker: false },
} satisfies Meta<typeof MainCards>

export default meta
type Story = StoryObj<typeof meta>

/** Signed-in customer (no worker profile yet). */
export const Default: Story = {}

/** Published worker. */
export const Worker: Story = { args: { worker: true } }
