import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import type { WorkerSetupContextValue } from '../../../context/WorkerSetupProvider'
import { type WorkerSetupScreenId, workerSetupScreen } from '../../../views'
import {
  STORY_WORKER_AVATAR,
  type StoryAccount,
  ZH_HK_SETUP,
  completedWorkerSetupForm,
  withWorkerSetup,
  withZhHk,
  workerSetupStoryErrors,
  workerSetupStoryForm,
} from '../../workerSetupStoryFixtures'
import { WorkerSetupStepContent } from './WorkerSetupStepContent'

const meta: Meta<typeof WorkerSetupStepContent> = {
  title: 'Worker setup/WorkerSetupStepContent',
  component: WorkerSetupStepContent,
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof meta>

/** One screen's sections with a static setup context. */
function onScreen(
  screen: WorkerSetupScreenId,
  overrides: Partial<WorkerSetupContextValue> = {},
  account: StoryAccount = {},
): Story {
  return {
    args: { view: workerSetupScreen(screen) },
    decorators: [withWorkerSetup({ screen, ...overrides }, account)],
  }
}

/** Born ten years ago: under 18. */
const UNDERAGE_DOB = `${new Date().getFullYear() - 10}-01-01`

const pick = async (
  canvasElement: HTMLElement,
  file: File,
  selector = 'input[type="file"]:not([capture])',
) => {
  const input = canvasElement.querySelector<HTMLInputElement>(selector)
  if (!input) throw new Error('No file input')
  // Desktop pickers can still choose "All files", so turn off the filter.
  await userEvent.setup({ applyAccept: false }).upload(input, file)
}

/** About you: names prefilled from the account, no photo yet (a mouse: no Take photo). */
export const About: Story = {
  ...onScreen('about'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Upload photo')).toBeVisible()
    await expect(
      canvas.queryByRole('button', { name: 'Take photo' }),
    ).toBeNull()
  },
}

/** Phones and tablets: Take photo opens the front camera; its shot is checked like a picked file. */
export const PhotoTouchScreen: Story = {
  ...onScreen('about'),
  globals: { touch: 'on', viewport: { value: 'mobile1' } },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: 'Take photo' }),
    ).toBeVisible()
    await expect(canvasElement.querySelector('input[capture]')).toHaveAttribute(
      'capture',
      'user',
    )
    await pick(
      canvasElement,
      new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'selfie.jpg', {
        type: 'image/jpeg',
      }),
      'input[capture]',
    )
    await expect(
      await within(canvasElement).findByText('Use a photo under 5 MB.'),
    ).toBeVisible()
  },
}

/** About you, filled in with a photo: "Change photo". */
export const AboutDone = onScreen(
  'about',
  {
    form: workerSetupStoryForm({
      firstName: 'Sam',
      lastName: 'Taylor',
      dateOfBirth: '1990-04-12',
    }),
  },
  { avatarUrl: STORY_WORKER_AVATAR },
)

/** About you, Continue pressed with nothing filled in. */
export const AboutRequired = onScreen('about', {
  form: workerSetupStoryForm(),
  fieldErrors: workerSetupStoryErrors('about'),
})

/** A date of birth under 18 is turned away. */
export const Underage = onScreen(
  'about',
  {
    form: workerSetupStoryForm({
      firstName: 'Sam',
      lastName: 'Taylor',
      dateOfBirth: UNDERAGE_DOB,
    }),
    fieldErrors: workerSetupStoryErrors(
      'about',
      { firstName: 'Sam', lastName: 'Taylor', dateOfBirth: UNDERAGE_DOB },
      { avatarUrl: STORY_WORKER_AVATAR },
    ),
  },
  { avatarUrl: STORY_WORKER_AVATAR },
)

/** A GIF is turned away on pick, before anything uploads. */
export const PhotoWrongType: Story = {
  ...onScreen('about'),
  play: async ({ canvasElement }) => {
    await pick(
      canvasElement,
      new File(['gif'], 'cat.gif', { type: 'image/gif' }),
    )
    await expect(
      await within(canvasElement).findByText(
        'Use a JPG, PNG, WebP, HEIC or AVIF photo.',
      ),
    ).toBeVisible()
  },
}

/** A photo over 5 MB is turned away on pick. */
export const PhotoTooLarge: Story = {
  ...onScreen('about'),
  play: async ({ canvasElement }) => {
    await pick(
      canvasElement,
      new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'huge.jpg', {
        type: 'image/jpeg',
      }),
    )
    await expect(
      await within(canvasElement).findByText('Use a photo under 5 MB.'),
    ).toBeVisible()
  },
}

/** Your work, nothing chosen: general skill suggestions. */
export const Work = onScreen('work')

/** Your work, a plumber: the trade's skills are suggested. */
export const WorkChosen = onScreen('work', {
  form: workerSetupStoryForm({
    primaryCategory: 'plumbing',
    skills: ['Tap Repairs', 'Leak Fixes', 'Shower Fitting'],
    yearsExperience: '8',
    qualifications: ['Gas Safe'],
  }),
})

/** Your work, Continue pressed with nothing chosen. */
export const WorkRequired = onScreen('work', {
  fieldErrors: workerSetupStoryErrors('work', { yearsExperience: '2.5' }),
})

/** A skill that's too short is refused with the reason. */
export const SkillRefused: Story = {
  ...onScreen('work'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(
      canvas.getByPlaceholderText('e.g. Boiler servicing'),
      'x{Enter}',
    )
    await expect(
      await canvas.findByText('“x” is too short. Use at least 2 characters.'),
    ).toBeVisible()
  },
}

/** Your profile: the headline starts from the trade, with a bio written. */
export const Profile = onScreen('profile', {
  form: { ...completedWorkerSetupForm, portfolioUrls: [] },
})

/** A headline of their own: the suggestion is one tap away. */
export const HeadlineSuggestion: Story = {
  ...onScreen('profile', {
    form: workerSetupStoryForm({
      primaryCategory: 'handyman',
      yearsExperience: '8',
      tagline: 'Handy',
    }),
  }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('button', {
        name: 'Use “Handyman with 8 years experience”',
      }),
    ).toBeVisible()
  },
}

/** Your profile, Continue pressed with placeholder text. */
export const ProfileRequired = onScreen('profile', {
  form: workerSetupStoryForm({ tagline: 'Electrician', bio: 'o'.repeat(90) }),
  fieldErrors: workerSetupStoryErrors('profile', {
    tagline: 'Electrician',
    bio: 'o'.repeat(90),
  }),
})

/** Where you work: empty. */
export const Area = onScreen('area')

/** Placed on the map: customers see the town only. */
export const AreaPlaced: Story = {
  ...onScreen('area', {
    form: workerSetupStoryForm({
      locationName: '54 Herkomer Road, Bushey, WD23 3LU, United Kingdom',
      locationLat: 51.6449,
      locationLng: -0.3644,
      travelRadiusMiles: '15',
    }),
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Customers see: Bushey')).toBeVisible()
    await expect(
      canvas.getByRole('radio', { name: '15 miles' }),
    ).toHaveAttribute('aria-checked', 'true')
  },
}

/** A distance saved before the choices existed stays on the list. */
export const AreaOldDistance: Story = {
  ...onScreen('area', {
    form: workerSetupStoryForm({
      locationName: 'Watford',
      travelRadiusMiles: '12',
    }),
  }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('radio', { name: '12 miles' }),
    ).toHaveAttribute('aria-checked', 'true')
  },
}

/** Where you work, Continue pressed with nothing typed. */
export const AreaRequired = onScreen('area', {
  fieldErrors: workerSetupStoryErrors('area'),
})

/** Phone not verified yet. */
export const Phone = onScreen('phone')

/** Phone verified. */
export const PhoneVerified = onScreen('phone', {}, { phoneVerified: true })

/** Continue pressed without a verified phone. */
export const PhoneRequired = onScreen('phone', {
  fieldErrors: workerSetupStoryErrors('phone'),
})

/** Review, a thin profile: Starter, with links to fix each gap. */
export const ReviewStarter = onScreen('review', {
  form: workerSetupStoryForm({
    firstName: 'Sam',
    lastName: 'Taylor',
    primaryCategory: 'handyman',
    skills: ['Shelving', 'Painting', 'Tiling'],
    locationName: 'Camden',
  }),
})

/** Review, everything done: All-star. */
export const ReviewAllStar = onScreen(
  'review',
  { form: completedWorkerSetupForm },
  { avatarUrl: STORY_WORKER_AVATAR, phoneVerified: true },
)

/** Review with an unverified email: quoting will need it. */
export const ReviewEmailUnverified: Story = {
  ...onScreen(
    'review',
    { form: completedWorkerSetupForm },
    {
      avatarUrl: STORY_WORKER_AVATAR,
      phoneVerified: true,
      emailVerified: false,
    },
  ),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(
        "You'll also need to verify your email before you can send quotes.",
      ),
    ).toBeVisible()
  },
}

/** Phones: the names stack. */
export const PhoneAbout: Story = {
  ...onScreen('about'),
  globals: { viewport: { value: 'mobile1' } },
}

/** zh-HK: trade tiles, skills and copy in Traditional Chinese. */
export const ZhHkWork: Story = {
  args: { view: workerSetupScreen('work') },
  parameters: ZH_HK_SETUP,
  decorators: [
    withWorkerSetup({
      screen: 'work',
      form: workerSetupStoryForm({ primaryCategory: 'handyman' }),
    }),
    withZhHk,
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('你最常做哪類工作？')).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: '加入「掛牆電視安裝」' }),
    ).toBeVisible()
  },
}
