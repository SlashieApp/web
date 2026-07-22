import { Box, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import {
  Currency,
  LoginMethod,
  UserLanguage,
  WorkerSubscriptionStatus,
} from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { type MeSnapshot, useUserStore } from '@/app/(auth)/store/user'

import { Button } from '../Button'

import { Header } from './Header'

/**
 * SDL app `Header`. One public API (`children` + `BoxProps`); the default body
 * renders the full app navigation, which adapts to four states:
 *
 * - **guest** — logged-out toolbar (Post a task, Log in / Sign up, mobile menu)
 * - **browse** — logged-in marketing/browse toolbar (Post a task, notifications, account)
 * - **dashboard** — logged-in account-hub toolbar (section nav + context label)
 * - **custom** — caller-provided `children` replace the default body
 *
 * Stories seed Zustand auth state and the Next pathname; the global theme toolbar
 * renders each under light and dark — no mode is hardcoded here.
 */

const meWorker: MeSnapshot = {
  id: 'user-1',
  email: 'ryan@example.com',
  emailVerified: true,
  phoneVerified: true,
  phoneVerifiedAt: '2024-06-01T00:00:00.000Z',
  createdAt: '2024-01-01T00:00:00.000Z',
  enabledLoginMethods: [LoginMethod.Password],
  profile: {
    name: 'Ryan Kwan',
    contactNumber: '+447878154432',
    avatarUrl: null,
    bio: 'Handyman covering North London.',
    dateOfBirth: '1990-04-12T00:00:00.000Z',
    defaultPreferredContactMethod: null,
    emailVerified: true,
    phoneVerified: true,
  },
  settings: {
    isProfilePrivate: false,
    language: UserLanguage.En,
    marketingEmails: false,
  },
  workerEligibility: true,
  worker: {
    id: 'worker-1',
    legalName: 'Ryan Kwan',
    bio: 'Handyman covering North London.',
    tagline: 'Reliable local help',
    yearsExperience: 8,
    skills: ['Plumbing', 'Assembly'],
    qualifications: [],
    portfolioUrls: [],
    location: {
      address: 'London',
      lat: 51.5074,
      lng: -0.1278,
      name: 'London',
    },
    setupProgress: {
      currentSubStep: 'review.submit',
      completedSubSteps: ['review.submit'],
      isComplete: true,
    },
    isVerified: true,
    tasksCompletedCount: 12,
    locationAddress: 'London',
    locationLat: 51.5074,
    locationLng: -0.1278,
    membership: {
      planName: 'Slashie Unlimited',
      statusLabel: 'Trial',
      statusDescription: 'Unlimited quotes until 9 Dec 2026',
      subscriptionStatus: WorkerSubscriptionStatus.Trialing,
      hasUnlimitedQuotes: true,
      cancelAtPeriodEnd: false,
      canceledAt: null,
      freeQuotesPerMonth: 3,
      quotesUsedThisMonth: 0,
      quotesRemainingThisMonth: 3,
      trialEndsAt: '2026-12-09T00:00:00.000Z',
      currentPeriodEnd: '2026-12-09T00:00:00.000Z',
      canStartTrial: false,
      canManageBilling: true,
      canUpgrade: false,
    },
    earnings: { pending: { amount: 120, currency: Currency.Gbp } },
  },
}

const meCustomer: MeSnapshot = {
  ...meWorker,
  workerEligibility: false,
  worker: null,
}

const meWorkerFree: MeSnapshot = {
  ...meWorker,
  worker: meWorker.worker
    ? {
        ...meWorker.worker,
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
      }
    : null,
}

function seedMe(me: MeSnapshot | null) {
  if (!me) {
    useUserStore.setState({ user: null, me: null })
    return
  }
  useUserStore.setState({
    user: { id: me.id, email: me.email, createdAt: me.createdAt },
    me,
  })
}

type HeaderMode = 'guest' | 'browse' | 'dashboard'

function seedForMode(mode: HeaderMode) {
  seedMe(mode === 'guest' ? null : meWorker)
}

const meta = {
  title: 'ui/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    children: { control: false },
  },
} satisfies Meta<typeof Header>

export default meta
type Story = StoryObj<typeof meta>

/** Interactive playground. Switch the `mode` control to seed each header state. */
export const Playground: Story = {
  argTypes: {
    // `mode` is a story-only control, not a Header prop.
    // @ts-expect-error story-only arg
    mode: {
      control: 'inline-radio',
      options: ['guest', 'browse', 'dashboard'] satisfies HeaderMode[],
    },
  },
  // @ts-expect-error story-only arg
  args: { mode: 'browse' },
  render: (args) => {
    const mode = (args as { mode?: HeaderMode }).mode ?? 'browse'
    seedForMode(mode)
    return <Header />
  },
  parameters: { nextjs: { navigation: { pathname: '/' } } },
}

/** Logged-out toolbar: Post a task, Log in / Sign up, and the mobile menu trigger. */
export const Guest: Story = {
  parameters: { nextjs: { navigation: { pathname: '/' } } },
  decorators: [
    (Story) => {
      seedMe(null)
      return <Story />
    },
  ],
  render: () => <Header />,
}

/** Logged-in browse toolbar: Post a task, notifications bell, and account menu. */
export const BrowseLoggedIn: Story = {
  parameters: { nextjs: { navigation: { pathname: '/' } } },
  decorators: [
    (Story) => {
      seedMe(meWorker)
      return <Story />
    },
  ],
  render: () => <Header />,
}

/** Account-hub toolbar: section menu trigger + dashboard context label. */
export const Dashboard: Story = {
  parameters: { nextjs: { navigation: { pathname: '/dashboard' } } },
  decorators: [
    (Story) => {
      seedMe(meWorker)
      return <Story />
    },
  ],
  render: () => <Header />,
}

/** Customer (no worker profile) — account menu surfaces the upsell card. */
export const CustomerAccount: Story = {
  parameters: { nextjs: { navigation: { pathname: '/' } } },
  decorators: [
    (Story) => {
      seedMe(meCustomer)
      return <Story />
    },
  ],
  render: () => <Header />,
}

/** Worker on the free plan — account menu shows the quote-usage meter. */
export const WorkerFreePlan: Story = {
  parameters: { nextjs: { navigation: { pathname: '/dashboard' } } },
  decorators: [
    (Story) => {
      seedMe(meWorkerFree)
      return <Story />
    },
  ],
  render: () => <Header />,
}

/** Caller-supplied children replace the default navigation body. */
export const CustomChildren: Story = {
  parameters: { nextjs: { navigation: { pathname: '/' } } },
  render: () => (
    <Header>
      <HStack justify="space-between" w="full">
        <Heading size="md">Custom header</Heading>
        <Button size="sm">Action</Button>
      </HStack>
    </Header>
  ),
}

/**
 * Overview of the header shell + toolbar slots, rendered with custom children so
 * every row is deterministic (auth/pathname state is global, so a single render
 * tree can only resolve one default-navigation state — see the dedicated Guest /
 * BrowseLoggedIn / Dashboard stories for those). Renders under light and dark.
 */
export const AllVariants: Story = {
  parameters: { nextjs: { navigation: { pathname: '/' } } },
  render: () => {
    const rows: { label: string; node: React.ReactNode }[] = [
      {
        label: 'Brand + primary action',
        node: (
          <HStack justify="space-between" w="full">
            <Heading size="md">Slashie</Heading>
            <Button size="sm">Post a task</Button>
          </HStack>
        ),
      },
      {
        label: 'Title + secondary / primary actions',
        node: (
          <HStack justify="space-between" w="full">
            <Heading size="md">Dashboard</Heading>
            <HStack gap={2}>
              <Button size="sm" variant="secondary">
                Get app
              </Button>
              <Button size="sm">Post a task</Button>
            </HStack>
          </HStack>
        ),
      },
      {
        label: 'Single centered title',
        node: (
          <HStack justify="center" w="full">
            <Heading size="md">Checkout</Heading>
          </HStack>
        ),
      },
    ]
    return (
      <Stack gap={8} p={4}>
        {rows.map((row) => (
          <Stack key={row.label} gap={2}>
            <Text fontSize="xs" fontWeight={700} color="text.muted">
              {row.label}
            </Text>
            <Box
              borderWidth="1px"
              borderColor="border.default"
              borderRadius="lg"
              overflow="hidden"
            >
              <Header position="static">{row.node}</Header>
            </Box>
          </Stack>
        ))}
      </Stack>
    )
  },
}
