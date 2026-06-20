import { HStack, Heading } from '@chakra-ui/react'
import { Currency, LoginMethod } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import type { MeSnapshot } from '@/app/(auth)/store/user'
import { useUserStore } from '@/app/(auth)/store/user'

import { Button } from '../Button'
import { Header } from './Header'
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
    earnings: { pending: { amount: 0, currency: Currency.Gbp } },
  },
}

function seedLoggedInWorker() {
  useUserStore.setState({
    user: {
      id: workerMe.id,
      email: workerMe.email,
      createdAt: workerMe.createdAt,
    },
    me: workerMe,
  })
}

function seedGuest() {
  useUserStore.setState({ user: null, me: null })
}

const meta = {
  title: 'header/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Header>

export default meta

type Story = StoryObj<typeof meta>

export const BrowseLoggedIn: Story = {
  parameters: {
    nextjs: { navigation: { pathname: '/' } },
  },
  decorators: [
    (Story) => {
      seedLoggedInWorker()
      return <Story />
    },
  ],
  render: () => <Header />,
}

export const Dashboard: Story = {
  parameters: {
    nextjs: { navigation: { pathname: '/dashboard' } },
  },
  decorators: [
    (Story) => {
      seedLoggedInWorker()
      return <Story />
    },
  ],
  render: () => <Header />,
}

export const Guest: Story = {
  parameters: {
    nextjs: { navigation: { pathname: '/' } },
  },
  decorators: [
    (Story) => {
      seedGuest()
      return <Story />
    },
  ],
  render: () => <Header />,
}

export const CustomChildren: Story = {
  render: () => (
    <Header>
      <HStack justify="space-between" w="full">
        <Heading size="md">Custom header</Heading>
        <Button size="sm">Action</Button>
      </HStack>
    </Header>
  ),
}
