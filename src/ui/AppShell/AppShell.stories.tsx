import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client/core'
import { ApolloProvider } from '@apollo/client/react'
import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import {
  Currency,
  LoginMethod,
  UserLanguage,
  WorkerSubscriptionStatus,
} from '@codegen/schema'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { NEVER } from 'rxjs'
import { expect, waitFor, within } from 'storybook/test'

import { type MeSnapshot, useUserStore } from '@/app/(auth)/store/user'
import { AUTH_COOKIE_NAME } from '@/utils/auth'

import { FeedbackDialogProvider } from '../FeedbackDialog/FeedbackDialogProvider'
import { AppShell } from './AppShell'

/** Signed-in worker on the 6-month trial. */
const meWorker: MeSnapshot = {
  id: 'user-1',
  email: 'sam@example.com',
  emailVerified: true,
  phoneVerified: true,
  phoneVerifiedAt: '2024-06-01T00:00:00.000Z',
  createdAt: '2024-01-01T00:00:00.000Z',
  disabled: false,
  enabledLoginMethods: [LoginMethod.Password],
  profile: {
    name: 'Sam Carter',
    contactNumber: '+447700900123',
    avatarUrl: null,
    dateOfBirth: '1990-01-01T00:00:00.000Z',
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
    legalName: 'Sam Carter',
    bio: 'Handyman covering North London.',
    tagline: 'Reliable local help',
    yearsExperience: 8,
    skills: ['Plumbing', 'Assembly'],
    qualifications: [],
    portfolioUrls: [],
    preferredLocation: {
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

const meUnverified: MeSnapshot = { ...meWorker, emailVerified: false }

/** Stands in for the live `getUser`: it just returns whoever is seeded. */
const stubGetUser = async () => useUserStore.getState().user

/**
 * Seeds the auth store. `getUser` is stubbed because the Header calls it on
 * mount when an auth cookie exists, and stories must never reach the live API.
 */
const withMe =
  (me: MeSnapshot | null): Decorator =>
  (Story) => {
    const state = useUserStore.getState()
    if (state.me !== me || state.getUser !== stubGetUser) {
      useUserStore.setState({
        user: me && { id: me.id, email: me.email, createdAt: me.createdAt },
        me,
        getUser: stubGetUser,
      })
    }
    return <Story />
  }

/**
 * Story-only: this page's `document.cookie` reports the auth cookie. Real
 * cookies are shared by every test file running at the same time, so setting
 * or clearing one here could flip other stories between signed in and out.
 */
function stubAuthCookie(token: string) {
  Object.defineProperty(document, 'cookie', {
    configurable: true,
    get: () => `${AUTH_COOKIE_NAME}=${token}`,
    set: () => {},
  })
  return () => {
    Reflect.deleteProperty(document, 'cookie')
  }
}

/**
 * Signed-out store whose `getUser` never settles, so the session stays loading.
 * The Header only shows skeletons while an auth cookie exists: the story's
 * `beforeEach` stubs one.
 */
const withPendingSession: Decorator = (Story) => {
  useUserStore.setState({
    user: null,
    me: null,
    getUser: () => new Promise(() => undefined),
  })
  return <Story />
}

/** Story-only Apollo client: operations never resolve, so nothing reaches the live API. */
const neverClient = new ApolloClient({
  link: new ApolloLink(() => NEVER),
  cache: new InMemoryCache(),
})

const pageContent = (
  <Stack gap={3} px={4} py={6}>
    <Heading size="md">Page title</Heading>
    <Text color="text.muted" fontSize="sm">
      Shared Header + scrolling main + mobile bottom nav.
    </Text>
    <Box h="80vh" borderRadius="lg" bg="bg.subtle" />
  </Stack>
)

/** Long page, so the scrolling main pane has something to scroll. */
const TASK_SECTIONS = [
  'Overview',
  'Photos',
  'Location',
  'Budget',
  'Quotes',
  'Activity',
  'Questions',
  'Similar tasks',
] as const

const longPageContent = (
  <Stack gap={3} px={4} py={6}>
    <Heading size="md">Fix a leaking kitchen tap</Heading>
    <Text color="text.muted" fontSize="sm">
      Scroll down: on phones the header slot tucks away while you read.
    </Text>
    {TASK_SECTIONS.map((section) => (
      <Box key={section} h="160px" borderRadius="lg" bg="bg.subtle" p={4}>
        <Text fontSize="sm" fontWeight={600} color="text.default">
          {section}
        </Text>
      </Box>
    ))}
  </Stack>
)

const meta = {
  title: 'Shell/AppShell',
  component: AppShell,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { navigation: { pathname: '/search' } },
  },
  args: { children: pageContent },
  // Guest by default; signed-in stories override the seed.
  decorators: [
    (Story) => (
      <ApolloProvider client={neverClient}>
        <FeedbackDialogProvider onSubmit={async () => true}>
          <Story />
        </FeedbackDialogProvider>
      </ApolloProvider>
    ),
    withMe(null),
  ],
} satisfies Meta<typeof AppShell>

export default meta
type Story = StoryObj<typeof meta>

/** Guest on desktop: header toolbar above a scrolling main pane, no bottom nav above lg. */
export const Default: Story = {}

/** Signed in on desktop: the header shows the nav links, Post a task and the account menu. */
export const SignedIn: Story = {
  decorators: [withMe(meWorker)],
}

/** Session loading: auth cookie present but `me` not loaded, so the header shows skeletons. */
export const SessionLoading: Story = {
  args: { hasSession: true },
  beforeEach: () => stubAuthCookie('story-session-token'),
  decorators: [withPendingSession],
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByLabelText('Loading account'),
    ).toBeInTheDocument()
  },
}

/** Phone: no header bar, the glass bottom nav floats over the bottom of the main pane. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('navigation', {
        name: 'Primary navigation',
      }),
    ).toBeVisible()
  },
}

/** Task detail on a phone (/tasks/:slug): the bottom nav is hidden for the page's own CTA. */
export const TaskDetailRoute: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  parameters: {
    nextjs: { navigation: { pathname: '/tasks/fix-a-leaking-tap' } },
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByRole('navigation', {
        name: 'Primary navigation',
      }),
    ).toBeNull()
  },
}

/** Task detail, scrolled down on a phone: the header slot (here the verify-email banner) tucks away. */
export const TaskDetailScrolledDown: Story = {
  args: { children: longPageContent },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  parameters: {
    nextjs: { navigation: { pathname: '/tasks/fix-a-leaking-tap' } },
  },
  decorators: [withMe(meUnverified)],
  play: async ({ canvasElement }) => {
    const main = canvasElement.querySelector('main')
    if (!main) throw new Error('AppShell main pane not found')
    await expect(canvasElement.querySelector('[data-header-hidden]')).toBeNull()
    main.scrollTop = 400
    await waitFor(
      () =>
        expect(
          canvasElement.querySelector('[data-header-hidden]'),
        ).not.toBeNull(),
      { timeout: 3000 },
    )
  },
}

/** Open message thread on a phone (/messages/:id): full screen, so the bottom nav is hidden. */
export const MessageThreadRoute: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  parameters: {
    nextjs: { navigation: { pathname: '/messages/thread-1' } },
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByRole('navigation', {
        name: 'Primary navigation',
      }),
    ).toBeNull()
  },
}

/** Custom main pane: `mainProps` restyles the scrolling pane (background and padding here). */
export const CustomMainProps: Story = {
  args: {
    mainProps: { bg: 'bg.subtle', px: 4, py: 6 },
    children: (
      <Text color="text.muted" fontSize="sm">
        The main pane is tinted and padded through `mainProps`.
      </Text>
    ),
  },
}
