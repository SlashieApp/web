import {
  Currency,
  LoginMethod,
  UserLanguage,
  WorkerPublishState,
  WorkerSubscriptionStatus,
} from '@codegen/schema'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { type MeSnapshot, useUserStore } from '@/app/(auth)/store/user'
import { phone390 } from '@/app/(dashboard)/components/ui/dialogSpacing.testing'
import { formSpace } from '@/theme/styles'
import { gapBelow } from '@/ui/FormField/formGap.testing'

import { Button } from '../../Button/Button'
import { FeedbackDialogProvider } from '../../FeedbackDialog/FeedbackDialogProvider'
import { MobileNavDrawer, type MobileNavDrawerProps } from './MobileNavDrawer'

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

/** Signed-in fixture. A `null` membership means a customer with no worker profile. */
function buildMe({
  name = 'Sam Carter',
  email = 'sam@example.com',
  membership = trial,
}: {
  name?: string
  email?: string
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

/** The drawer with a button that opens it, so it can be closed and reopened. */
function DrawerHarness({
  startOpen,
  onOpenChange,
  ...args
}: MobileNavDrawerProps & { startOpen: boolean }) {
  const [open, setOpen] = useState(startOpen)
  return (
    <>
      <Button type="button" m={4} onClick={() => setOpen(true)}>
        Open account menu
      </Button>
      <MobileNavDrawer
        {...args}
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          onOpenChange(next)
        }}
      />
    </>
  )
}

const meta = {
  title: 'Shell/Header/MobileNavDrawer',
  component: MobileNavDrawer,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  args: { open: true, onOpenChange: fn(), onOpenLanguage: fn() },
  decorators: [
    (Story) => (
      <FeedbackDialogProvider onSubmit={async () => true}>
        <Story />
      </FeedbackDialogProvider>
    ),
  ],
  render: (args) => <DrawerHarness {...args} startOpen={args.open} />,
} satisfies Meta<typeof MobileNavDrawer>

export default meta
type Story = StoryObj<typeof meta>

/** Left edge of the text inside `element` (its box has padding of its own). */
const textLeft = (element: Element) => {
  const range = document.createRange()
  range.selectNodeContents(element)
  return range.getBoundingClientRect().left
}

/** Open, worker on trial: full-height account drawer with unlimited-quotes header and links. The labels start on the title's left edge, Button rows (Language) and link rows (About) alike. */
export const OpenWorkerOnTrial: Story = {
  decorators: [withMe(meTrial)],
  play: async ({ canvasElement }) => {
    const drawer = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog',
      { name: 'Account menu' },
    )
    const title = within(drawer).getByRole('heading', { name: 'Account menu' })
    const rows = [
      within(drawer).getByRole('link', { name: 'Search' }),
      within(drawer).getByRole('link', { name: 'About' }),
      within(drawer).getByRole('button', { name: 'Language' }),
      within(drawer).getByRole('button', { name: 'Send feedback' }),
    ]
    for (const row of rows) {
      expect(Math.abs(textLeft(row) - textLeft(title))).toBeLessThanOrEqual(0.5)
    }
  },
}

/**
 * The phone account menu on the form spacing (FE-481 menus), at 390: the first
 * visible thing of the header block (the avatar, and the name beside it) is 24
 * under the title, measured to the visible edge and not to the block's padding,
 * the block is 24 above the first row, the avatar sits on the title's left
 * edge, and the groups of rows keep their rules.
 */
export const OpenSpacing390: Story = {
  ...phone390,
  decorators: [withMe(meTrial)],
  play: async ({ canvasElement }) => {
    const drawer = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog',
      { name: 'Account menu' },
    )
    const title = within(drawer).getByRole('heading', { name: 'Account menu' })
    const header = drawer.querySelector('[data-menu-header]') as HTMLElement
    const link = within(drawer).getByRole('link', { name: 'View profile' })
    const first = within(drawer).getByRole('link', { name: 'Search' })
    const avatar = header.firstElementChild as HTMLElement
    const name = within(header).getByText('Sam Carter')
    // The visible edge: the avatar and the name, not the block's padded box.
    await waitFor(() =>
      expect(gapBelow(title, avatar)).toBe(formSpace.headerToBody),
    )
    await expect(gapBelow(title, name)).toBe(formSpace.headerToBody)
    // No top inset in the drawer: the block starts where the avatar does.
    await expect(getComputedStyle(header).paddingTop).toBe('0px')
    await expect(gapBelow(title, header)).toBe(formSpace.headerToBody)
    await expect(gapBelow(link, first)).toBe(formSpace.headerToBody)
    // The avatar (inset 12 in its block, which is pulled out 12) and the labels start where the title does.
    await expect(
      Math.abs(avatar.getBoundingClientRect().left - textLeft(title)),
    ).toBeLessThanOrEqual(0.5)
    await expect(
      Math.abs(textLeft(first) - textLeft(title)),
    ).toBeLessThanOrEqual(0.5)
  },
}

/** Open, free plan: the header shows the quote-usage meter and Upgrade. */
export const OpenWorkerFreePlan: Story = {
  decorators: [withMe(meFree)],
}

/** Open, customer: no worker profile, so the upsell card and "Become a worker" show. */
export const OpenCustomer: Story = {
  decorators: [withMe(meCustomer)],
}

/** Open, long text: a long name and email truncate instead of wrapping. */
export const OpenLongNameAndEmail: Story = {
  decorators: [withMe(meLongText)],
}

/** Closed: only the trigger button is on screen, the drawer is not mounted. */
export const Closed: Story = {
  args: { open: false },
  decorators: [withMe(meTrial)],
}

/** Opening: the trigger button slides the account drawer in. */
export const OpensFromTrigger: Story = {
  args: { open: false },
  decorators: [withMe(meTrial)],
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Open account menu' }),
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

/** Closing: the close button reports `onOpenChange(false)` and dismisses the drawer. */
export const ClosesFromCloseButton: Story = {
  decorators: [withMe(meTrial)],
  play: async ({ args, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body)
    const drawer = within(
      await body.findByRole('dialog', { name: 'Account menu' }),
    )
    await userEvent.click(drawer.getByRole('button', { name: 'Close' }))
    await expect(args.onOpenChange).toHaveBeenCalledWith(false)
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull(), {
      timeout: 3000,
    })
  },
}

/** Language: the Language row hands over to `onOpenLanguage` and closes the drawer. */
export const LanguageRowCallsHandler: Story = {
  decorators: [withMe(meTrial)],
  play: async ({ args, canvasElement }) => {
    const drawer = within(
      await within(canvasElement.ownerDocument.body).findByRole('dialog', {
        name: 'Account menu',
      }),
    )
    await userEvent.click(drawer.getByRole('button', { name: 'Language' }))
    await expect(args.onOpenLanguage).toHaveBeenCalledTimes(1)
    // The close lands once React has rendered the tap (no dialog opened here).
    await waitFor(() => expect(args.onOpenChange).toHaveBeenCalledWith(false))
  },
}
