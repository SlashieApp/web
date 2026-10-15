import { storyPhoto } from '../[slug]/components/ui/shared/workerProfileStoryFixtures'
import type { WorkerSearchItem } from '../helpers/workerSearchHelpers'

function storyWorker(
  id: string,
  name: string,
  overrides: Partial<WorkerSearchItem> = {},
): WorkerSearchItem {
  return {
    id,
    tagline: null,
    isVerified: false,
    yearsExperience: null,
    skills: [],
    serviceAreaLabel: null,
    ratingSummary: { average: null, count: 0 },
    serviceArea: { radiusMiles: null },
    preferredLocation: { name: null, lat: null, lng: null },
    user: { id: `user-${id}`, profile: { name, avatarUrl: null } },
    profile: { avatarUrl: null },
    ...overrides,
  }
}

/** A directory page: verified and unverified, with and without photo, rating and skills. */
export const storyWorkers: readonly WorkerSearchItem[] = [
  storyWorker('worker-1', 'Maya Okafor', {
    tagline: 'Flat-pack, shelving and mounting, tidy every time',
    isVerified: true,
    yearsExperience: 5,
    skills: ['Assembly', 'Mounting', 'Shelving', 'Painting', 'Repairs'],
    serviceAreaLabel: 'Camden & Islington (~5 miles)',
    ratingSummary: { average: 4.9, count: 128 },
    user: {
      id: 'user-worker-1',
      profile: { name: 'Maya Okafor', avatarUrl: storyPhoto(150) },
    },
  }),
  storyWorker('worker-2', 'Daniel Reyes', {
    tagline: 'Plumber, boiler checks and bathroom refits',
    isVerified: true,
    yearsExperience: 12,
    skills: ['Plumbing', 'Heating', 'Bathrooms'],
    serviceAreaLabel: 'Southwark & Lambeth (~8 miles)',
    ratingSummary: { average: 4.7, count: 41 },
  }),
  storyWorker('worker-3', 'Priya Anand', {
    tagline: 'Deep cleans and end-of-tenancy',
    yearsExperience: 2,
    skills: ['Cleaning'],
    serviceAreaLabel: 'Hackney (~3 miles)',
    ratingSummary: { average: null, count: 2 },
  }),
  storyWorker('worker-4', 'Tom Hargreaves', {
    isVerified: true,
    yearsExperience: 1,
    skills: ['Gardening', 'Fencing', 'Decking', 'Turfing'],
    ratingSummary: { average: null, count: 0 },
    user: {
      id: 'user-worker-4',
      profile: { name: 'Tom Hargreaves', avatarUrl: storyPhoto(30) },
    },
  }),
  storyWorker('worker-5', 'Sofia Lindqvist', {
    tagline: 'Electrician, rewires and smart home installs',
    isVerified: true,
    yearsExperience: 9,
    skills: ['Electrical', 'Lighting', 'Smart home'],
    serviceAreaLabel: 'Haringey (~6 miles)',
    ratingSummary: { average: 5, count: 17 },
    user: {
      id: 'user-worker-5',
      profile: { name: 'Sofia Lindqvist', avatarUrl: storyPhoto(280) },
    },
  }),
  storyWorker('worker-6', 'Kwame Mensah', {
    tagline: 'Removals and man-with-a-van',
    yearsExperience: 4,
    skills: ['Removals', 'Delivery'],
    serviceAreaLabel: 'Lewisham (~10 miles)',
    ratingSummary: { average: 4.4, count: 9 },
  }),
  storyWorker('worker-7', 'Hannah Whitfield', {
    tagline: 'Tutor for maths and physics, GCSE and A level',
    isVerified: true,
    yearsExperience: 7,
    skills: ['Maths', 'Physics', 'Exam prep'],
    serviceAreaLabel: 'Islington (~4 miles)',
    ratingSummary: { average: 4.8, count: 33 },
  }),
  storyWorker('worker-8', 'Omar Haddad', {
    tagline: 'Carpentry, built-in wardrobes and bespoke shelving',
    yearsExperience: 15,
    skills: ['Carpentry', 'Joinery', 'Wardrobes', 'Flooring'],
    serviceAreaLabel: 'Camden (~7 miles)',
    ratingSummary: { average: 4.6, count: 22 },
  }),
]
