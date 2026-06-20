import { Box } from '@chakra-ui/react'
import { Currency, LoginMethod } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import type { MeSnapshot } from '@/app/(auth)/store/user'
import { useUserStore } from '@/app/(auth)/store/user'

import { AccountMenu } from './AccountMenu'
import { membershipFixtureTrial } from './membershipStoryFixtures'

const workerMe: MeSnapshot = {
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
    earnings: { pending: { amount: 120, currency: Currency.Gbp } },
  },
}

function seedMeStore(me: MeSnapshot) {
  useUserStore.setState({
    user: { id: me.id, email: me.email, createdAt: me.createdAt },
    me,
  })
}

const meta = {
  title: 'header/AccountMenu',
  component: AccountMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <Box display="flex" justifyContent="flex-end" p={6}>
        <Story />
      </Box>
    ),
    (Story) => {
      seedMeStore(workerMe)
      return <Story />
    },
  ],
  args: {
    initialOpen: true,
  },
} satisfies Meta<typeof AccountMenu>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
