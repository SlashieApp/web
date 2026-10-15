import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { getProfileLifecycle } from '../../../helpers/profileLifecycle'
import { meStoryFixture } from '../../profileStoryFixtures'
import { ProfileIdentityHero } from './ProfileIdentityHero'

function Hero({ worker }: { worker: boolean }) {
  const me = meStoryFixture(worker)
  return (
    <ProfileIdentityHero
      me={me}
      lifecycle={getProfileLifecycle(me)}
      onEditPhoto={() => {}}
    />
  )
}

const meta = {
  title: 'Dashboard/Profile/ProfileIdentityHero',
  component: Hero,
  parameters: { layout: 'padded' },
  args: { worker: false },
} satisfies Meta<typeof Hero>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Worker: Story = { args: { worker: true } }
