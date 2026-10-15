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
