import {
  Currency,
  LoginMethod,
  UserLanguage,
  WorkerPrimaryCategory,
  WorkerSubscriptionStatus,
} from '@codegen/schema'

import type { MeSnapshot } from '../store/user'

export type StoryWorker = NonNullable<MeSnapshot['worker']>
export type StoryMembership = StoryWorker['membership']

/** Inline SVG avatar, so a story never loads a remote image. */
export function storyAvatarUrl(initials: string, fill = '#2f7d5b'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="${fill}"/><text x="64" y="64" dy=".35em" text-anchor="middle" font-family="sans-serif" font-size="52" font-weight="600" fill="#ffffff">${initials}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/**
 * An ISO time `minutes` ago, so "2h ago" style copy reads the same any day.
 * Half a minute is added so the label survives the time a test run takes.
 */
export function storyMinutesAgo(minutes: number): string {
  return new Date(Date.now() - (minutes * 60 + 30) * 1000).toISOString()
}

export type StoryMembershipKind =
  | 'free'
  | 'freeLimitReached'
  | 'trial'
  | 'trialCancelling'
  | 'active'
  | 'activeCancelling'
  | 'pastDue'
  | 'unpaid'
  | 'canceled'

const UNLIMITED = {
  planName: 'Slashie Unlimited',
  hasUnlimitedQuotes: true,
  freeQuotesPerMonth: 3,
  canStartTrial: false,
  canUpgrade: false,
  canManageBilling: true,
} as const

const FREE = {
  planName: 'Free',
  hasUnlimitedQuotes: false,
  cancelAtPeriodEnd: false,
  canceledAt: null,
  freeQuotesPerMonth: 3,
  trialEndsAt: null,
  currentPeriodEnd: '2026-11-01T12:00:00.000Z',
  canManageBilling: false,
  canUpgrade: true,
} as const

/** Membership snapshots, one per plan state the dashboard can show. */
export function storyMembership(
  kind: StoryMembershipKind,
  overrides: Partial<StoryMembership> = {},
): StoryMembership {
  const byKind: Record<StoryMembershipKind, StoryMembership> = {
    free: {
      ...FREE,
      statusLabel: 'Free',
      statusDescription: null,
      subscriptionStatus: WorkerSubscriptionStatus.None,
      quotesUsedThisMonth: 1,
      quotesRemainingThisMonth: 2,
      canStartTrial: true,
    },
    freeLimitReached: {
      ...FREE,
      statusLabel: 'Free',
      statusDescription: null,
      subscriptionStatus: WorkerSubscriptionStatus.None,
      quotesUsedThisMonth: 3,
      quotesRemainingThisMonth: 0,
      canStartTrial: true,
    },
    trial: {
      ...UNLIMITED,
      statusLabel: 'Trial',
      statusDescription: null,
      subscriptionStatus: WorkerSubscriptionStatus.Trialing,
      cancelAtPeriodEnd: false,
      canceledAt: null,
      quotesUsedThisMonth: 0,
      quotesRemainingThisMonth: 3,
      trialEndsAt: '2026-12-09T12:00:00.000Z',
      currentPeriodEnd: '2026-12-09T12:00:00.000Z',
    },
    trialCancelling: {
      ...UNLIMITED,
      statusLabel: 'Trial, cancelling',
      statusDescription: null,
      subscriptionStatus: WorkerSubscriptionStatus.Trialing,
      cancelAtPeriodEnd: true,
      canceledAt: null,
      quotesUsedThisMonth: 0,
      quotesRemainingThisMonth: 3,
      trialEndsAt: '2026-12-09T12:00:00.000Z',
      currentPeriodEnd: '2026-12-09T12:00:00.000Z',
    },
    active: {
      ...UNLIMITED,
      statusLabel: 'Active',
      statusDescription: null,
      subscriptionStatus: WorkerSubscriptionStatus.Active,
      cancelAtPeriodEnd: false,
      canceledAt: null,
      quotesUsedThisMonth: 4,
      quotesRemainingThisMonth: 0,
      trialEndsAt: null,
      currentPeriodEnd: '2027-01-09T12:00:00.000Z',
    },
    activeCancelling: {
      ...UNLIMITED,
      statusLabel: 'Cancelling',
      statusDescription: null,
      subscriptionStatus: WorkerSubscriptionStatus.Active,
      cancelAtPeriodEnd: true,
      canceledAt: null,
      quotesUsedThisMonth: 4,
      quotesRemainingThisMonth: 0,
      trialEndsAt: null,
      currentPeriodEnd: '2027-01-09T12:00:00.000Z',
    },
    pastDue: {
      ...UNLIMITED,
      statusLabel: 'Payment issue',
      statusDescription: null,
      subscriptionStatus: WorkerSubscriptionStatus.PastDue,
      hasUnlimitedQuotes: false,
      cancelAtPeriodEnd: false,
      canceledAt: null,
      quotesUsedThisMonth: 3,
      quotesRemainingThisMonth: 0,
      trialEndsAt: null,
      currentPeriodEnd: '2027-01-09T12:00:00.000Z',
    },
    unpaid: {
      ...UNLIMITED,
      statusLabel: 'Unpaid',
      statusDescription: null,
      subscriptionStatus: WorkerSubscriptionStatus.Unpaid,
      hasUnlimitedQuotes: false,
      cancelAtPeriodEnd: false,
      canceledAt: null,
      quotesUsedThisMonth: 3,
      quotesRemainingThisMonth: 0,
      trialEndsAt: null,
      currentPeriodEnd: '2027-01-09T12:00:00.000Z',
    },
    canceled: {
      ...FREE,
      statusLabel: 'Ended',
      statusDescription: null,
      subscriptionStatus: WorkerSubscriptionStatus.Canceled,
      canceledAt: '2026-09-20T12:00:00.000Z',
      quotesUsedThisMonth: 1,
      quotesRemainingThisMonth: 2,
      canStartTrial: false,
    },
  }
  return { ...byKind[kind], ...overrides }
}

/** A published worker profile; override fields for drafts and edge cases. */
export function storyWorker(overrides: Partial<StoryWorker> = {}): StoryWorker {
  return {
    id: 'worker-story',
    legalName: 'Sam Carter',
    bio: 'Reliable local handyman with experience in flat-pack assembly, mounting and everyday home repairs.',
    tagline: 'Reliable handyman and flat-pack expert',
    primaryCategory: WorkerPrimaryCategory.Handyman,
    yearsExperience: 6,
    skills: ['Handyman', 'Furniture assembly', 'Flat-pack expert'],
    qualifications: [],
    travelRadiusMiles: 10,
    portfolioUrls: [],
    isVerified: false,
    locationAddress: 'Watford',
    locationLat: 51.6565,
    locationLng: -0.3903,
    preferredLocation: {
      address: 'Watford',
      lat: 51.6565,
      lng: -0.3903,
      name: 'Watford',
    },
    setupProgress: {
      currentSubStep: 'review.submit',
      completedSubSteps: [
        'profile.details',
        'profile.bio',
        'services.skills',
        'services.experience',
      ],
      isComplete: true,
    },
    membership: storyMembership('free'),
    earnings: { pending: { amount: 0, currency: Currency.Gbp } },
    ...overrides,
  }
}

/** A worker row whose setup is not finished: a private draft. */
export function storyWorkerDraft(
  overrides: Partial<StoryWorker> = {},
): StoryWorker {
  return storyWorker({
    tagline: null,
    portfolioUrls: [],
    setupProgress: {
      currentSubStep: 'services.skills',
      completedSubSteps: ['profile.details', 'profile.bio'],
      isComplete: false,
    },
    ...overrides,
  })
}

type StoryMeOverrides = Partial<Omit<MeSnapshot, 'profile' | 'settings'>> & {
  profile?: Partial<MeSnapshot['profile']>
  settings?: Partial<MeSnapshot['settings']>
}

/**
 * A signed-in customer: verified email, no phone, no worker profile. Pass
 * `worker: storyWorker()` for a worker. `profile.*Verified` follows the
 * top-level flags unless overridden.
 */
export function storyMe(overrides: StoryMeOverrides = {}): MeSnapshot {
  const { profile, settings, ...rest } = overrides
  const emailVerified = rest.emailVerified ?? true
  const phoneVerified = rest.phoneVerified ?? false
  return {
    id: 'user-story',
    email: 'sam.carter@example.com',
    disabled: false,
    emailVerified,
    phoneVerified,
    phoneVerifiedAt: phoneVerified ? '2026-06-08T12:00:00.000Z' : null,
    pendingEmail: null,
    pendingPhone: null,
    createdAt: '2026-06-01T12:00:00.000Z',
    deletionScheduledFor: null,
    enabledLoginMethods: [LoginMethod.Password],
    workerEligibility: Boolean(rest.worker),
    worker: null,
    ...rest,
    profile: {
      name: 'Sam Carter',
      contactNumber: null,
      avatarUrl: null,
      dateOfBirth: null,
      defaultPreferredContactMethod: null,
      emailVerified,
      phoneVerified,
      ...profile,
    },
    settings: {
      isProfilePrivate: false,
      language: UserLanguage.En,
      marketingEmails: false,
      ...settings,
    },
  }
}

/** A worker who finished setup and verified their phone. */
export function storyWorkerMe(overrides: StoryMeOverrides = {}): MeSnapshot {
  const { profile, ...rest } = overrides
  return storyMe({
    phoneVerified: true,
    worker: storyWorker(),
    ...rest,
    profile: { contactNumber: '+447700900123', ...profile },
  })
}
