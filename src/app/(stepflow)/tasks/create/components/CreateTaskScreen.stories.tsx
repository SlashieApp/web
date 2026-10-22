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
  storyVisibleMapHeight,
  withPopularCategories,
} from './createTaskStoryFixtures'

const USER = 'story-poster'
const ORDER: CreateTaskStepId[] = [
  'location',
  'details',
  'timing',
  'budget',
  'review',
]

const answers: CreateTaskDraftValues = {
  title: 'Fix a leaking kitchen tap',
  description:
    'The cold tap drips all the time. The washer probably needs replacing.',
  categories: ['Plumbing'],
  streetAddress: '12 Example Street, London SW1A 1AA',
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

/** Back on the map with the pin set but no exact address yet. */
const pinnedNoAddress = atStep('location', { ...answers, streetAddress: '' })

/**
 * Phones, location step (FE-349): the compact panel and how much of the
 * screen the map keeps. Fresh visits, so no draft notice takes room.
 */
function phoneLocation(
  viewport: keyof typeof CREATE_TASK_PHONE_VIEWPORTS,
  minMapShare: number,
): Story {
  const { width, height } = CREATE_TASK_PHONE_VIEWPORTS[viewport].styles
  return {
    decorators: [fresh],
    globals: { viewport: { value: viewport } },
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement)
      await canvas.findByRole('heading', { name: 'Where is the task?' })
      await expect(`${window.innerWidth}px`).toBe(width)
      await expect(`${window.innerHeight}px`).toBe(height)
      await expect(
        canvas.getByRole('button', { name: 'Show address details' }),
      ).toHaveAttribute('aria-expanded', 'false')
      await expect(
        canvas.getByRole('button', { name: 'Add exact address' }),
      ).toBeVisible()
      await expect(canvas.getByLabelText(/Exact address/)).not.toBeVisible()
      const map = await storyVisibleMapHeight(canvasElement)
      await expect(map / window.innerHeight).toBeGreaterThanOrEqual(minMapShare)
    },
  }
}

/** Phones: Add exact address opens the panel at the field; map still shows. */
function phoneLocationOpen(
  viewport: keyof typeof CREATE_TASK_PHONE_VIEWPORTS,
): Story {
  return {
    decorators: [fresh],
    globals: { viewport: { value: viewport } },
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement)
      await userEvent.click(
        await canvas.findByRole('button', { name: 'Add exact address' }),
      )
      await expect(
        canvas.getByRole('button', { name: 'Hide address details' }),
      ).toHaveAttribute('aria-expanded', 'true')
      await expect(canvas.getByLabelText(/Exact address/)).toHaveFocus()
      await expect(
        await storyVisibleMapHeight(canvasElement),
      ).toBeGreaterThanOrEqual(0.15 * window.innerHeight)
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
    email: 'alex@example.com',
    emailVerified: true,
    preferredContactDefault: TaskContactMethod.InApp,
    contactOptions: getContactOptions({
      emailVerified: true,
      phoneVerified: true,
    } as MeSnapshot),
    recheckEmail: async (): Promise<boolean> => true,
  },
} satisfies Meta<typeof CreateTaskScreen>

export default meta
type Story = StoryObj<typeof meta>

/** create.location: the full-screen map; the first step has no Back. */
export const Location: Story = {
  decorators: [fresh],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: 'Where is the task?' }),
    ).toBeVisible()
    await expect(canvas.getByLabelText(/Exact address/)).toBeVisible()
    await expect(canvas.queryByRole('button', { name: /Back/ })).toBeNull()
  },
}

/** create.details: title, categories, description and optional photos under the map band. */
export const Details: Story = {
  decorators: [atStep('details')],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: 'What needs doing?' }),
    ).toBeVisible()
    await expect(canvas.getByText('Optional')).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Change the task location' }),
    ).toBeVisible()
    await expect(
      canvas.getByText('We kept your unfinished task.'),
    ).toBeVisible()
  },
}

/** A HEIC photo converting: Continue waits, saying why, then the photo shows. */
export const DetailsConvertingPhoto: Story = {
  decorators: [atStep('details')],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { name: 'What needs doing?' })
    const library = canvasElement.querySelector<HTMLInputElement>(
      'input[type="file"]:not([capture])',
    )
    if (!library) throw new Error('No library input')
    await userEvent.upload(library, await storyHeicPhoto())
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

/** create.review: what workers will see, contact, the confirmation and Post task. */
export const Review: Story = {
  decorators: [atStep('review')],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: 'What workers will see' }),
    ).toBeVisible()
    await expect(canvas.getByText('Fix a leaking kitchen tap')).toBeVisible()
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

/** Unverified email: the review says so before Post task, with a re-check. */
export const ReviewEmailNotVerified: Story = {
  decorators: [atStep('review')],
  args: { emailVerified: false, recheckEmail: async () => false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText('Verify your email to post'),
    ).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: "I've verified" }))
    await expect(
      await canvas.findByText(
        "Your email isn't verified yet. Check your inbox and spam folder.",
      ),
    ).toBeVisible()
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

/** Start over clears the draft and goes back to the map. */
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
    await expect(canvas.getByLabelText(/Exact address/)).toHaveValue('')
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

/** Phones: the short map band, then the form, with Back and Continue at the bottom. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [atStep('details')],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: 'What needs doing?' }),
    ).toBeVisible()
    await expect(canvas.getByRole('button', { name: /Continue/ })).toBeVisible()
  },
}

/** iPhone SE (2nd and 3rd gen): the compact panel leaves the map half the screen. */
export const LocationPhone: Story = phoneLocation('iphoneSe2', 0.45)

/** iPhone SE (2nd and 3rd gen), Add exact address: the panel opens at the field. */
export const LocationPhoneOpen: Story = phoneLocationOpen('iphoneSe2')

/** iPhone SE (1st gen): the compact panel still leaves over a third for the map. */
export const LocationSmallPhone: Story = phoneLocation('iphoneSe1', 0.35)

/** iPhone SE (1st gen), Add exact address: open, with a strip of map above. */
export const LocationSmallPhoneOpen: Story = phoneLocationOpen('iphoneSe1')

/** iPhone 15: the compact panel. */
export const LocationLargePhone: Story = phoneLocation('iphone15', 0.45)

/** iPhone 15, Add exact address: the panel opens at the field. */
export const LocationLargePhoneOpen: Story = phoneLocationOpen('iphone15')

/** Continue with no exact address: the panel opens at the field, saying why. */
export const LocationPhoneContinueWithoutAddress: Story = {
  decorators: [pinnedNoAddress],
  globals: { viewport: { value: 'iphoneSe2' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const handle = await canvas.findByRole('button', {
      name: 'Show address details',
    })
    await userEvent.click(canvas.getByRole('button', { name: /Continue/ }))
    await waitFor(() => expect(handle).toHaveAttribute('aria-expanded', 'true'))
    const field = canvas.getByLabelText(/Exact address/)
    await expect(field).toHaveFocus()
    await expect(field).toHaveAccessibleDescription(/Add the exact address\./)
  },
}

/** An address typed, then the panel closed: the row shows it to edit. */
export const LocationPhoneAddressAdded: Story = {
  decorators: [pinnedNoAddress],
  globals: { viewport: { value: 'iphoneSe2' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Add exact address' }),
    )
    await userEvent.type(
      canvas.getByLabelText(/Exact address/),
      '12 QA Test Street',
    )
    await userEvent.click(
      canvas.getByRole('button', { name: 'Hide address details' }),
    )
    await expect(
      canvas.getByRole('button', {
        name: 'Edit exact address: 12 QA Test Street',
      }),
    ).toBeVisible()
  },
}

/** zh-HK, phones: the compact panel in Traditional Chinese. */
export const LocationPhoneZhHk: Story = {
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/tasks/create' } } },
  decorators: [fresh, zhHk],
  globals: { viewport: { value: 'iphoneSe2' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('button', { name: '加入詳細地址' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: '顯示地址詳情' }),
    ).toHaveAttribute('aria-expanded', 'false')
  },
}
