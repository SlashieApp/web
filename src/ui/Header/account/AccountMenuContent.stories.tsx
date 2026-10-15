import { Box } from '@chakra-ui/react'
import {
  Currency,
  LoginMethod,
  UserLanguage,
  WorkerSubscriptionStatus,
} from '@codegen/schema'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import type { ComponentType } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'

import { type MeSnapshot, useUserStore } from '@/app/(auth)/store/user'

import { FeedbackDialogProvider } from '../../FeedbackDialog/FeedbackDialogProvider'
import { AccountMenuContent } from './AccountMenuContent'

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
const meAdmin = buildMe({ email: 'story.admin@slashie.app' })
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

/** The props type is not exported and the argument is optional, so derive it. */
type AccountMenuContentProps = NonNullable<
  Parameters<typeof AccountMenuContent>[0]
>

const meta = {
  title: 'Shell/Header/AccountMenuContent',
  component: AccountMenuContent as ComponentType<AccountMenuContentProps>,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { onClose: fn(), onOpenLanguage: fn() },
  // Sized like the desktop account popover; the provider lets "Send feedback" open its dialog.
  decorators: [
    (Story) => (
      <FeedbackDialogProvider onSubmit={async () => true}>
        <Box
          w="300px"
          p={1}
          bg="bg.surface"
          borderWidth="1px"
          borderColor="border.default"
          borderRadius="lg"
          boxShadow="e3"
        >
          <Story />
        </Box>
      </FeedbackDialogProvider>
    ),
  ],
} satisfies Meta<AccountMenuContentProps>

export default meta
type Story = StoryObj<typeof meta>

/** Worker on trial: unlimited-quotes header, then main, worker and account links. */
export const WorkerOnTrial: Story = {
  decorators: [withMe(meTrial)],
}

/** Worker on the free plan: the header shows the quote-usage meter and Upgrade. */
export const WorkerOnFreePlan: Story = {
  decorators: [withMe(meFree)],
}

/** Customer: the header pitches posting for free, and "Become a worker" is in the list. */
export const Customer: Story = {
  decorators: [withMe(meCustomer)],
}

/** Admin: a Slashie team email also gets the "Send an announcement" link. */
export const Admin: Story = {
  decorators: [withMe(meAdmin)],
}

/** Long text: a long name and email truncate with an ellipsis instead of wrapping. */
export const LongNameAndEmail: Story = {
  decorators: [withMe(meLongText)],
}

/** Language: the Language row opens the locale list through `onOpenLanguage` and closes. */
export const LanguageRowCallsHandler: Story = {
  decorators: [withMe(meTrial)],
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Language' }),
    )
    await expect(args.onOpenLanguage).toHaveBeenCalledTimes(1)
    await expect(args.onClose).toHaveBeenCalledTimes(1)
  },
}
