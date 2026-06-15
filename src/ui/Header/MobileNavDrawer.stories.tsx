import { Currency, LoginMethod } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import type { MeSnapshot } from '@/app/(auth)/store/user'
import { useUserStore } from '@/app/(auth)/store/user'

import { MobileNavDrawer } from './MobileNavDrawer'
import { membershipFixtureTrial } from './membershipStoryFixtures'

const meFixture: MeSnapshot = {
  id: 'user-1',
  email: 'ryan@example.com',
  emailVerified: true,
  phoneVerified: false,
  phoneVerifiedAt: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  enabledLoginMethods: [LoginMethod.Password],
  profile: {
    name: 'Ryan Kwan',
    contactNumber: null,
    avatarUrl: null,
    bio: null,
    dateOfBirth: null,
    defaultPreferredContactMethod: null,
    emailVerified: true,
    phoneVerified: false,
  },
  settings: {
    isProfilePrivate: false,
    marketingEmails: false,
  },
  workerEligibility: false,
  worker: {
    id: 'worker-1',
    legalName: 'Ryan Kwan',
    bio: null,
    tagline: null,
    yearsExperience: null,
    skills: [],
    portfolioUrls: [],
    location: { address: null, lat: null, lng: null, name: null },
    setupProgress: {
      currentSubStep: 'review.submit',
      completedSubSteps: ['review.submit'],
      isComplete: true,
    },
    isVerified: true,
    tasksCompletedCount: 12,
    locationAddress: null,
    locationLat: null,
    locationLng: null,
    membership: membershipFixtureTrial,
    earnings: { pending: { amount: 0, currency: Currency.Gbp } },
  },
}

function seedMeStore(me: MeSnapshot) {
  useUserStore.setState({
    user: { id: me.id, email: me.email, createdAt: me.createdAt },
    me,
  })
}

function DrawerStory() {
  const [open, setOpen] = useState(true)
  return <MobileNavDrawer open={open} onOpenChange={setOpen} />
}

const meta = {
  title: 'layout/MobileNavDrawer',
  component: MobileNavDrawer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'mobile1' },
  },
  args: {
    open: true,
    onOpenChange: () => {},
  },
  decorators: [
    (Story) => {
      seedMeStore(meFixture)
      return <Story />
    },
  ],
} satisfies Meta<typeof MobileNavDrawer>

export default meta

type Story = StoryObj<typeof meta>

export const Open: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
  },
  render: () => <DrawerStory />,
}

export const CustomerOnly: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
  },
  decorators: [
    (Story) => {
      seedMeStore({ ...meFixture, worker: null })
      return <Story />
    },
  ],
  render: () => <DrawerStory />,
}
