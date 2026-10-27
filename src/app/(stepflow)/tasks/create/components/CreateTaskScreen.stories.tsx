import {
  TaskBudgetType,
  TaskContactMethod,
  TaskDateTimeType,
} from '@codegen/schema'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import type { MeSnapshot } from '@/app/(auth)/store/user'
import { getContactOptions } from '@/app/(dashboard)/profile/profileEligibility'
import {
  storyDateInDays,
  storyHeicPhoto,
} from '@/app/(stepflow)/stepflowStoryHelpers'
import { LocaleProvider } from '@/i18n/LocaleProvider'

import {
  type CreateTaskDraftValues,
  createTaskDraftKey,
  saveCreateTaskDraft,
} from '../helpers/createTaskDraft'
import type { CreateTaskStepId } from '../views'
import { CreateTaskScreen } from './CreateTaskScreen'
import {
  CREATE_TASK_PHONE_VIEWPORTS,
  storyStepCard,
  storyVisibleMapHeight,
  withPopularCategories,
} from './createTaskStoryFixtures'

const USER = 'story-poster'
const ORDER: CreateTaskStepId[] = [
  'location',
  'address',
  'details',
  'timing',
  'photos',
  'budget',
  'review',
]

const ADDRESS = '12 Example Street, London SW1A 1AA'

const answers: CreateTaskDraftValues = {
  title: 'Fix a leaking kitchen tap',
  description:
    'The cold tap drips all the time. The washer probably needs replacing.',
  categories: ['Plumbing'],
  streetAddress: ADDRESS,
  mapPlaceName: 'Westminster, London',
  locationLat: '51.501000',
  locationLng: '-0.141000',
  datetimeType: TaskDateTimeType.Flexible,
  preferredDate: storyDateInDays(3),
  preferredTime: '09:00',
  budgetMajor: '80',
  budgetType: TaskBudgetType.OneOff,
}

/** A fresh visit: no draft on this browser. */
const fresh: Decorator = (Story) => {
  window.localStorage.removeItem(createTaskDraftKey(USER))
  return <Story />
}

/** A returning poster: their draft opens on `step` with the answers so far. */
function atStep(
  step: CreateTaskStepId,
  values: CreateTaskDraftValues = answers,
): Decorator {
  return (Story) => {
    saveCreateTaskDraft(window.localStorage, createTaskDraftKey(USER), {
      step,
      done: ORDER.slice(0, ORDER.indexOf(step)),
      values,
    })
    return <Story />
  }
}

/** On the address step with the pin set but no exact address yet. */
const addressToAdd = atStep('address', { ...answers, streetAddress: '' })

/** A small PNG, as the photo library hands it over. */
async function storyPng(name: string, color: string): Promise<File> {
  const canvas = document.createElement('canvas')
  canvas.width = 120
  canvas.height = 90
  const context = canvas.getContext('2d')
  if (!context) throw new Error('No 2D canvas')
  context.fillStyle = color
  context.fillRect(0, 0, 120, 90)
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png'),
  )
  if (!blob) throw new Error('No PNG')
  return new File([blob], name, { type: 'image/png' })
}

/** The photo button's library input (not the camera's). */
function photoLibrary(canvasElement: HTMLElement): HTMLInputElement {
  const library = canvasElement.querySelector<HTMLInputElement>(
    'input[type="file"]:not([capture])',
  )
  if (!library) throw new Error('No library input')
  return library
}

/** The band's map, hidden on phones once the form has the whole screen. */
function bandMap(canvasElement: HTMLElement): Element {
  const map = canvasElement.querySelector('[data-map-style]')
  if (!map) throw new Error('No map')
  return map
}

/**
 * The browser shares its location at once, as it does for most posters, so
 * the pin starts there (no "couldn't get your location" hint). The real
 * geolocation comes back after the story.
 */
function shareLocation() {
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: {
      getCurrentPosition: (found: PositionCallback) =>
        found({
          coords: { latitude: 51.501, longitude: -0.141 },
        } as GeolocationPosition),
    },
  })
  return () => {
    Reflect.deleteProperty(navigator, 'geolocation')
  }
}

/**
 * Phones, location step (FE-352): the short card and how much of the screen
 * the map keeps above it. Fresh visits, so no draft notice takes room.
 */
function phoneLocation(
  viewport: keyof typeof CREATE_TASK_PHONE_VIEWPORTS,
  minMapShare: number,
): Story {
  const { width, height } = CREATE_TASK_PHONE_VIEWPORTS[viewport].styles
  return {
    decorators: [fresh],
    beforeEach: shareLocation,
    globals: { viewport: { value: viewport } },
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement)
      await canvas.findByRole('heading', { name: 'Where is the task?' })
      await expect(`${window.innerWidth}px`).toBe(width)
      await expect(`${window.innerHeight}px`).toBe(height)
      await expect(canvas.getByText('Step 1 of 7 · Location')).toBeVisible()
      await expect(
        canvas.getByText(
          'Move the map so the pin sits near the job. Workers only see this approximate area, not your address.',
        ),
      ).toBeVisible()
      // The town once the lookup answers; until then, move the map.
      await expect(
        canvas.getByText(
          /^(Workers will see: .+|Move the map to set the area\.)$/,
        ),
      ).toBeVisible()
      await expect(
        canvas.getByRole('button', { name: /Continue/ }),
      ).toBeVisible()
      await expect(canvas.queryByLabelText(/Exact address/)).toBeNull()
      const map = await storyVisibleMapHeight(canvasElement)
      await expect(map / window.innerHeight).toBeGreaterThanOrEqual(minMapShare)
    },
  }
}

const zhHk: Decorator = (Story) => (
  <LocaleProvider>
    <Story />
  </LocaleProvider>
)

/**
 * The create flow, one story per step view (see `views/README.md`). Later
 * steps open from a saved draft, as they would for a returning poster. The
 * signed-out redirect and the loading splash are the page's, not the screen's.
 */
const meta = {
  title: 'Create task/CreateTaskScreen',
  component: CreateTaskScreen,
  parameters: {
    layout: 'fullscreen',
    viewport: { options: CREATE_TASK_PHONE_VIEWPORTS },
  },
  decorators: [withPopularCategories()],
  args: {
    userId: USER,
    emailVerified: true,
    preferredContactDefault: TaskContactMethod.InApp,
    contactOptions: getContactOptions({
      emailVerified: true,
      phoneVerified: true,
    } as MeSnapshot),
  },
} satisfies Meta<typeof CreateTaskScreen>

export default meta
type Story = StoryObj<typeof meta>

/** create.location: the full-screen map and a short card; no address, no Back. */
export const Location: Story = {
  decorators: [fresh],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: 'Where is the task?' }),
    ).toBeVisible()
    await expect(
      canvas.getByText(/Workers only see this approximate area/),
    ).toBeVisible()
    await expect(canvas.queryByLabelText(/Exact address/)).toBeNull()
    await expect(canvas.queryByRole('button', { name: /Back/ })).toBeNull()
  },
}

/** Continue on the map, with the pin set, goes to the exact address. */
export const LocationContinue: Story = {
  decorators: [atStep('location')],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { name: 'Where is the task?' })
    await userEvent.click(canvas.getByRole('button', { name: /Continue/ }))
    // The map shrinks to the band and the form fades in.
    const heading = await canvas.findByRole('heading', {
      name: "What's the exact address?",
    })
    await waitFor(() => expect(heading).toBeVisible())
  },
}

/** create.address: the exact address under the map band, and why it's safe. */
export const Address: Story = {
  decorators: [addressToAdd],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: "What's the exact address?" }),
    ).toBeVisible()
    await expect(
      canvas.getByText(
        'Only shared with the worker you accept, after you accept their quote.',
      ),
    ).toBeVisible()
    const field = canvas.getByLabelText(/Exact address/)
    await expect(field).toHaveValue('')
    await expect(field).not.toHaveAccessibleDescription()
    await expect(
      canvas.queryByText('Shared only with the worker you accept.'),
    ).toBeNull()
    await expect(
      canvas.getByRole('button', { name: 'Use pin address' }),
    ).toBeEnabled()
    await expect(
      canvas.getByRole('button', { name: 'Change the task location' }),
    ).toBeVisible()
    await expect(canvas.getByRole('button', { name: /Back/ })).toBeVisible()
  },
}

/** A draft with an address restores it here; Continue goes on to the details. */
export const AddressFilled: Story = {
  decorators: [atStep('address')],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByLabelText(/Exact address/)).toHaveValue(
      ADDRESS,
    )
    await userEvent.click(canvas.getByRole('button', { name: /Continue/ }))
    await expect(
      await canvas.findByRole('heading', { name: 'What needs doing?' }),
    ).toBeVisible()
  },
}

/** Continue with no address: the field says what's missing and takes focus. */
export const AddressMissing: Story = {
  decorators: [addressToAdd],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { name: "What's the exact address?" })
    await userEvent.click(canvas.getByRole('button', { name: /Continue/ }))
    const field = canvas.getByLabelText(/Exact address/)
    await waitFor(() => expect(field).toHaveFocus())
    await expect(field).toHaveAccessibleDescription(/Add the exact address\./)
  },
}

/** Use pin address fills the field from the pin, only when tapped. */
export const AddressUsePinAddress: Story = {
  decorators: [addressToAdd],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = await canvas.findByLabelText(/Exact address/)
    await expect(field).toHaveValue('')
    await userEvent.click(
      canvas.getByRole('button', { name: 'Use pin address' }),
    )
    await expect(field).toHaveValue('Westminster, London')
  },
}

/** Phones: the band, the address form, and "Step 2 of 7". */
export const AddressPhone: Story = {
  decorators: [addressToAdd],
  globals: { viewport: { value: 'iphoneSe2' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: "What's the exact address?" }),
    ).toBeVisible()
    await expect(canvas.getByText('Step 2 of 7 · Address')).toBeVisible()
    await expect(canvas.getByLabelText(/Exact address/)).toBeVisible()
    await expect(canvas.getByRole('button', { name: /Continue/ })).toBeVisible()
  },
}

/** zh-HK: the address step in Traditional Chinese. */
export const AddressZhHk: Story = {
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/tasks/create' } } },
  decorators: [addressToAdd, zhHk],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: '工作的詳細地址是？' }),
    ).toBeVisible()
    await expect(
      canvas.getByText('只會在你接受報價後，分享給你選擇的工作者。'),
    ).toBeVisible()
  },
}

/** create.details (desktop): title, categories and description under the map band; photos have their own step. */
export const Details: Story = {
  decorators: [atStep('details')],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: 'What needs doing?' }),
    ).toBeVisible()
    await expect(canvas.getByLabelText(/Task title/)).toBeVisible()
    await expect(
      canvas.queryByRole('button', { name: 'Add photos' }),
    ).toBeNull()
    await expect(
      canvas.getByRole('button', { name: 'Change the task location' }),
    ).toBeVisible()
    await expect(
      canvas.getByText('We kept your unfinished task.'),
    ).toBeVisible()
  },
}

/** Phones, details onward (FE-355): the form has the whole screen, with no band or area chip. */
export const DetailsPhone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [atStep('details')],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: 'What needs doing?' }),
    ).toBeVisible()
    await expect(canvas.getByText('Step 3 of 7 · Details')).toBeVisible()
    await expect(await storyVisibleMapHeight(canvasElement)).toBe(0)
    await expect(bandMap(canvasElement)).not.toBeVisible()
    await expect(
      canvas.queryByRole('button', { name: 'Change the task location' }),
    ).toBeNull()
    await expect(canvas.getByRole('button', { name: 'Back' })).toBeVisible()
    await expect(canvas.getByRole('button', { name: /Continue/ })).toBeVisible()
  },
}

/**
 * Phones: Continue on the address step slides the form up from the bottom
 * over the band; then it has the whole screen and the band is gone. The
 * title takes focus once the form has stopped, without scrolling the page.
 */
export const AddressToDetailsPhone: Story = {
  decorators: [atStep('address')],
  globals: { viewport: { value: 'iphoneSe2' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { name: "What's the exact address?" })
    await expect(await storyVisibleMapHeight(canvasElement)).toBe(160)
    await expect(bandMap(canvasElement)).toBeVisible()

    await userEvent.click(canvas.getByRole('button', { name: /Continue/ }))
    const heading = await canvas.findByRole('heading', {
      name: 'What needs doing?',
    })
    await expect(
      getComputedStyle(storyStepCard(canvasElement)).animationName,
    ).toBe('slide-from-bottom-full')
    await expect(await storyVisibleMapHeight(canvasElement)).toBe(0)
    await expect(bandMap(canvasElement)).not.toBeVisible()
    await expect(
      canvas.queryByRole('button', { name: 'Change the task location' }),
    ).toBeNull()
    await expect(canvas.getByText('Step 3 of 7 · Details')).toBeVisible()
    await waitFor(() =>
      expect(heading.closest('[tabindex="-1"]')).toHaveFocus(),
    )
    await expect(window.scrollY).toBe(0)
  },
}

/** Phones: Back from the details slides the form down, and the band opens again. */
export const DetailsBackToAddressPhone: Story = {
  decorators: [atStep('details')],
  globals: { viewport: { value: 'iphoneSe2' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { name: 'What needs doing?' })
    await expect(await storyVisibleMapHeight(canvasElement)).toBe(0)

    await userEvent.click(canvas.getByRole('button', { name: 'Back' }))
    await canvas.findByRole('heading', { name: "What's the exact address?" })
    await expect(await storyVisibleMapHeight(canvasElement)).toBe(160)
    await expect(bandMap(canvasElement)).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Change the task location' }),
    ).toBeVisible()
  },
}

/** Desktop is unchanged: the details step keeps the band and its area chip, with no slide. */
export const AddressToDetailsDesktop: Story = {
  decorators: [atStep('address')],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { name: "What's the exact address?" })
    const band = await storyVisibleMapHeight(canvasElement)
    await expect(band).toBeGreaterThan(90)

    await userEvent.click(canvas.getByRole('button', { name: /Continue/ }))
    await canvas.findByRole('heading', { name: 'What needs doing?' })
    await expect(
      getComputedStyle(storyStepCard(canvasElement)).animationName,
    ).toBe('none')
    await expect(await storyVisibleMapHeight(canvasElement)).toBe(band)
    await expect(bandMap(canvasElement)).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Change the task location' }),
    ).toBeVisible()
  },
}

/** create.timing: picking a date and time shows the date and time fields. */
export const Timing: Story = {
  decorators: [atStep('timing')],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('radio', { name: 'On a date and time' }),
    )
    await expect(canvas.getByLabelText(/^Date/)).toBeVisible()
    await expect(canvas.getByLabelText(/^Time/)).toBeVisible()
  },
}

/** A date that has passed is turned down on Continue. */
export const DateInThePast: Story = {
  decorators: [
    atStep('timing', {
      ...answers,
      datetimeType: TaskDateTimeType.Before,
      preferredDate: storyDateInDays(-2),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: /Continue/ }),
    )
    await expect(
      await canvas.findByText('Pick today or a later date.'),
    ).toBeVisible()
  },
}

/**
 * create.photos (FE-355): "Add photos", optional, with what photos are for;
 * no photos yet, and Continue works without any.
 */
export const Photos: Story = {
  decorators: [atStep('photos')],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: 'Add photos' }),
    ).toBeVisible()
    await expect(
      canvas.getByText(
        "Optional. Photos help workers quote. They're public on your task, so leave out house numbers and faces.",
      ),
    ).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Add photos' }),
    ).toBeVisible()
    await expect(canvas.queryByText(/of 10$/)).toBeNull()
  },
}

/** No photos: Continue goes straight on to the budget. */
export const PhotosContinueWithout: Story = {
  decorators: [atStep('photos')],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { name: 'Add photos' })
    await userEvent.click(canvas.getByRole('button', { name: /Continue/ }))
    await expect(
      await canvas.findByRole('heading', { name: "What's your budget?" }),
    ).toBeVisible()
  },
}

/** Phones: two photos picked, each with a preview and a remove button; "Step 5 of 7". */
export const PhotosWithPhotos: Story = {
  decorators: [atStep('photos')],
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { name: 'Add photos' })
    await expect(canvas.getByText('Step 5 of 7 · Photos')).toBeVisible()
    await expect(await storyVisibleMapHeight(canvasElement)).toBe(0)
    await userEvent.upload(photoLibrary(canvasElement), [
      await storyPng('tap.png', '#9ec5e8'),
      await storyPng('sink.png', '#f0c987'),
    ])
    await expect(
      await canvas.findByRole('button', { name: 'Photo 2' }),
    ).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Photo 1' })).toBeVisible()
    await expect(canvas.getByText('2 of 10')).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Remove photo 2' }),
    ).toBeVisible()
    await expect(canvas.getByRole('button', { name: /Continue/ })).toBeEnabled()
  },
}

/** A HEIC photo converting: Continue waits, saying why, then the photo shows. */
export const PhotosConvertingPhoto: Story = {
  decorators: [atStep('photos')],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { name: 'Add photos' })
    await userEvent.upload(photoLibrary(canvasElement), await storyHeicPhoto())
    await expect(await canvas.findByText('Converting photo…')).toBeVisible()
    await expect(
      await canvas.findByRole('button', { name: 'Converting photos…' }),
    ).toBeDisabled()
    await expect(
      await canvas.findByRole(
        'button',
        { name: 'Photo 1' },
        { timeout: 15_000 },
      ),
    ).toBeVisible()
    await expect(
      await canvas.findByRole('button', { name: 'Continue' }),
    ).toBeEnabled()
  },
}

/** create.budget: the amount's label follows the budget type. */
export const Budget: Story = {
  decorators: [atStep('budget')],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('radio', { name: 'Per hour' }),
    )
    await expect(canvas.getByLabelText(/Budget per hour/)).toBeVisible()
  },
}

/** create.review: what workers will see, the private address, contact, the confirmation and Post task. */
export const Review: Story = {
  decorators: [atStep('review')],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: 'What workers will see' }),
    ).toBeVisible()
    await expect(canvas.getByText('Fix a leaking kitchen tap')).toBeVisible()
    await expect(canvas.getByText(ADDRESS)).toBeVisible()
    await expect(canvas.getByText('£80 · Cash')).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Post task' }),
    ).toBeVisible()
  },
}

/** Each summary row goes back to the step that asks for it. */
export const ReviewEditGoesBack: Story = {
  decorators: [atStep('review')],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Edit Timing' }),
    )
    await expect(
      await canvas.findByRole('heading', { name: 'When do you need it?' }),
    ).toBeVisible()
  },
}

/** The exact address row's Edit goes to the address step, address kept. */
export const ReviewEditAddress: Story = {
  decorators: [atStep('review')],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Edit Address' }),
    )
    await expect(
      await canvas.findByRole('heading', { name: "What's the exact address?" }),
    ).toBeVisible()
    await expect(canvas.getByLabelText(/Exact address/)).toHaveValue(ADDRESS)
  },
}

/** The photos row's Edit opens the photos step. */
export const ReviewEditPhotos: Story = {
  decorators: [atStep('review')],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('No photos')).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: 'Edit Photos' }))
    await expect(
      await canvas.findByRole('heading', { name: 'Add photos' }),
    ).toBeVisible()
  },
}

/** The area row's Edit goes back to the map. */
export const ReviewEditArea: Story = {
  decorators: [atStep('review')],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Edit Location' }),
    )
    // The map grows back to full screen and the card fades in.
    const heading = await canvas.findByRole('heading', {
      name: 'Where is the task?',
    })
    await waitFor(() => expect(heading).toBeVisible())
  },
}

/** Post task with no exact address: back to the address step, saying why. */
export const ReviewMissingAddress: Story = {
  decorators: [atStep('review', { ...answers, streetAddress: '' })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('checkbox', {
        name: /I confirm this task is legal/,
      }),
    )
    await userEvent.click(canvas.getByRole('button', { name: 'Post task' }))
    await expect(
      await canvas.findByRole('heading', { name: "What's the exact address?" }),
    ).toBeVisible()
    await expect(
      canvas.getByText(
        "Some details are missing. We've taken you to the first one.",
      ),
    ).toBeVisible()
    await expect(
      canvas.getByLabelText(/Exact address/),
    ).toHaveAccessibleDescription(/Add the exact address\./)
  },
}

/**
 * The email is checked before the first step (`create.verifyEmail`), so the
 * review has no email section of its own, even for an unverified account.
 * Post task still stops one (a guard in `submit`).
 */
export const ReviewEmailNotVerified: Story = {
  decorators: [atStep('review')],
  args: { emailVerified: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: 'What workers will see' }),
    ).toBeVisible()
    await expect(canvas.queryByText('Verify your email to post')).toBeNull()
    await expect(
      canvas.queryByRole('button', { name: "I've verified" }),
    ).toBeNull()
    await expect(
      canvas.getByRole('button', { name: 'Post task' }),
    ).toBeEnabled()
  },
}

/** Post task without the confirmation: the box says why. */
export const ReviewNeedsConfirmation: Story = {
  decorators: [atStep('review')],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Post task' }),
    )
    await expect(
      await canvas.findByText('Tick the box to confirm this task is allowed.'),
    ).toBeVisible()
  },
}

/** Start over clears the draft and goes back to an unset map. */
export const StartOver: Story = {
  decorators: [atStep('budget')],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Start over' }),
    )
    // The map card rises in, so wait for it to finish fading in.
    const heading = await canvas.findByRole('heading', {
      name: 'Where is the task?',
    })
    await waitFor(() => expect(heading).toBeVisible())
    await expect(
      canvas.getByText('Move the map to set the area.'),
    ).toBeVisible()
    await expect(canvas.queryByText('We kept your unfinished task.')).toBeNull()
  },
}

/** zh-HK: the review in Traditional Chinese. */
export const ZhHk: Story = {
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/tasks/create' } } },
  decorators: [atStep('review'), zhHk],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: '檢查並發佈' }),
    ).toBeVisible()
    await expect(canvas.getByRole('button', { name: '發佈任務' })).toBeVisible()
  },
}

/** iPhone SE (2nd and 3rd gen): the short card leaves the map half the screen. */
export const LocationPhone: Story = phoneLocation('iphoneSe2', 0.5)

/** iPhone SE (1st gen): the short card still leaves the map 40% of the screen. */
export const LocationSmallPhone: Story = phoneLocation('iphoneSe1', 0.4)

/** iPhone 15: the short card. */
export const LocationLargePhone: Story = phoneLocation('iphone15', 0.5)

/** zh-HK, iPhone SE (2nd and 3rd gen): the short card, still half the screen of map. */
export const LocationPhoneZhHk: Story = {
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/tasks/create' } } },
  decorators: [fresh, zhHk],
  beforeEach: shareLocation,
  globals: { viewport: { value: 'iphoneSe2' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: '任務在哪裡？' }),
    ).toBeVisible()
    await expect(
      canvas.getByText(
        '移動地圖，把圖釘放在工作地點附近。工作者只會看到這個大約位置，不會看到你的地址。',
      ),
    ).toBeVisible()
    const map = await storyVisibleMapHeight(canvasElement, /繼續/)
    await expect(map / window.innerHeight).toBeGreaterThanOrEqual(0.5)
  },
}
