import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { SlideToConfirm, type SlideToConfirmProps } from './SlideToConfirm'

const meta = {
  title: 'UI/SlideToConfirm',
  component: SlideToConfirm,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <Box maxW="420px">
        <Story />
      </Box>
    ),
  ],
  args: {
    label: 'Slide to mark Done',
    armedLabel: 'Tap again to mark Done',
    onConfirm: () => {},
    disabled: false,
    loading: false,
  },
} satisfies Meta<typeof SlideToConfirm>

export default meta
type Story = StoryObj<typeof meta>

/** Default: idle thumb at the start. Drag to the end, or tap/Enter twice. */
export const Default: Story = {}

/** Loading: the thumb shows a spinner and the control ignores input. */
export const Loading: Story = { args: { loading: true } }

/** Disabled: dimmed track, and the thumb can be neither focused nor dragged. */
export const Disabled: Story = { args: { disabled: true } }

/** Long label: wraps inside the track beside the thumb. */
export const LongLabel: Story = {
  args: {
    label: 'Slide to confirm the job was finished to your satisfaction',
    armedLabel:
      'Tap again to confirm the job was finished to your satisfaction',
  },
}

/** Armed: one Enter swaps in the armed label and outlines the track (4 s). */
export const Armed: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    canvas.getByRole('button', { name: 'Slide to mark Done' }).focus()
    await userEvent.keyboard('{Enter}')
    await expect(
      await canvas.findByRole(
        'button',
        { name: 'Tap again to mark Done' },
        { timeout: 3000 },
      ),
    ).toBeVisible()
  },
}

/** Keyboard: Enter arms the control and a second Enter confirms, no drag. */
export const KeyboardConfirm: Story = {
  args: { onConfirm: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    canvas.getByRole('button', { name: 'Slide to mark Done' }).focus()
    await userEvent.keyboard('{Enter}')
    await expect(args.onConfirm).not.toHaveBeenCalled()
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(args.onConfirm).toHaveBeenCalledTimes(1), {
      timeout: 3000,
    })
  },
}

/** Story-only wrapper that switches to `loading` once the slide confirms. */
function ConfirmingDemo(args: SlideToConfirmProps) {
  const [loading, setLoading] = useState(false)
  return (
    <SlideToConfirm
      {...args}
      loading={loading}
      onConfirm={() => {
        args.onConfirm()
        setLoading(true)
      }}
    />
  )
}

/** Confirming: after the second Enter the thumb rests at the end, spinning. */
export const Confirming: Story = {
  render: (args) => <ConfirmingDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const thumb = canvas.getByRole('button', { name: 'Slide to mark Done' })
    thumb.focus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard('{Enter}')
    await waitFor(
      () => expect(thumb).toHaveAttribute('aria-disabled', 'true'),
      { timeout: 3000 },
    )
    await expect(thumb.style.transform).not.toBe('translateX(0px)')
  },
}

/** Compact: a 40 thumb in the 4 padding, so the track is 48 tall (the Done card's row). */
export const Compact: Story = {
  args: { compact: true },
  play: async ({ canvasElement }) => {
    const thumb = within(canvasElement).getByRole('button', {
      name: 'Slide to mark Done',
    })
    const track = thumb.parentElement as HTMLElement
    await expect(track.getBoundingClientRect().height).toBe(48)
    await expect(thumb.getBoundingClientRect().width).toBe(40)
    await expect(thumb.getBoundingClientRect().height).toBe(40)
    // Centred: the same space above and below the thumb.
    const t = thumb.getBoundingClientRect()
    const k = track.getBoundingClientRect()
    await expect(t.top - k.top).toBe(k.bottom - t.bottom)
  },
}

/** Compact and armed, in the 200 the Done card gives it: "Tap again to mark Done" is one line. */
export const CompactArmed: Story = {
  args: { compact: true },
  decorators: [
    (Story) => (
      <div style={{ width: 200 }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const thumb = within(canvasElement).getByRole('button', {
      name: 'Slide to mark Done',
    })
    thumb.focus()
    await userEvent.keyboard('{Enter}')
    const armed = await within(canvasElement).findByText(
      'Tap again to mark Done',
      { selector: 'p' },
    )
    // The label's text is one line: one client rect for its text.
    const range = document.createRange()
    range.selectNodeContents(armed)
    await expect(range.getClientRects()).toHaveLength(1)
    const t = thumb.getBoundingClientRect()
    const k = (thumb.parentElement as HTMLElement).getBoundingClientRect()
    await expect(t.top - k.top).toBe(k.bottom - t.bottom)
  },
}
