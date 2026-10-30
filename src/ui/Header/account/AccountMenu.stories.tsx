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
import { desktop1280 } from '@/app/(stepflow)/stepFlowSpacing.testing'
import {
  expectPanelPadding,
  panelOf,
  settled,
} from '@/ui/Dropdown/menuSpacing.testing'

import { FeedbackDialogProvider } from '../../FeedbackDialog/FeedbackDialogProvider'
import { AccountMenu, type AccountMenuProps } from './AccountMenu'

type Membership = NonNullable<MeSnapshot['worker']>['membership']

/** Worker on the 6-month trial: unlimited quotes. */
const trial: Membership = {
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
}

/** Worker on the free plan: capped quotes, upgrade offered. */
const free: Membership = {
  ...trial,
  planName: 'Free',
  statusLabel: 'Free',
  statusDescription: null,
  subscriptionStatus: WorkerSubscriptionStatus.None,
  hasUnlimitedQuotes: false,
  quotesUsedThisMonth: 2,
  quotesRemainingThisMonth: 1,
  trialEndsAt: null,
  canManageBilling: false,
  canUpgrade: true,
}

/** Fictional profile photo as a data URI, so stories never fetch remote images. */
const PROFILE_PHOTO = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="#e6e9f5"/><circle cx="60" cy="46" r="20" fill="#5b6bb5"/><path d="M20 112c4-26 22-36 40-36s36 10 40 36z" fill="#5b6bb5"/></svg>',
)}`

/** Signed-in fixture. A `null` membership means a customer with no worker profile. */
function buildMe({
  name = 'Sam Carter',
  email = 'sam@example.com',
  avatarUrl = null,
  membership = trial,
}: {
  name?: string
  email?: string
  avatarUrl?: string | null
  membership?: Membership | null
} = {}): MeSnapshot {
  return {
    id: 'user-1',
    email,
    emailVerified: true,
    phoneVerified: true,
    phoneVerifiedAt: '2024-06-01T00:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    disabled: false,
    enabledLoginMethods: [LoginMethod.Password],
    deletionBlockers: [],
    savedWorkers: [],
    profile: {
      name,
      contactNumber: '+447700900123',
      avatarUrl,
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
    workerEligibility: membership !== null,
    worker: membership && {
      id: 'worker-1',
      legalName: name,
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
      membership,
      earnings: { pending: { amount: 120, currency: Currency.Gbp } },
    },
  }
}

const meTrial = buildMe()
const meFree = buildMe({ membership: free })
const meCustomer = buildMe({ membership: null })
const meWithPhoto = buildMe({ avatarUrl: PROFILE_PHOTO })
const meLongText = buildMe({
  name: 'Alexandria Montgomery-Featherstonehaugh',
  email:
    'alexandria.montgomery-featherstonehaugh@a-very-long-company-domain.example.com',
})

/** Seeds the auth store before the story renders (no live API is called). */
const withMe =
  (me: MeSnapshot): Decorator =>
  (Story) => {
    if (useUserStore.getState().me !== me) {
      useUserStore.setState({
        user: { id: me.id, email: me.email, createdAt: me.createdAt },
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

/** Right-aligned like the header toolbar. */
function ClosedSlot(args: AccountMenuProps) {
  return (
    <Box display="flex" justifyContent="flex-end" p={6}>
      <AccountMenu {...args} />
    </Box>
  )
}

/** Same slot with room below, so the open panel is not clipped. */
function OpenSlot(args: AccountMenuProps) {
  return (
    <Box display="flex" justifyContent="flex-end" p={6} minH="1000px">
      <AccountMenu {...args} />
    </Box>
  )
}

/**
 * Opens the panel with a click. `initialOpen` is not used: the dropdown starts
 * in its phone (drawer) mode, then closes itself once the desktop breakpoint
 * resolves, so it never stays open on mount.
 */
async function openMenu(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  await userEvent.click(canvas.getByRole('button', { name: 'Account menu' }))
  await waitFor(
    () => expect(canvas.getByRole('button', { name: 'Log out' })).toBeVisible(),
    { timeout: 3000 },
  )
  return canvas
}

const meta = {
  title: 'Shell/Header/AccountMenu',
  component: AccountMenu,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  // `initialOpen` never stays open on desktop (see `openMenu`), so no control.
  argTypes: { initialOpen: { control: false } },
  args: { initialOpen: false },
  decorators: [
    (Story) => (
      <ApolloProvider client={neverClient}>
        <FeedbackDialogProvider onSubmit={async () => true}>
          <Story />
        </FeedbackDialogProvider>
      </ApolloProvider>
    ),
  ],
  render: (args) => <ClosedSlot {...args} />,
} satisfies Meta<typeof AccountMenu>

export default meta
type Story = StoryObj<typeof meta>

/** Closed: only the avatar button of a signed-in worker is shown. */
export const Closed: Story = {
  decorators: [withMe(meTrial)],
}

/** Open: the panel for a worker on trial (unlimited quotes, billing, all links). */
export const Open: Story = {
  decorators: [withMe(meTrial)],
  render: (args) => <OpenSlot {...args} />,
  play: async ({ canvasElement }) => {
    await openMenu(canvasElement)
  },
}

/**
 * The popover's frame (FE-481 menus): the panel pads its content 8 on every
 * side, the header and the groups of rows are inside that, and the rows are
 * the rows they were.
 */
export const OpenSpacing: Story = {
  ...desktop1280,
  decorators: [withMe(meTrial)],
  render: (args) => <OpenSlot {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = await openMenu(canvasElement)
    const panel = panelOf(canvas.getByRole('button', { name: 'Account menu' }))
    await settled(panel)
    await expectPanelPadding(panel)
    // Every row keeps the 44px target it had (the header's own link is not a row).
    const rows = canvas
      .getAllByRole('link')
      .filter((row) => row.textContent !== 'View profile')
    await expect(rows.length).toBeGreaterThan(5)
    for (const row of rows) {
      await expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(
        44,
      )
    }
  },
}

/**
 * A laptop window (1366 by 768) is shorter than the worker's menu (about 800),
 * and the header it hangs from is sticky: the panel stops short of the bottom
 * of the window and scrolls inside, so Log out can still be reached.
 */
export const OpenShortWindowScrolls: Story = {
  parameters: {
    viewport: {
      options: {
        laptop768: {
          name: 'Laptop 1366 by 768',
          styles: { width: '1366px', height: '768px' },
          type: 'desktop',
        },
      },
    },
  },
  globals: { viewport: { value: 'laptop768', isRotated: false } },
  decorators: [withMe(meTrial)],
  render: (args) => <OpenSlot {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = await openMenu(canvasElement)
    const panel = panelOf(canvas.getByRole('button', { name: 'Account menu' }))
    await settled(panel)
    await expect(canvasElement.ownerDocument.defaultView?.innerHeight).toBe(768)

    // The panel ends inside the window, with air under it, and scrolls.
    await expect(panel.getBoundingClientRect().bottom).toBeLessThanOrEqual(756)
    await expect(panel.scrollHeight).toBeGreaterThan(panel.clientHeight)
    await expect(getComputedStyle(panel).overflowY).toBe('auto')

    // The last row is reachable: scrolled to the end it is inside the panel.
    const logOut = canvas.getByRole('button', { name: 'Log out' })
    panel.scrollTop = panel.scrollHeight
    await waitFor(() =>
      expect(logOut.getBoundingClientRect().bottom).toBeLessThanOrEqual(
        panel.getBoundingClientRect().bottom,
      ),
    )
  },
}

/** Open, free plan: the menu links to Plan & billing; the quote meter lives on that page. */
export const OpenWorkerFreePlan: Story = {
  decorators: [withMe(meFree)],
  render: (args) => <OpenSlot {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = await openMenu(canvasElement)
    await expect(
      canvas.getByRole('link', { name: 'Plan & billing' }),
    ).toBeVisible()
    await expect(canvas.queryByText('Tasks quoted this month')).toBeNull()
  },
}

/** Open, customer: no worker profile, so Become a worker replaces Plan & billing. */
export const OpenCustomer: Story = {
  decorators: [withMe(meCustomer)],
  render: (args) => <OpenSlot {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = await openMenu(canvasElement)
    await expect(
      canvas.getByRole('link', { name: 'Become a worker' }),
    ).toBeVisible()
    await expect(
      canvas.queryByRole('link', { name: 'Plan & billing' }),
    ).toBeNull()
  },
}

/** Open, long text: a long name and email truncate inside the 300px panel. */
export const OpenLongNameAndEmail: Story = {
  decorators: [withMe(meLongText)],
  render: (args) => <OpenSlot {...args} />,
  play: async ({ canvasElement }) => {
    await openMenu(canvasElement)
  },
}

/** Profile photo: the avatar button shows the uploaded photo instead of the icon. */
export const WithProfilePhoto: Story = {
  decorators: [withMe(meWithPhoto)],
}

/** Language: the Language row closes the panel and opens the full-page locale list. */
export const LanguageListOpen: Story = {
  decorators: [withMe(meTrial)],
  play: async ({ canvasElement }) => {
    const canvas = await openMenu(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Language' }))
    await waitFor(
      () =>
        expect(
          within(canvasElement.ownerDocument.body).getByRole('dialog', {
            name: 'Language',
          }),
        ).toBeVisible(),
      { timeout: 3000 },
    )
  },
}

/** Feedback: the Send feedback row closes the panel and opens the feedback dialog. */
export const FeedbackDialogOpen: Story = {
  decorators: [withMe(meTrial)],
  play: async ({ canvasElement }) => {
    const canvas = await openMenu(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Send feedback' }))
    await waitFor(
      () =>
        expect(
          within(canvasElement.ownerDocument.body).getByRole('dialog', {
            name: 'Send feedback',
          }),
        ).toBeVisible(),
      { timeout: 3000 },
    )
  },
}

/** Phone: the desktop menu is hidden below `lg`; the bottom bar's Account drawer replaces it. */
export const HiddenOnPhone: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  decorators: [withMe(meTrial)],
  render: (args) => (
    <Stack gap={3} p={4}>
      <Text fontSize="sm" color="text.muted">
        Below lg the account menu is not rendered. Phones use the Account item
        in the bottom bar, which opens MobileNavDrawer.
      </Text>
      <AccountMenu {...args} />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByRole('button', { name: 'Account menu' }),
    ).toBeNull()
  },
}
