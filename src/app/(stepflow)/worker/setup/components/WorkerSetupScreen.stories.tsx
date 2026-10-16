import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { WorkerSetupScreen } from './WorkerSetupScreen'
import {
  STORY_WORKER_AVATAR,
  ZH_HK_SETUP,
  completedWorkerSetupForm,
  savedBefore,
  withWorkerSetup,
  withZhHk,
  workerSetupStoryErrors,
  workerSetupStoryForm,
} from './workerSetupStoryFixtures'

const meta: Meta<typeof WorkerSetupScreen> = {
  title: 'Worker setup/WorkerSetupScreen',
  component: WorkerSetupScreen,
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj<typeof meta>

const PHONE = { viewport: { value: 'mobile1' } }

const WORK_FORM = workerSetupStoryForm({
  firstName: 'Sam',
  lastName: 'Taylor',
  primaryCategory: 'plumbing',
  skills: ['Tap Repairs', 'Leak Fixes', 'Shower Fitting'],
  yearsExperience: '8',
})

/** setup.about: the first screen, so no Back; the rail shows all six screens. */
export const About: Story = {
  decorators: [withWorkerSetup({ screen: 'about' })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: 'About you', level: 1 }),
    ).toBeVisible()
    await expect(canvas.queryByRole('button', { name: /Back/ })).toBeNull()
    await expect(canvas.getByRole('button', { name: /Continue/ })).toBeVisible()
  },
}

/** setup.work: trade, skills, years and qualifications. */
export const Work: Story = {
  decorators: [withWorkerSetup({ screen: 'work', form: WORK_FORM })],
}

/** setup.profile: the headline starts from the trade and years. */
export const Profile: Story = {
  decorators: [
    withWorkerSetup({
      screen: 'profile',
      form: { ...WORK_FORM, tagline: 'Plumber with 8 years experience' },
    }),
  ],
}

/** setup.area: town or postcode, approximate map, travel distance. */
export const Area: Story = {
  decorators: [
    withWorkerSetup({
      screen: 'area',
      form: {
        ...WORK_FORM,
        locationName: 'Watford, Hertfordshire, England',
        locationLat: 51.6565,
        locationLng: -0.3903,
        travelRadiusMiles: '10',
      },
    }),
  ],
}

/** setup.phone: verify a number before quoting. */
export const Phone: Story = {
  decorators: [withWorkerSetup({ screen: 'phone' })],
}

/** setup.review: strength, the profile as customers see it, Start quoting. */
export const Review: Story = {
  decorators: [
    withWorkerSetup(
      { screen: 'review', form: completedWorkerSetupForm },
      { avatarUrl: STORY_WORKER_AVATAR, phoneVerified: true },
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('button', { name: 'Start quoting' }),
    ).toBeVisible()
    await expect(canvas.getByText('How customers will see you')).toBeVisible()
  },
}

/** Continue pressed on an empty About you: each problem under its field. */
export const FieldErrors: Story = {
  decorators: [
    withWorkerSetup({
      screen: 'about',
      form: workerSetupStoryForm(),
      fieldErrors: workerSetupStoryErrors('about'),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText('Enter your first name.'),
    ).toBeVisible()
    await expect(canvas.getByText('Enter your date of birth.')).toBeVisible()
    await expect(
      canvas.getByText('Add a profile photo to continue.'),
    ).toBeVisible()
  },
}

/** Saving: Continue shows its loading state. */
export const Saving: Story = {
  decorators: [
    withWorkerSetup({ screen: 'work', form: WORK_FORM, isSaving: true }),
  ],
}

/** The save failed: the reason shows above the screen. */
export const SaveError: Story = {
  decorators: [
    withWorkerSetup({
      screen: 'area',
      saveError: 'Choose a travel distance of up to 50 miles.',
    }),
  ],
}

/** setup.loading: the splash while the setup record loads. */
export const Loading: Story = {
  decorators: [withWorkerSetup({ status: 'loading' })],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('Loading your setup...'),
    ).toBeVisible()
  },
}

/** setup.loadError: Try again, or leave to where they came from. */
export const LoadError: Story = {
  decorators: [withWorkerSetup({ status: 'error' })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText("We couldn't load your setup"),
    ).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Leave setup' }),
    ).toHaveAttribute('href', '/tasks/story-task')
  },
}

/** setup.complete: an existing worker sees the splash while being sent on. */
export const AlreadyAWorker: Story = {
  decorators: [withWorkerSetup({ status: 'complete' })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Loading your setup...')).toBeVisible()
    await expect(canvas.queryByRole('heading', { level: 1 })).toBeNull()
  },
}

/** Phones: "Step 2 of 6" above the screen, Back and Continue at the bottom. */
export const PhoneWork: Story = {
  globals: PHONE,
  decorators: [withWorkerSetup({ screen: 'work', form: WORK_FORM })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText('Step 2 of 6 · Your work'),
    ).toBeVisible()
    await expect(canvas.getByRole('button', { name: /Back/ })).toBeVisible()
  },
}

/** Phones, the review. */
export const PhoneReview: Story = {
  globals: PHONE,
  decorators: [
    withWorkerSetup(
      { screen: 'review', form: completedWorkerSetupForm },
      { avatarUrl: STORY_WORKER_AVATAR, phoneVerified: true },
    ),
  ],
}

/** zh-HK: the work screen in Traditional Chinese. */
export const ZhHk: Story = {
  parameters: ZH_HK_SETUP,
  decorators: [withWorkerSetup({ screen: 'work', form: WORK_FORM }), withZhHk],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: '你做哪類工作？', level: 1 }),
    ).toBeVisible()
    await expect(canvas.getByRole('radio', { name: '水喉' })).toBeChecked()
    await expect(canvas.getByRole('button', { name: /繼續/ })).toBeVisible()
  },
}

/** zh-HK on a phone: the review. */
export const ZhHkPhoneReview: Story = {
  parameters: ZH_HK_SETUP,
  globals: PHONE,
  decorators: [
    withWorkerSetup(
      {
        screen: 'review',
        form: completedWorkerSetupForm,
        completed: savedBefore('review'),
      },
      { avatarUrl: STORY_WORKER_AVATAR, phoneVerified: true },
    ),
    withZhHk,
  ],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('button', { name: '開始報價' }),
    ).toBeVisible()
  },
}
