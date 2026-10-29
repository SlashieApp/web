import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import {
  desktop1280,
  expectAddRow,
  expectChoiceGroup,
  expectGaps,
  expectLineUnder,
  expectPieces,
  expectWidth,
  fieldByLabel,
  gapBelowContent,
  labelIn,
  phone390,
} from '@/app/(stepflow)/stepFlowSpacing.testing'
import { formSpace } from '@/theme/styles'
import { gapBelow, gapBeside, heightOf } from '@/ui/FormField/formGap.testing'
import { expectField } from '@/ui/Modal/taskDialogSpacing.testing'

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

/** About you: names prefilled from the account, no photo yet (a mouse: Upload photo opens the file picker). */
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

/** Taps Upload photo, then the drawer's Take photo; returns the camera dialog. */
const openCamera = async (canvasElement: HTMLElement) => {
  const body = within(canvasElement.ownerDocument.body)
  await userEvent.click(within(canvasElement).getByText('Upload photo'))
  const drawer = await body.findByRole('dialog', { name: 'Add a photo' })
  await userEvent.click(
    within(drawer).getByRole('button', { name: 'Take photo' }),
  )
  return body.findByRole('dialog', { name: 'Take a photo' })
}

/** Phones and tablets: Upload photo opens our front camera (mirrored); closing it goes back to the button. */
export const PhotoTouchScreen: Story = {
  ...onScreen('about'),
  parameters: { touchScreen: true },
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const camera = await openCamera(canvasElement)
    await waitFor(() =>
      expect(
        within(camera).getByRole('button', { name: 'Take photo' }),
      ).not.toHaveAttribute('aria-disabled'),
    )
    await expect(
      getComputedStyle(camera.querySelector('video') as HTMLElement).transform,
    ).toBe('matrix(-1, 0, 0, 1, 0, 0)')
    await userEvent.click(
      within(camera).getByRole('button', { name: 'Close camera' }),
    )
    await waitFor(() =>
      expect(
        within(canvasElement.ownerDocument.body).queryByRole('dialog'),
      ).toBeNull(),
    )
    // The field's label names the button, so find it by its text.
    await waitFor(() =>
      expect(
        within(canvasElement).getByText('Upload photo').closest('button'),
      ).toHaveFocus(),
    )
  },
}

/** Camera blocked: the browser's own front camera is offered; its shot is checked like a picked file. */
export const PhotoBrowserCamera: Story = {
  ...onScreen('about'),
  parameters: { touchScreen: true, camera: 'blocked' },
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const camera = await openCamera(canvasElement)
    await userEvent.click(
      await within(camera).findByRole('button', {
        name: "Use your browser's camera",
      }),
    )
    await waitFor(() =>
      expect(
        within(canvasElement.ownerDocument.body).queryByRole('dialog'),
      ).toBeNull(),
    )
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

/**
 * Form spacing (FE-481), About you on desktop: the names sit side by side,
 * `inlineGap` (12) apart; the blocks of the screen are fields, 20 apart; the
 * photo field has its helper 4 under the photo and the button.
 */
export const SpacingAbout: Story = {
  ...onScreen('about'),
  ...desktop1280,
  play: async ({ canvasElement }) => {
    expectWidth(canvasElement, 1280)
    const first = fieldByLabel(canvasElement, 'First name')
    const last = fieldByLabel(canvasElement, 'Last name')
    const dob = fieldByLabel(canvasElement, 'Date of birth')
    const photo = fieldByLabel(canvasElement, 'Profile photo')
    await expect(gapBeside(first, last)).toBe(formSpace.inlineGap)
    await expectField(first)
    await expectField(last)
    const column = (first.parentElement as HTMLElement)
      .parentElement as HTMLElement
    await expectGaps([...column.children], formSpace.fieldGap)
    await expectField(dob)
    const control = labelIn(photo).nextElementSibling as HTMLElement
    await expect(gapBelow(labelIn(photo), control)).toBe(
      formSpace.labelToControl,
    )
    await expectLineUnder(control, photo, /A clear, friendly photo/)
  },
}

/** On a phone the names stack, `fieldGap` (20) apart. */
export const SpacingAboutPhone: Story = {
  ...onScreen('about'),
  ...phone390,
  play: async ({ canvasElement }) => {
    expectWidth(canvasElement, 390)
    const first = fieldByLabel(canvasElement, 'First name')
    const last = fieldByLabel(canvasElement, 'Last name')
    await expect(gapBelow(first, last)).toBe(formSpace.fieldGap)
    await expectField(first)
    await expectField(last)
  },
}

/**
 * Your work: the trade tiles are a choice group (legend 8 above, tiles 8 apart,
 * helper 4 under), and the skills and qualifications are composite fields: the
 * label 8 above the pieces, the pieces 8 apart, the count 4 under the add row
 * (input and Add 12 apart, 48 tall), the suggestions' heading 8 above them.
 */
export const SpacingWork: Story = {
  ...onScreen('work', {
    form: workerSetupStoryForm({
      primaryCategory: 'plumbing',
      skills: ['Tap Repairs', 'Leak Fixes', 'Shower Fitting'],
      yearsExperience: '8',
      qualifications: ['Gas Safe'],
    }),
  }),
  ...desktop1280,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const legend = await canvas.findByText('What kind of work do you do most?')
    const trade = legend.closest('fieldset') as HTMLElement
    const skills = fieldByLabel(canvasElement, 'Skills and services')
    const years = fieldByLabel(canvasElement, 'Years of experience')
    const quals = fieldByLabel(
      canvasElement,
      /^Qualifications and certificates/,
    )
    const column = trade.parentElement as HTMLElement
    await expectGaps([...column.children], formSpace.fieldGap)

    // The trade tiles: legend 8 above, tiles 8 apart, helper 4 under.
    const grid = legend.nextElementSibling as HTMLElement
    await expect(gapBelow(legend, grid)).toBe(formSpace.labelToControl)
    await expectGaps([...grid.children], formSpace.alternativesGap)
    await expect(
      gapBelow(grid, canvas.getByText(/It leads your profile/)),
    ).toBe(formSpace.controlToHelper)

    // Skills: tags, add row with its count, suggestions.
    const { control, pieces } = await expectPieces(skills)
    const [tags, entry, suggestions] = pieces
    await expectGaps([...tags.children], formSpace.alternativesGap)
    await expectAddRow(entry.firstElementChild as HTMLElement)
    const count = within(entry).getByText(/3 of 12/)
    await expect(gapBelow(entry.firstElementChild as Element, count)).toBe(
      formSpace.controlToHelper,
    )
    await expectGaps([...suggestions.children], formSpace.labelToControl)
    await expectLineUnder(control, skills, /Pick at least 3/)

    await expectField(years)
    await expectPieces(quals)
  },
}

/** A refused skill is the add row's meta: 4 under the row, with the count 4 under it. */
export const SpacingSkillRefused: Story = {
  ...onScreen('work'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(
      canvas.getByPlaceholderText('e.g. Boiler servicing'),
      'x',
    )
    await userEvent.click(canvas.getAllByRole('button', { name: 'Add' })[0])
    const refusal = await canvas.findByText(/is too short/)
    const skills = fieldByLabel(canvasElement, 'Skills and services')
    const { pieces } = await expectPieces(skills)
    const entry = pieces.find((piece) => piece.contains(refusal)) as HTMLElement
    const row = entry.firstElementChild as HTMLElement
    await expect(gapBelow(row, refusal)).toBe(formSpace.controlToHelper)
    await expect(gapBelow(refusal, within(entry).getByText(/0 of 12/))).toBe(
      formSpace.controlToHelper,
    )
  },
}

/**
 * Your profile: the headline's suggestion is an inline action 4 under the
 * field (44 to tap, no added space); the bio is a composite field (starters,
 * textarea, quality meter, example, 8 apart); the work photos list, add row and
 * links are 8 apart.
 */
export const SpacingProfile: Story = {
  ...onScreen('profile', {
    form: {
      ...completedWorkerSetupForm,
      tagline: 'Handy',
      portfolioUrls: ['https://example.com/a.jpg', 'https://example.com/b.jpg'],
    },
  }),
  ...desktop1280,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const headline = fieldByLabel(canvasElement, 'Headline')
    const bio = fieldByLabel(canvasElement, 'Short bio')
    const portfolio = fieldByLabel(canvasElement, /^Work photos and links/)
    const suggestion = await canvas.findByRole('button', { name: /^Use / })
    const column = headline.parentElement?.parentElement as HTMLElement
    await expectGaps([...column.children], formSpace.fieldGap)

    await expect(gapBelowContent(headline, suggestion)).toBe(
      formSpace.controlToHelper,
    )
    await expect(heightOf(suggestion)).toBeGreaterThanOrEqual(44)

    // The bio: starters, textarea, quality meter, example toggle.
    const { pieces } = await expectPieces(bio)
    await expect(pieces).toHaveLength(4)
    await expectGaps([...pieces[0].children], formSpace.alternativesGap)
    await expect(
      heightOf(pieces[3].firstElementChild as Element),
    ).toBeGreaterThanOrEqual(44)

    // The links: the list and the add row.
    const { pieces: parts } = await expectPieces(portfolio)
    await expectGaps([...parts[0].children], formSpace.alternativesGap)
    await expectAddRow(parts[1])
  },
}

/**
 * Where you work: the town field and the map preview are field groups, 20 apart;
 * the map's caption is 4 under it; the travel distance is a choice group (label
 * 8, rows 8 apart, helper 4 under).
 */
export const SpacingArea: Story = {
  ...onScreen('area', {
    form: workerSetupStoryForm({
      locationName: '54 Herkomer Road, Bushey, WD23 3LU, United Kingdom',
      locationLat: 51.6449,
      locationLng: -0.3644,
      travelRadiusMiles: '15',
    }),
  }),
  ...phone390,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const caption = await canvas.findByText('Customers see: Bushey')
    const town = fieldByLabel(canvasElement, 'Town or postcode')
    await expectField(town)
    const preview = caption.parentElement as HTMLElement
    await expect(gapBelow(town, preview)).toBe(formSpace.fieldGap)
    await expect(gapBelow(preview.firstElementChild as Element, caption)).toBe(
      formSpace.controlToHelper,
    )
    const travel = await expectChoiceGroup(
      canvasElement,
      /How far will you travel/,
      ['Further away means more tasks.'],
    )
    await expect(gapBelow(preview.parentElement as Element, travel.root)).toBe(
      formSpace.fieldGap,
    )
  },
}

/**
 * Phone: the intro is a lead-in 8 above the contact rows, the readiness line is
 * a field group 20 under them, and a failed Continue's error is one more, 20
 * under that.
 */
export const SpacingPhoneScreen: Story = {
  ...onScreen('phone', { fieldErrors: workerSetupStoryErrors('phone') }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const intro = await canvas.findByText(/Confirm email or phone so Slashie/)
    const lead = intro.parentElement as HTMLElement
    const [, rows] = [...lead.children]
    await expect(gapBelow(intro, rows as Element)).toBe(
      formSpace.labelToControl,
    )
    const panel = lead.parentElement as HTMLElement
    const status = canvas.getByText(
      /A verified phone is required to send quotes/,
    )
    await expect(gapBelow(lead, status)).toBe(formSpace.fieldGap)
    const column = panel.parentElement as HTMLElement
    await expectGaps([...column.children], formSpace.fieldGap)
  },
}

/**
 * Review: a long form of titled blocks. The strength card, the preview and the
 * notes are sections, 32 apart with no line; the preview's title is 12 above its
 * card; the two notes are field groups, 20 apart.
 */
export const SpacingReview: Story = {
  ...onScreen(
    'review',
    { form: completedWorkerSetupForm },
    {
      avatarUrl: STORY_WORKER_AVATAR,
      phoneVerified: true,
      emailVerified: false,
    },
  ),
  ...desktop1280,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const title = await canvas.findByRole('heading', {
      name: 'How customers will see you',
    })
    const preview = title.parentElement as HTMLElement
    const column = preview.parentElement as HTMLElement
    await expect(column.children).toHaveLength(3)
    await expectGaps([...column.children], formSpace.sectionGap)
    await expect(gapBelow(title, title.nextElementSibling as Element)).toBe(
      formSpace.sectionTitleToField,
    )
    const notes = column.lastElementChild as HTMLElement
    await expect(notes.children).toHaveLength(2)
    await expectGaps([...notes.children], formSpace.fieldGap)
    await expect(getComputedStyle(preview).borderTopWidth).toBe('0px')
  },
}
