import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client/core'
import { ApolloProvider } from '@apollo/client/react'
import { Box, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import {
  Currency,
  LoginMethod,
  UserLanguage,
  WorkerSubscriptionStatus,
} from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { NEVER } from 'rxjs'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { type MeSnapshot, useUserStore } from '@/app/(auth)/store/user'
import { messagesValue } from '@/app/(messages)/messages/components/messagesStoryFixtures'
import { MessagesContext } from '@/app/(messages)/messages/context/MessagesProvider'
import { AUTH_COOKIE_NAME } from '@/utils/auth'

import { Button } from '../Button'
import { FeedbackDialogProvider } from '../FeedbackDialog/FeedbackDialogProvider'

import { Header } from './Header'

/**
 * SDL app `Header`. One public API (`children` + `BoxProps`); the default body
 * renders the full app navigation, which adapts to three states:
 *
 * - **guest**: logged-out toolbar (Feedback, Log in / Sign up)
 * - **session**: auth cookie present, `me` not loaded yet (account-slot skeletons)
 * - **browse**: logged-in toolbar (Post a task, nav links, account menu)
 * - **custom**: caller-provided `children` replace the default body
 *
 * Account-hub routes (`/dashboard`, `/requests`, …) use this same toolbar;
 * hub destinations live in the account menu. Stories seed Zustand auth state
 * and the Next pathname; the global theme toolbar renders each under light
 * and dark, so no mode is hardcoded here.
 */

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

/** Stands in for the live `getUser`: it just returns whoever is seeded. */
const stubGetUser = async () => useUserStore.getState().user

/**
 * Seeds the auth store. `getUser` is stubbed because the Header calls it on
 * mount when an auth cookie exists, and stories must never reach the live API.
 */
function seedMe(me: MeSnapshot | null) {
  useUserStore.setState({
    user: me ? { id: me.id, email: me.email, createdAt: me.createdAt } : null,
    me,
    getUser: stubGetUser,
  })
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
function seedPendingSession() {
  useUserStore.setState({
    user: null,
    me: null,
    getUser: () => new Promise(() => undefined),
  })
}

/** Story-only Apollo client: operations never resolve, so nothing reaches the live API. */
const neverClient = new ApolloClient({
  link: new ApolloLink(() => NEVER),
  cache: new InMemoryCache(),
})

const meUnverified: MeSnapshot = { ...meWorker, emailVerified: false }

type HeaderMode = 'guest' | 'browse'

function seedForMode(mode: HeaderMode) {
  seedMe(mode === 'guest' ? null : meWorker)
}

const meta = {
  title: 'Shell/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    children: { control: false },
  },
  decorators: [
    (Story) => {
      // Stories that do not seed (custom children) must not reach the API either.
      if (useUserStore.getState().getUser !== stubGetUser) {
        useUserStore.setState({ getUser: stubGetUser })
      }
      return (
        <ApolloProvider client={neverClient}>
          <FeedbackDialogProvider onSubmit={async () => true}>
            <Story />
          </FeedbackDialogProvider>
        </ApolloProvider>
      )
    },
  ],
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
      options: ['guest', 'browse'] satisfies HeaderMode[],
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

/** Guest: Feedback button and Log in / Sign up links (Post a task and My tasks need an account). */
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

/** Session loading: auth cookie present, so account-slot skeletons replace Log in / Sign up. */
export const SessionSkeleton: Story = {
  parameters: { nextjs: { navigation: { pathname: '/' } } },
  beforeEach: () => stubAuthCookie('story-session-token'),
  decorators: [
    (Story) => {
      seedPendingSession()
      return <Story />
    },
  ],
  render: () => <Header hasSession />,
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByLabelText('Loading account'),
    ).toBeInTheDocument()
  },
}

/** Signed in: Workers, My tasks and Messages links, Post a task, and the account menu. */
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

/** Logged-in toolbar on an account-hub route: same chrome as browse (no section switcher). */
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

/** Customer (no worker profile): the account menu surfaces the upsell card. */
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

/** Worker on the free plan: the account menu shows the quote-usage meter. */
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

/** Logged-in suspended account: persistent contact banner above the toolbar. */
export const SuspendedAccount: Story = {
  parameters: { nextjs: { navigation: { pathname: '/' } } },
  decorators: [
    (Story) => {
      seedMe({ ...meWorker, disabled: true })
      return <Story />
    },
  ],
  render: () => <Header />,
}

/** Unverified email: a banner above the toolbar asks to verify and offers Resend. */
export const UnverifiedEmail: Story = {
  parameters: { nextjs: { navigation: { pathname: '/' } } },
  decorators: [
    (Story) => {
      seedMe(meUnverified)
      return <Story />
    },
  ],
  render: () => <Header />,
}

/** Unread messages: the Messages link carries a count badge and a spoken count. */
export const UnreadMessages: Story = {
  parameters: { nextjs: { navigation: { pathname: '/' } } },
  decorators: [
    (Story) => {
      seedMe(meWorker)
      return (
        <MessagesContext.Provider value={messagesValue({ unreadCount: 3 })}>
          <Story />
        </MessagesContext.Provider>
      )
    },
  ],
  render: () => <Header />,
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('link', { name: 'Messages, 3 unread' }),
    ).toBeVisible()
  },
}

/** Many unread messages: the badge caps at 99+ while the spoken count stays exact. */
export const UnreadMessagesOver99: Story = {
  parameters: { nextjs: { navigation: { pathname: '/' } } },
  decorators: [
    (Story) => {
      seedMe(meWorker)
      return (
        <MessagesContext.Provider value={messagesValue({ unreadCount: 120 })}>
          <Story />
        </MessagesContext.Provider>
      )
    },
  ],
  render: () => <Header />,
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', {
      name: 'Messages, 120 unread',
    })
    await expect(link).toHaveTextContent('99+')
  },
}

/** Active link: on /tasks the My tasks link is highlighted and marked as the current page. */
export const ActiveNavLink: Story = {
  parameters: { nextjs: { navigation: { pathname: '/tasks' } } },
  decorators: [
    (Story) => {
      seedMe(meWorker)
      return <Story />
    },
  ],
  render: () => <Header />,
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('link', { name: 'My tasks' }),
    ).toHaveAttribute('aria-current', 'page')
  },
}

/** Account menu open: the avatar button opens the account panel under the toolbar. */
export const AccountMenuOpen: Story = {
  parameters: { nextjs: { navigation: { pathname: '/' } } },
  decorators: [
    (Story) => {
      seedMe(meWorker)
      return (
        <Box minH="1000px">
          <Story />
        </Box>
      )
    },
  ],
  render: () => <Header />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Account menu' }))
    await waitFor(
      () =>
        expect(canvas.getByRole('button', { name: 'Log out' })).toBeVisible(),
      { timeout: 3000 },
    )
  },
}

/** Phone: the toolbar is hidden below `lg`; only status banners (here: verify email) remain. */
export const MobileBannersOnly: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  parameters: { nextjs: { navigation: { pathname: '/' } } },
  decorators: [
    (Story) => {
      seedMe(meUnverified)
      return <Story />
    },
  ],
  render: () => <Header />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByText('Verify your email to post tasks and send quotes.'),
    ).toBeVisible()
    await expect(canvas.queryByRole('link', { name: 'Workers' })).toBeNull()
  },
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

/** Overview: shell and toolbar slots with custom children, so each row is deterministic. */
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
