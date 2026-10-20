import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client/core'
import { ApolloProvider } from '@apollo/client/react'
import { Box, Stack, Text } from '@chakra-ui/react'
import {
  Currency,
  LoginMethod,
  UserLanguage,
  WorkerPublishState,
  WorkerSubscriptionStatus,
} from '@codegen/schema'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { NEVER } from 'rxjs'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { type MeSnapshot, useUserStore } from '@/app/(auth)/store/user'
import { messagesValue } from '@/app/(messages)/messages/components/messagesStoryFixtures'
import { MessagesContext } from '@/app/(messages)/messages/context/MessagesProvider'

import { Card } from '../Card/Card'
import { FeedbackDialogProvider } from '../FeedbackDialog/FeedbackDialogProvider'
import { MobileBottomNav } from './MobileBottomNav'
import { MOBILE_BOTTOM_NAV_CLEARANCE } from './mobileBottomNavLayout'

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
  deletionBlockers: [],
  savedWorkers: [],
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
    publishState: WorkerPublishState.Published,
    profileGaps: [],
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

/** Seeds the auth store before the story renders (no live API is called). */
const withMe =
  (me: MeSnapshot | null): Decorator =>
  (Story) => {
    if (useUserStore.getState().me !== me) {
      useUserStore.setState({
        user: me && { id: me.id, email: me.email, createdAt: me.createdAt },
        me,
      })
    }
    return <Story />
  }

/** Story-only Apollo client: operations never resolve, so nothing reaches the live API. */
const neverClient = new ApolloClient({
  link: new ApolloLink(() => NEVER),
  cache: new InMemoryCache(),
})

/**
 * Mobile floating glass nav. Hidden from `lg` up (Header owns those links).
 * Scroll the sample cards to see the fade dissolve content behind the pill.
 */
const meta = {
  title: 'Shell/MobileBottomNav',
  component: MobileBottomNav,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      navigation: {
        pathname: '/search',
      },
    },
  },
  // Phone by default; `defaultViewport` is ignored by the Storybook UI.
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  // Guests by default; signed-in stories override the seed. The provider lets
  // the account drawer's "Send feedback" row work.
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
} satisfies Meta<typeof MobileBottomNav>

export default meta
type Story = StoryObj<typeof meta>

const SAMPLE_CARDS = [
  'Assemble IKEA shelves in a Mong Kok walk-up',
  'Weekend dog walk around Victoria Park',
  'Same-day grocery run to ParknShop',
  'Fix a leaking kitchen tap this evening',
  'Move two boxes from Central to Wan Chai',
  'Deep-clean a studio after checkout',
  'Hang a TV and hide the cables',
  'Pick up dry cleaning before 6pm',
  'Assemble a standing desk and chair',
  'Water plants while the owner is away',
  'Help carry luggage up four floors',
  'Replace a flickering hallway bulb',
] as const

/** An empty page behind the nav, for stories about the nav itself. */
function Screen({ children }: { children: React.ReactNode }) {
  return (
    <Box minH="100dvh" bg="bg.subtle" position="relative">
      {children}
    </Box>
  )
}

/** Guest on Search: Search is the active tab and Account links to log in. */
export const Default: Story = {
  render: () => (
    <Box minH="100dvh" bg="bg.subtle" position="relative">
      <Stack gap={3} px={4} pt={6} pb={MOBILE_BOTTOM_NAV_CLEARANCE}>
        <Text fontSize="sm" color="text.muted">
          Scroll the list: cards fade out behind the glass bar instead of
          clipping against a solid slab.
        </Text>
        {SAMPLE_CARDS.map((title, index) => (
          <Card key={title} layout="section" heading={title}>
            <Text fontSize="sm" color="text.muted">
              Sample row {index + 1}. Keep scrolling to send this card through
              the bottom fade.
            </Text>
          </Card>
        ))}
      </Stack>
      <MobileBottomNav />
    </Box>
  ),
}

/** Unread messages badge on the Messages item. */
export const WithUnread: Story = {
  render: () => (
    <MessagesContext.Provider value={messagesValue({ unreadCount: 3 })}>
      <Box minH="100dvh" bg="bg.subtle" position="relative">
        <MobileBottomNav />
      </Box>
    </MessagesContext.Provider>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('link', { name: 'Messages, 3 unread' }),
    ).toBeVisible()
  },
}

/** Many unread messages: the badge caps at 99+ while the spoken count stays exact. */
export const UnreadOver99: Story = {
  render: () => (
    <MessagesContext.Provider value={messagesValue({ unreadCount: 120 })}>
      <Screen>
        <MobileBottomNav />
      </Screen>
    </MessagesContext.Provider>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('link', { name: 'Messages, 120 unread' }),
    ).toHaveTextContent('99+')
  },
}

/** My tasks active: on /tasks the My tasks item turns green and is the current page. */
export const MyTasksActive: Story = {
  parameters: { nextjs: { navigation: { pathname: '/tasks' } } },
  render: () => (
    <Screen>
      <MobileBottomNav />
    </Screen>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('link', { name: 'My tasks' }),
    ).toHaveAttribute('aria-current', 'page')
  },
}

/** Post task active: on /tasks/create the raised Post task button is the current page. */
export const PostTaskActive: Story = {
  parameters: { nextjs: { navigation: { pathname: '/tasks/create' } } },
  render: () => (
    <Screen>
      <MobileBottomNav />
    </Screen>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('link', { name: 'Post task' }),
    ).toHaveAttribute('aria-current', 'page')
  },
}

/** Messages active: on /messages the Messages item turns green and is the current page. */
export const MessagesActive: Story = {
  parameters: { nextjs: { navigation: { pathname: '/messages' } } },
  render: () => (
    <Screen>
      <MobileBottomNav />
    </Screen>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('link', { name: 'Messages' }),
    ).toHaveAttribute('aria-current', 'page')
  },
}

/** Account active: on Plan & billing (like Profile and Account) the Account button is current. */
export const AccountActive: Story = {
  parameters: { nextjs: { navigation: { pathname: '/billing' } } },
  decorators: [withMe(meWorker)],
  render: () => (
    <Screen>
      <MobileBottomNav />
    </Screen>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: 'Account' }),
    ).toHaveAttribute('aria-current', 'page')
  },
}

/** Someone else's public profile: the Account button stays off. */
export const AccountOffOnPublicProfile: Story = {
  parameters: { nextjs: { navigation: { pathname: '/profile/user-2' } } },
  decorators: [withMe(meWorker)],
  render: () => (
    <Screen>
      <MobileBottomNav />
    </Screen>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: 'Account' }),
    ).not.toHaveAttribute('aria-current')
  },
}

/** Signed in: tapping Account opens the full-page account drawer instead of the login page. */
export const AccountDrawerOpen: Story = {
  decorators: [withMe(meWorker)],
  render: () => (
    <Screen>
      <MobileBottomNav />
    </Screen>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Account' }),
    )
    await waitFor(
      () =>
        expect(
          within(canvasElement.ownerDocument.body).getByRole('dialog', {
            name: 'Account menu',
          }),
        ).toBeVisible(),
      { timeout: 3000 },
    )
  },
}

/**
 * Taps an account drawer row that opens a dialog. The dialog outlives the
 * drawer's exit (closing the drawer used to dismiss it with it), and closing
 * the dialog then closes the drawer.
 */
async function rowDialogStaysOpen(
  canvasElement: HTMLElement,
  row: string,
  dialogName: string,
) {
  const page = within(canvasElement.ownerDocument.body)
  await userEvent.click(
    within(canvasElement).getByRole('button', { name: 'Account' }),
  )
  const drawer = within(
    await page.findByRole('dialog', { name: 'Account menu' }),
  )
  // The drawer hides the page one frame after opening. Tapping before that
  // lets the late hide cover the new dialog too, so wait for it.
  await waitFor(() =>
    expect(canvasElement.closest('[aria-hidden="true"]')).not.toBeNull(),
  )
  await userEvent.click(drawer.getByRole('button', { name: row }))
  await page.findByRole('dialog', { name: dialogName })
  // Past the drawer's 0.45 s exit, the dialog is still on screen.
  await new Promise((resolve) => setTimeout(resolve, 1000))
  const dialog = page.getByRole('dialog', { name: dialogName })
  await expect(dialog).toBeVisible()
  await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }))
  await waitFor(() => expect(page.queryByRole('dialog')).toBeNull(), {
    timeout: 3000,
  })
}

/** Language: the drawer's Language row opens the full-page locale list, which stays open until closed. */
export const LanguageListOpen: Story = {
  decorators: [withMe(meWorker)],
  render: () => (
    <Screen>
      <MobileBottomNav />
    </Screen>
  ),
  play: ({ canvasElement }) =>
    rowDialogStaysOpen(canvasElement, 'Language', 'Language'),
}

/** Feedback: the drawer's Send feedback row opens the feedback dialog, which stays open until closed. */
export const FeedbackDialogOpen: Story = {
  decorators: [withMe(meWorker)],
  render: () => (
    <Screen>
      <MobileBottomNav />
    </Screen>
  ),
  play: ({ canvasElement }) =>
    rowDialogStaysOpen(canvasElement, 'Send feedback', 'Send feedback'),
}

/** Desktop: from `lg` up the dock is not rendered; the Header carries these links. */
export const HiddenOnDesktop: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  render: () => (
    <Screen>
      <Text p={4} fontSize="sm" color="text.muted">
        At lg and up the bottom nav is not rendered. The Header shows these
        links instead.
      </Text>
      <MobileBottomNav />
    </Screen>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByRole('navigation', {
        name: 'Primary navigation',
      }),
    ).toBeNull()
  },
}
