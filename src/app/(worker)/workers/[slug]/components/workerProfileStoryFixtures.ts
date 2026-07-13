import {
  IdentityVerificationStatus,
  WorkerPrimaryCategory,
} from '@codegen/schema'

import type { WorkerPublicRecord } from '../helpers/workerProfileHelpers'

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
  averageResponseTime: 'under 2 hours',
  tasksCompletedCount: 2,
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
  qualifications: ['City & Guilds', 'Fully Insured'],
  portfolioUrls: [],
  serviceAreaLabel: 'Camden & Islington (~5 miles)',
  serviceArea: { label: 'Camden & Islington', radiusMiles: 5 },
  preferredLocation: { name: 'Camden & Islington' },
  ratingSummary: { average: 5, count: 1 },
  completedJobs: [
    {
      taskId: 'task-1',
      title: 'IKEA wardrobe assembly',
      category: 'Handyman',
      areaLabel: 'Camden, London',
      completedAt: '2026-03-14T10:00:00.000Z',
      rating: 5,
    },
    {
      taskId: 'task-2',
      title: 'Kitchen tap repair',
      category: 'Plumbing',
      areaLabel: 'Islington, London',
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
