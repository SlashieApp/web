import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import {
  ALL_STEPS_BUT_REVIEW,
  STORY_WORKER_AVATAR,
  completedWorkerSetupForm,
  withWorkerSetup,
  workerSetupStoryErrors,
  workerSetupStoryForm,
} from '../../workerSetupStoryFixtures'
import { WorkerSetupStepContent } from './WorkerSetupStepContent'

const meta: Meta<typeof WorkerSetupStepContent> = {
  title: 'Worker setup/WorkerSetupStepContent',
  component: WorkerSetupStepContent,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** Born ten years ago: under the 18 minimum. */
const UNDERAGE_DOB = `${new Date().getFullYear() - 10}-01-01`

/** profile.details: first and last name prefilled from the account. */
export const Details: Story = {
  decorators: [withWorkerSetup({ activeSubStep: 'profile.details' })],
}

/** profile.details on phones: the two name fields stack. */
export const DetailsMobile: Story = {
  decorators: [withWorkerSetup({ activeSubStep: 'profile.details' })],
  globals: { viewport: { value: 'mobile1' } },
}

/** profile.details: both names empty, so both are flagged as required. */
export const DetailsRequired: Story = {
  decorators: [
    withWorkerSetup({
      activeSubStep: 'profile.details',
      form: workerSetupStoryForm(),
      fieldErrors: workerSetupStoryErrors('profile.details'),
    }),
  ],
}

/** profile.photo: no photo yet, so the avatar shows the worker's initial. */
export const PhotoMissing: Story = {
  decorators: [withWorkerSetup({ activeSubStep: 'profile.photo' })],
}

/** profile.photo: photo uploaded and date of birth set, so "Change photo". */
export const PhotoAdded: Story = {
  decorators: [
    withWorkerSetup(
      {
        activeSubStep: 'profile.photo',
        form: workerSetupStoryForm({
          firstName: 'Sam',
          lastName: 'Taylor',
          dateOfBirth: '1990-04-12',
        }),
      },
      { avatarUrl: STORY_WORKER_AVATAR },
    ),
  ],
}

/** profile.photo: date of birth and photo are both missing. */
export const PhotoRequired: Story = {
  decorators: [
    withWorkerSetup({
      activeSubStep: 'profile.photo',
      fieldErrors: workerSetupStoryErrors('profile.photo'),
    }),
  ],
}

/** profile.photo: a date of birth under 18 is rejected. */
export const Underage: Story = {
  decorators: [
    withWorkerSetup(
      {
        activeSubStep: 'profile.photo',
        form: workerSetupStoryForm({
          firstName: 'Sam',
          lastName: 'Taylor',
          dateOfBirth: UNDERAGE_DOB,
        }),
        fieldErrors: workerSetupStoryErrors(
          'profile.photo',
          { dateOfBirth: UNDERAGE_DOB },
          { avatarUrl: STORY_WORKER_AVATAR },
        ),
      },
      { avatarUrl: STORY_WORKER_AVATAR },
    ),
  ],
}

/** profile.photo: a GIF is rejected on pick, before anything is uploaded. */
export const PhotoWrongType: Story = {
  decorators: [withWorkerSetup({ activeSubStep: 'profile.photo' })],
  play: async ({ canvasElement }) => {
    const input =
      canvasElement.querySelector<HTMLInputElement>('input[type="file"]')
    if (!input) throw new Error('No file input')
    await userEvent.upload(
      input,
      new File(['gif'], 'cat.gif', { type: 'image/gif' }),
    )
    await expect(
      await within(canvasElement).findByText('Use a JPG, PNG, or WebP image.'),
    ).toBeVisible()
  },
}

/** profile.photo: a photo over 5MB is rejected on pick, before any upload. */
export const PhotoTooLarge: Story = {
  decorators: [withWorkerSetup({ activeSubStep: 'profile.photo' })],
  play: async ({ canvasElement }) => {
    const input =
      canvasElement.querySelector<HTMLInputElement>('input[type="file"]')
    if (!input) throw new Error('No file input')
    await userEvent.upload(
      input,
      new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'huge.jpg', {
        type: 'image/jpeg',
      }),
    )
    await expect(
      await within(canvasElement).findByText('Image must be 5MB or smaller.'),
    ).toBeVisible()
  },
}

/** profile.bio: empty headline and bio. */
export const BioEmpty: Story = {
  decorators: [withWorkerSetup({ activeSubStep: 'profile.bio' })],
}

/** profile.bio: a trade and experience are set, so a headline is suggested. */
export const HeadlineSuggestion: Story = {
  decorators: [
    withWorkerSetup({
      activeSubStep: 'profile.bio',
      form: workerSetupStoryForm({
        primaryCategory: 'handyman',
        yearsExperience: '8',
      }),
    }),
  ],
}

/** profile.bio: headline and bio written. */
export const BioWritten: Story = {
  decorators: [
    withWorkerSetup({
      activeSubStep: 'profile.bio',
      form: completedWorkerSetupForm,
    }),
  ],
}

/** profile.bio: headline and bio missing, both flagged. */
export const BioRequired: Story = {
  decorators: [
    withWorkerSetup({
      activeSubStep: 'profile.bio',
      fieldErrors: workerSetupStoryErrors('profile.bio'),
    }),
  ],
}

/** services.skills: no trade picked and no skills yet. */
export const SkillsEmpty: Story = {
  decorators: [withWorkerSetup({ activeSubStep: 'services.skills' })],
}

/** services.skills: trade picked, skills chosen, trade suggestions below. */
export const SkillsChosen: Story = {
  decorators: [
    withWorkerSetup({
      activeSubStep: 'services.skills',
      form: workerSetupStoryForm({
        primaryCategory: 'handyman',
        skills: ['TV Mounting', 'Shelf Mounting', 'Home Repairs'],
      }),
    }),
  ],
}

/** services.skills: trade and skills both missing, both flagged. */
export const SkillsRequired: Story = {
  decorators: [
    withWorkerSetup({
      activeSubStep: 'services.skills',
      fieldErrors: workerSetupStoryErrors('services.skills'),
    }),
  ],
}

/** services.experience: nothing entered yet. */
export const ExperienceEmpty: Story = {
  decorators: [withWorkerSetup({ activeSubStep: 'services.experience' })],
}

/** services.experience: years and qualifications filled in. */
export const ExperienceFilled: Story = {
  decorators: [
    withWorkerSetup({
      activeSubStep: 'services.experience',
      form: workerSetupStoryForm({
        yearsExperience: '8',
        qualifications: ['City & Guilds', 'NICEIC'],
      }),
    }),
  ],
}

/** services.experience: years outside 0 to 60 are rejected. */
export const ExperienceInvalid: Story = {
  decorators: [
    withWorkerSetup({
      activeSubStep: 'services.experience',
      form: workerSetupStoryForm({ yearsExperience: '99' }),
      fieldErrors: workerSetupStoryErrors('services.experience', {
        yearsExperience: '99',
      }),
    }),
  ],
}

/** area.location: no service area typed yet, so no map preview. */
export const LocationEmpty: Story = {
  decorators: [withWorkerSetup({ activeSubStep: 'area.location' })],
}

/** area.location: area found, so the approximate-area map preview shows. */
export const LocationWithPreview: Story = {
  decorators: [
    withWorkerSetup({
      activeSubStep: 'area.location',
      form: workerSetupStoryForm({
        locationName: 'Camden, London',
        locationLat: 51.539,
        locationLng: -0.1426,
      }),
    }),
  ],
}

/** area.location: no service area entered, so it is flagged as required. */
export const LocationRequired: Story = {
  decorators: [
    withWorkerSetup({
      activeSubStep: 'area.location',
      fieldErrors: workerSetupStoryErrors('area.location'),
    }),
  ],
}

/** area.travel: optional radius left blank. */
export const TravelEmpty: Story = {
  decorators: [withWorkerSetup({ activeSubStep: 'area.travel' })],
}

/** area.travel: a travel radius entered. */
export const TravelSet: Story = {
  decorators: [
    withWorkerSetup({
      activeSubStep: 'area.travel',
      form: workerSetupStoryForm({ travelRadiusMiles: '10' }),
    }),
  ],
}

/** verify.phone: signed in but the phone is not verified yet. */
export const PhoneUnverified: Story = {
  decorators: [withWorkerSetup({ activeSubStep: 'verify.phone' })],
}

/** verify.phone: phone verified, so the step can be continued. */
export const PhoneVerified: Story = {
  decorators: [
    withWorkerSetup({ activeSubStep: 'verify.phone' }, { phoneVerified: true }),
  ],
}

/** verify.phone: Continue pressed with an unverified phone, so it is flagged. */
export const PhoneRequired: Story = {
  decorators: [
    withWorkerSetup({
      activeSubStep: 'verify.phone',
      fieldErrors: workerSetupStoryErrors('verify.phone'),
    }),
  ],
}

/** verify.portfolio: optional, nothing added yet. */
export const PortfolioEmpty: Story = {
  decorators: [withWorkerSetup({ activeSubStep: 'verify.portfolio' })],
}

/** verify.portfolio: two work photos added. */
export const PortfolioFilled: Story = {
  decorators: [
    withWorkerSetup({
      activeSubStep: 'verify.portfolio',
      form: completedWorkerSetupForm,
    }),
  ],
}

/** review.submit: strength meter and a live preview of the finished profile. */
export const Review: Story = {
  decorators: [
    withWorkerSetup(
      {
        activeSubStep: 'review.submit',
        completedSubSteps: ALL_STEPS_BUT_REVIEW,
        form: completedWorkerSetupForm,
      },
      { avatarUrl: STORY_WORKER_AVATAR, phoneVerified: true },
    ),
  ],
}
