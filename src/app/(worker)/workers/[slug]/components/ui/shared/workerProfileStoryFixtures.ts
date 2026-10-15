import {
  IdentityVerificationStatus,
  WorkerContactAction,
  WorkerPrimaryCategory,
} from '@codegen/schema'

import type { WorkerPublicRecord } from '../../../helpers/workerProfileHelpers'

/**
 * Offline stand-in for a photo (inline SVG), so stories never fetch images.
 * `hue` (0-359) tints it so a gallery of them reads as different pictures.
 */
export function storyPhoto(hue: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 55% 72%)"/><stop offset="1" stop-color="hsl(${(hue + 40) % 360} 60% 42%)"/></linearGradient></defs><rect width="640" height="480" fill="url(#g)"/><circle cx="470" cy="150" r="64" fill="white" fill-opacity=".35"/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/** James Thornton sample from the approved v2 mockup (Storybook only). */
export const workerProfileFixture: WorkerPublicRecord = {
  id: 'worker-james-thornton',
  bio: 'Hi, I’m James. I’m a reliable and friendly handyman based in North London.\nI specialise in furniture assembly and general DIY jobs around the home.\nI take pride in quality workmanship and always aim to leave every job clean, tidy and stress-free.',
  tagline: 'Reliable, on-time local help across North London',
  isVerified: true,
  identityVerification: IdentityVerificationStatus.Verified,
  phoneVerified: true,
  emailVerified: true,
  yearsExperience: 3,
  quotesSentCount: 12,
  memberSince: '2026-06-05T10:00:00.000Z',
  legalName: 'James Thornton',
  primaryCategory: WorkerPrimaryCategory.Handyman,
  skills: [
    'Assembly',
    'Handyman',
    'Flat-pack',
    'Painting',
    'Mounting',
    'Repairs',
  ],
  qualifications: ['City & Guilds', 'NICEIC'],
  portfolioUrls: [],
  serviceAreaLabel: 'Camden & Islington (~5 miles)',
  serviceArea: { label: 'Camden & Islington', radiusMiles: 5 },
  preferredLocation: { name: 'Camden & Islington' },
  ratingSummary: { average: 4.8, count: 4 },
  completedJobs: [
    {
      taskId: 'task-1',
      title: 'IKEA wardrobe assembly',
      categories: ['Handyman'],
      areaLabel: 'Camden',
      completedAt: '2026-03-14T10:00:00.000Z',
      rating: 5,
    },
    {
      taskId: 'task-2',
      title: 'Kitchen tap repair',
      categories: ['Plumbing'],
      areaLabel: 'Islington',
      completedAt: '2026-01-20T10:00:00.000Z',
      rating: null,
    },
  ],
  viewer: null,
  user: {
    id: 'user-james',
    createdAt: '2026-06-05T10:00:00.000Z',
  },
  profile: {
    avatarUrl: null,
    name: 'James Thornton',
  },
}

type WorkerViewer = NonNullable<WorkerPublicRecord['viewer']>

/** A signed-in viewer's relationship to the worker (`viewer` is null when signed out). */
export function workerViewer(
  contactAction: WorkerContactAction,
  overrides: Partial<WorkerViewer> = {},
): WorkerViewer {
  return {
    isSaved: false,
    canLeaveReview: false,
    contactAction,
    relatedTaskId: null,
    relatedQuoteId: null,
    ...overrides,
  }
}

/** The worker looking at their own profile (`contactAction: NONE` is the API's own-profile signal). */
export const ownWorkerProfileFixture: WorkerPublicRecord = {
  ...workerProfileFixture,
  viewer: workerViewer(WorkerContactAction.None),
}

/**
 * A brand-new worker: nothing verified, no bio, tagline, skills, jobs or
 * reviews. The area line falls back to `preferredLocation.name`.
 */
export const thinWorkerProfileFixture: WorkerPublicRecord = {
  ...workerProfileFixture,
  bio: null,
  isVerified: false,
  identityVerification: IdentityVerificationStatus.NotStarted,
  phoneVerified: false,
  emailVerified: false,
  tagline: null,
  skills: [],
  qualifications: [],
  yearsExperience: null,
  quotesSentCount: 0,
  serviceAreaLabel: null,
  serviceArea: { label: null, radiusMiles: null },
  ratingSummary: { average: null, count: 0 },
  completedJobs: [],
}

/** Long enough to trip the About collapse (220+ characters) and wrap on phones. */
export const LONG_WORKER_BIO = `${workerProfileFixture.bio}\nI also take on small repairs, shelving, curtain poles and TV mounting, and I am happy to quote for a whole afternoon of jobs in one visit. Evenings and weekends are usually fine; message me with a few photos and I will reply the same day.`
