import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'

import { PhoneFrame } from '../PhoneFrame'
import { PostScreen } from './PostScreen'

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
  // The landing's phone: the screen inside its frame on the white page.
  decorators: [
    (Story) => (
      <Box p={{ base: 4, md: 8 }} bg="bg.surface" display="inline-block">
        <PhoneFrame label={copy.demoLabel} nominalWidth={300} w="300px">
          <Story />
        </PhoneFrame>
      </Box>
    ),
  ],
} satisfies Meta<typeof PostScreen>

export default meta
type Story = StoryObj<typeof meta>

/** Resting (not active): the fields and the button are hidden until the screen plays. */
export const Resting: Story = {
  args: { active: false },
}

/** Playing: the title types itself, a pin drops, then autoplay taps "Post task". */
export const Playing: Story = {}

/** Posted: title typed, pin dropped, toast and button confirm the task. */
export const Posted: Story = {
  play: ({ canvasElement }) => postTask(canvasElement),
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
