import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'

import { PostScreen } from './PostScreen'
import { expectFitsTheCrop, withDemoPhone } from './screenStoryDecorator'

const copy = messages.en.landing.phone

/**
 * Story-only: taps "Post task", unless the screen's autoplay beat (about 2.6 s
 * after it starts) already did, then waits for the finished screen.
 */
async function postTask(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  if (!canvas.queryByText(copy.post.postedBody)) {
    const submit = await canvas.findByRole('button', {
      name: copy.post.submit,
    })
    await userEvent.click(submit)
    // A mouse tap leaves no focus ring; the synthetic click would.
    submit.blur()
  }
  await expect(
    await canvas.findByText(copy.post.postedBody),
  ).toBeInTheDocument()
  // The title keeps typing meanwhile: wait for the whole sentence.
  await waitFor(
    () => expect(canvas.getByText(copy.post.whatValue)).toBeInTheDocument(),
    { timeout: 4000 },
  )
}

const meta = {
  title: 'Marketing/Landing/PostScreen',
  component: PostScreen,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: { copy: { control: false } },
  args: { copy, active: true, intro: true },
  // The landing's phone: the pinned one, or the cropped one with `compact`.
  decorators: [withDemoPhone],
} satisfies Meta<typeof PostScreen>

export default meta
type Story = StoryObj<typeof meta>

/** Resting (not active): the fields and the button are hidden until the screen plays. */
export const Resting: Story = {
  args: { active: false },
}

/** Playing: the title types itself, a pin drops, then autoplay taps "Post task". */
export const Playing: Story = {}

/**
 * Posted: title typed, toast and button confirm the task (the button is then
 * named "Task posted", what it reads), and the pin stands on Clapham, where
 * the task is: over the map's "Clapham" label.
 */
export const Posted: Story = {
  play: async ({ canvasElement }) => {
    await postTask(canvasElement)
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('button', { name: copy.post.postedTitle }),
    ).toBeInTheDocument()
    await expect(
      canvas.queryByRole('button', { name: copy.post.submit }),
    ).toBeNull()
    const pin = canvasElement.querySelector('[data-post-pin]')
    const area = [...canvasElement.querySelectorAll('svg text')].find(
      (label) => label.textContent === 'CLAPHAM',
    )
    if (!pin || !area)
      throw new Error('The pin or the Clapham label is missing')
    // The pin drops in: measure it at rest. Its foot is at the label, over
    // its middle.
    await waitFor(() => {
      const foot = pin.getBoundingClientRect()
      const label = area.getBoundingClientRect()
      expect(
        Math.abs((foot.left + foot.right) / 2 - (label.left + label.right) / 2),
      ).toBeLessThan(8)
      expect(
        Math.abs(foot.bottom - (label.top + label.bottom) / 2),
      ).toBeLessThan(16)
    })
  },
}

/**
 * Posted, the toast takes the app bar's place and covers no field: it ends
 * above the first field's label and above the title field's text, so the
 * typed task stays readable while the toast shows.
 */
export const PostedToastCoversNoField: Story = {
  play: async ({ canvasElement }) => {
    await postTask(canvasElement)
    const canvas = within(canvasElement)
    const toast = canvasElement.querySelector<HTMLElement>('[data-post-toast]')
    if (!toast) throw new Error('The posted toast is missing')
    // The toast fades and rises in (380ms): measure it at rest.
    await waitFor(() => expect(getComputedStyle(toast).opacity).toBe('1'))
    const toastBottom = toast.getBoundingClientRect().bottom
    await expect(toastBottom).toBeLessThanOrEqual(
      canvas.getByText(copy.post.whatLabel).getBoundingClientRect().top,
    )
    await expect(toastBottom).toBeLessThanOrEqual(
      canvas.getByText(copy.post.whatValue).getBoundingClientRect().top,
    )
  },
}

/**
 * Cropped phone (the inline steps below `lg`), playing: the title types in
 * the first field, where and when sit on one line, and "Post task" pulses.
 */
export const Compact: Story = {
  args: { compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: ({ canvasElement }) =>
    expectFitsTheCrop(canvasElement, [copy.post.whatLabel]),
}

/**
 * Cropped phone, posted: the toast lies over the bar and covers no field, and
 * the typed task and the button are whole above the crop.
 */
export const CompactPosted: Story = {
  args: { compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    await postTask(canvasElement)
    await expectFitsTheCrop(canvasElement, [
      copy.post.postedTitle,
      copy.post.postedBody,
      copy.post.whatValue,
    ])
    const toast = canvasElement.querySelector<HTMLElement>('[data-post-toast]')
    if (!toast) throw new Error('The posted toast is missing')
    await waitFor(() => expect(getComputedStyle(toast).opacity).toBe('1'))
    await expect(toast.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      within(canvasElement)
        .getByText(copy.post.whatLabel)
        .getBoundingClientRect().top,
    )
  },
}
