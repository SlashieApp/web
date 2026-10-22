import type { TaskForEditQuery } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import type { MeSnapshot } from '@/app/(auth)/store/user'
import { getContactOptions } from '@/app/(dashboard)/profile/profileEligibility'
import {
  storyDateInDays,
  storyHeicPhoto,
} from '@/app/(stepflow)/stepflowStoryHelpers'
import { withPopularCategories } from '@/app/(stepflow)/tasks/create/components/createTaskStoryFixtures'
import { taskLocationMapStyle } from '@/app/(stepflow)/tasks/create/components/layout/map/useTaskLocationMap'
import { storyTaskDetail } from '@/app/(task)/tasks/[slug]/helpers/taskDetailStoryFixtures'
import { LocaleProvider } from '@/i18n/LocaleProvider'

import { EditTaskScreen } from './EditTaskScreen'

type EditTask = NonNullable<TaskForEditQuery['task']>

/** The fixture task, due in a week (a past date can't be saved). */
const task = {
  ...storyTaskDetail(),
  images: [],
  datetime: { date: storyDateInDays(7), time: '14:00', type: 'EXACT' },
} as unknown as EditTask

/**
 * The edit form in the step-flow shell: create's sections on one page and
 * one Save. The status screens (why a task can't be edited) are
 * `Edit task/EditTaskStatus`.
 */
const meta = {
  title: 'Edit task/EditTaskScreen',
  component: EditTaskScreen,
  parameters: { layout: 'fullscreen' },
  decorators: [withPopularCategories()],
  args: {
    task,
    contactOptions: getContactOptions({
      emailVerified: true,
      phoneVerified: true,
    } as MeSnapshot),
    liveQuotes: 0,
    quotesWarning: false,
  },
} satisfies Meta<typeof EditTaskScreen>

export default meta
type Story = StoryObj<typeof meta>

/** edit.open: the task's title heads the form; Save at the bottom. */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', {
        name: 'Mount bookshelf on living room wall',
      }),
    ).toBeVisible()
    await expect(canvas.getByLabelText(/Task title/)).toHaveValue(
      'Mount bookshelf on living room wall',
    )
    await expect(
      canvas.getByRole('button', { name: 'Save changes' }),
    ).toBeVisible()
  },
}

/** Location: the area workers see, then the private exact address with its hint. */
export const OpenLocation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const address = await canvas.findByLabelText(/Exact address/)
    await expect(address).toHaveValue('12 Example Street, London SW1A 1AA')
    await expect(address).toHaveAccessibleDescription(
      'Shared only with the worker you accept.',
    )
    await expect(
      canvas.getByText(
        /^(Workers will see: .+|Move the map to set the area\.)$/,
      ),
    ).toBeVisible()
  },
}

/**
 * The map looks and works like create's (FE-356): the same Mapbox style
 * (not Mapbox's colourful streets), the floating search bar and locate-me.
 */
export const OpenMapLikeCreate: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('textbox', {
        name: 'Search for your task location',
      }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Use current location' }),
    ).toBeVisible()
    await waitFor(() =>
      expect(canvasElement.querySelector('[data-map-style]')).toHaveAttribute(
        'data-map-style',
        taskLocationMapStyle('light'),
      ),
    )
    canvasElement
      .querySelector('[data-map-style]')
      ?.scrollIntoView({ block: 'center' })
  },
}

/** Location denied: locate-me says so under the map, as create does. */
export const LocateUnavailable: Story = {
  beforeEach: () => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (
          _found: PositionCallback,
          failed: PositionErrorCallback,
        ) => failed({ code: 1 } as GeolocationPositionError),
      },
    })
    return () => {
      Reflect.deleteProperty(navigator, 'geolocation')
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Use current location' }),
    )
    await expect(
      await canvas.findByText(
        "We couldn't get your location. Search or drag the map instead.",
      ),
    ).toBeVisible()
  },
}

/** edit.openWithQuotes: workers who quoted aren't told about changes. */
export const OpenWithQuotes: Story = {
  args: { liveQuotes: 2, quotesWarning: true },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(
        "2 workers have already quoted. They won't be told about your changes, so message them if something important changes.",
      ),
    ).toBeVisible()
  },
}

/** A HEIC photo converting: Save waits, saying why, then the photo shows. */
export const SaveWaitsForPhoto: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('button', { name: 'Save changes' })
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
      await canvas.findByRole('button', { name: 'Save changes' }),
    ).toBeEnabled()
  },
}

/** The contact method starts unchosen: leaving it keeps the task's current one. */
export const ContactKeepsCurrent: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText('Leave this to keep your current choice.'),
    ).toBeVisible()
    for (const name of ['In-app chat', 'Phone', 'Email']) {
      await expect(canvas.getByRole('radio', { name })).toHaveAttribute(
        'aria-checked',
        'false',
      )
    }
  },
}

/** Save with a missing title: the message sits under the field and up top. */
export const SaveNeedsFixing: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.clear(await canvas.findByLabelText(/Task title/))
    await userEvent.click(canvas.getByRole('button', { name: 'Save changes' }))
    await expect(await canvas.findByText('Add a title.')).toBeVisible()
    await expect(
      canvas.getByText(
        'Some details need fixing. We’ve highlighted them.'.replace('’', "'"),
      ),
    ).toBeVisible()
  },
}

/** Close with changes asks before throwing them away. */
export const DiscardChanges: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(await canvas.findByLabelText(/Task title/), ' today')
    await userEvent.click(
      canvas.getByRole('link', { name: 'Close and go back to the task' }),
    )
    // The dialog animates in; under a full test run that can take a while.
    const dialog = within(canvasElement.ownerDocument.body)
    await waitFor(
      () => expect(dialog.getByText('Discard your changes?')).toBeVisible(),
      { timeout: 5000 },
    )
    await expect(
      dialog.getByRole('button', { name: 'Keep editing' }),
    ).toBeVisible()
  },
}

/** zh-HK. */
export const ZhHk: Story = {
  parameters: {
    nextjs: { navigation: { pathname: '/zh-hk/tasks/task-1/edit' } },
  },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('button', { name: '儲存變更' }),
    ).toBeVisible()
  },
}

/** Phones: status and the guest view above the form, Save at the bottom. */
export const Phone: Story = {
  args: { liveQuotes: 1, quotesWarning: true },
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('link', { name: /See it as workers do/ }),
    ).toHaveAttribute('href', '/tasks/task-detail-story-1/preview')
    await expect(
      canvas.getByRole('button', { name: 'Save changes' }),
    ).toBeVisible()
  },
}
