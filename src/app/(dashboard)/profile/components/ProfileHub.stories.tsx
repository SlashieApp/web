import { Box } from '@chakra-ui/react'
import {
  Currency,
  UserLanguage,
  WorkerPrimaryCategory,
  WorkerSubscriptionStatus,
} from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { type MeSnapshot, useUserStore } from '@/app/(auth)/store/user'

import { ProfileHub } from './ProfileHub'
import type { ProfileEditSection } from './edit/ProfileEditDrawer'

function profileFixture({
  worker = 'none',
  phoneVerified = false,
}: {
  worker?: 'none' | 'setup' | 'active'
  phoneVerified?: boolean
}): MeSnapshot {
  return {
    id: 'user-rk',
    email: 'rikhong124@gmail.com',
    emailVerified: true,
    phoneVerified,
    phoneVerifiedAt: phoneVerified ? '2026-06-08T10:00:00.000Z' : null,
    createdAt: '2026-06-01T10:00:00.000Z',
    enabledLoginMethods: [],
    workerEligibility: worker !== 'none',
    profile: {
      name: 'R K',
      contactNumber: '+447878154432',
      avatarUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop',
      bio: null,
      dateOfBirth: '1992-04-12T00:00:00.000Z',
      defaultPreferredContactMethod: null,
      emailVerified: true,
      phoneVerified,
    },
    settings: {
      isProfilePrivate: false,
      language: UserLanguage.En,
      marketingEmails: true,
    },
    worker:
      worker === 'none'
        ? null
        : ({
            id: 'worker-rk',
            legalName: 'R K',
            bio: 'Reliable local handyman with experience in flat-pack assembly, mounting, and everyday home repairs.',
            tagline: 'Reliable handyman and flat-pack expert',
            primaryCategory: WorkerPrimaryCategory.Handyman,
            yearsExperience: 6,
            skills: ['Handyman', 'Furniture assembly', 'Flat-pack expert'],
            qualifications: [],
            travelRadiusMiles: 10,
            portfolioUrls:
              worker === 'active'
                ? [
                    'https://images.unsplash.com/photo-1581578731548-c64695cc6952',
                  ]
                : [],
            isVerified: false,
            tasksCompletedCount: 12,
            locationAddress: 'Watford',
            locationLat: 51.6565,
            locationLng: -0.3903,
            location: {
              name: 'Watford',
              address: 'Private street address',
              lat: 51.6565,
              lng: -0.3903,
            },
            setupProgress: {
              currentSubStep:
                worker === 'setup' ? 'services.skills' : 'complete',
              completedSubSteps:
                worker === 'setup'
                  ? ['profile.details', 'profile.bio']
                  : [
                      'profile.details',
                      'profile.bio',
                      'services.skills',
                      'services.experience',
                    ],
              isComplete: worker === 'active',
            },
            membership: {
              planName: 'Free',
              statusLabel: 'Free',
              statusDescription: null,
              subscriptionStatus: WorkerSubscriptionStatus.None,
              hasUnlimitedQuotes: false,
              cancelAtPeriodEnd: false,
              canceledAt: null,
              freeQuotesPerMonth: 3,
              quotesUsedThisMonth: 2,
              quotesRemainingThisMonth: 1,
              trialEndsAt: null,
              currentPeriodEnd: '2026-12-09T00:00:00.000Z',
              canStartTrial: false,
              canManageBilling: false,
              canUpgrade: true,
            },
            earnings: { pending: { amount: 0, currency: Currency.Gbp } },
          } as NonNullable<MeSnapshot['worker']>),
  } as MeSnapshot
}

function StoryProfile({
  me,
  initialEditSection,
}: {
  me: MeSnapshot
  initialEditSection?: ProfileEditSection
}) {
  useUserStore.setState({
    user: { id: me.id, email: me.email, createdAt: String(me.createdAt) },
    me,
  })
  return (
    <Box bg="bg.page" minH="100vh" p={{ base: 4, md: 8 }}>
      <Box maxW="1200px" mx="auto">
        <ProfileHub me={me} initialEditSection={initialEditSection} />
      </Box>
    </Box>
  )
}

const meta = {
  title: 'dashboard/profile/ProfileHub',
  component: ProfileHub,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { me: profileFixture({ worker: 'active', phoneVerified: true }) },
} satisfies Meta<typeof ProfileHub>

export default meta

type Story = StoryObj<typeof meta>

export const Registered: Story = {
  render: () => <StoryProfile me={profileFixture({ worker: 'none' })} />,
}

export const SetupInProgress: Story = {
  render: () => <StoryProfile me={profileFixture({ worker: 'setup' })} />,
}

export const ActiveWorker: Story = {
  render: () => (
    <StoryProfile
      me={profileFixture({ worker: 'active', phoneVerified: true })}
    />
  ),
}

export const ActionRequired: Story = {
  render: () => (
    <StoryProfile
      me={profileFixture({ worker: 'active', phoneVerified: false })}
    />
  ),
}

export const EditDrawer: Story = {
  render: () => (
    <StoryProfile
      me={profileFixture({ worker: 'active', phoneVerified: true })}
      initialEditSection="personal"
    />
  ),
}
