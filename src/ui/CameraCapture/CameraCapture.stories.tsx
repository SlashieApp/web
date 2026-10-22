import { Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Button } from '../Button/Button'
import { CameraCapture, type CameraCaptureProps } from './CameraCapture'

type DemoProps = Pick<CameraCaptureProps, 'facing'>

/** A button that opens the camera, and what came back from it. */
function CameraCaptureDemo({ facing }: DemoProps) {
  const [open, setOpen] = useState(false)
  const [result, setResult] = useState('Nothing yet')
  return (
    <Stack gap={3} align="flex-start">
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open camera
      </Button>
      <Text fontSize="sm" color="text.muted">
        {result}
      </Text>
      <CameraCapture
        open={open}
        onOpenChange={setOpen}
        facing={facing}
        onPhoto={(file) => setResult(`Photo: ${file.name} (${file.type})`)}
        fallbackActions={[
          {
            label: "Use your browser's camera",
            onSelect: () => setResult("Chose: Use your browser's camera"),
          },
          {
            label: 'Choose from library',
            onSelect: () => setResult('Chose: Choose from library'),
          },
        ]}
      />
    </Stack>
  )
}

const body = () => within(document.body)

/** Opens the camera and returns the dialog. */
async function openCamera(canvasElement: HTMLElement) {
  await userEvent.click(
    within(canvasElement).getByRole('button', { name: 'Open camera' }),
  )
  return body().findByRole('dialog', { name: 'Take a photo' })
}

/** Opens the camera and waits for the picture; returns the dialog and its stream. */
async function openLiveCamera(canvasElement: HTMLElement) {
  const dialog = await openCamera(canvasElement)
  const shutter = within(dialog).getByRole('button', { name: 'Take photo' })
  await waitFor(() => expect(shutter).not.toHaveAttribute('aria-disabled'))
  const stream = dialog.querySelector('video')?.srcObject
  if (!(stream instanceof MediaStream)) throw new Error('No camera stream')
  return { dialog, shutter, stream }
}

const stopped = (stream: MediaStream) =>
  stream.getTracks().every((track) => track.readyState === 'ended')

/** The message on screen (a hidden live region repeats it for screen readers). */
const shown = { selector: 'p' }

/**
 * SDL CameraCapture: the full-screen camera behind the photo button's Take
 * photo on phones and tablets. Stories get a stand-in camera from the
 * preview (`parameters: { camera }`): `live` (default), `starting`,
 * `blocked`, `busy` or `unavailable`.
 */
const meta = {
  title: 'UI/CameraCapture',
  component: CameraCaptureDemo,
  parameters: { layout: 'padded' },
  globals: { viewport: { value: 'mobile1' } },
  args: { facing: 'environment' },
  argTypes: {
    facing: { control: 'inline-radio', options: ['environment', 'user'] },
  },
} satisfies Meta<typeof CameraCaptureDemo>

export default meta
type Story = StoryObj<typeof meta>

/** Waiting for the camera (or for the person to allow it): Take photo is not ready yet. */
export const Starting: Story = {
  parameters: { camera: 'starting' },
  play: async ({ canvasElement }) => {
    const dialog = await openCamera(canvasElement)
    await expect(
      within(dialog).getByText('Starting camera…', shown),
    ).toBeVisible()
    const shutter = within(dialog).getByRole('button', { name: 'Take photo' })
    await expect(shutter).toHaveAttribute('aria-disabled', 'true')
    await expect(shutter).toHaveFocus()
  },
}

/** The back camera is live: shutter, switch and close; the preview is not mirrored. */
export const Live: Story = {
  play: async ({ canvasElement }) => {
    const { dialog, shutter } = await openLiveCamera(canvasElement)
    await expect(shutter).toHaveFocus()
    await expect(within(dialog).getByText('Camera ready')).toBeInTheDocument()
    await expect(
      within(dialog).getByRole('button', { name: 'Switch camera' }),
    ).toBeVisible()
    await expect(
      within(dialog).getByRole('button', { name: 'Close camera' }),
    ).toBeVisible()
    await expect(
      getComputedStyle(dialog.querySelector('video') as HTMLElement).transform,
    ).toBe('none')
  },
}

/** The front camera, for a selfie: the preview is mirrored. */
export const FrontCamera: Story = {
  args: { facing: 'user' },
  play: async ({ canvasElement }) => {
    const { dialog } = await openLiveCamera(canvasElement)
    await expect(
      getComputedStyle(dialog.querySelector('video') as HTMLElement).transform,
    ).toBe('matrix(-1, 0, 0, 1, 0, 0)')
  },
}

/** A photo taken: it shows with Retake and Use photo, and the camera has stopped. */
export const Review: Story = {
  play: async ({ canvasElement }) => {
    const { dialog, shutter, stream } = await openLiveCamera(canvasElement)
    await userEvent.click(shutter)
    await expect(
      await within(dialog).findByRole('img', { name: 'The photo you took' }),
    ).toBeVisible()
    const use = within(dialog).getByRole('button', { name: 'Use photo' })
    await waitFor(() => expect(use).not.toHaveAttribute('aria-disabled'))
    await expect(use).toHaveFocus()
    await expect(
      within(dialog).getByRole('button', { name: 'Retake' }),
    ).toBeVisible()
    await expect(within(dialog).getByText('Photo taken')).toBeInTheDocument()
    await expect(stopped(stream)).toBe(true)
  },
}

/** Use photo hands over the JPEG, closes the camera and returns focus to the button. */
export const UsePhoto: Story = {
  play: async ({ canvasElement }) => {
    const { dialog, shutter, stream } = await openLiveCamera(canvasElement)
    await userEvent.click(shutter)
    const use = within(dialog).getByRole('button', { name: 'Use photo' })
    await waitFor(() => expect(use).not.toHaveAttribute('aria-disabled'))
    await userEvent.click(use)
    await waitFor(() => expect(body().queryByRole('dialog')).toBeNull())
    await expect(
      within(canvasElement).getByText(
        /^Photo: camera-\d+\.jpg \(image\/jpeg\)$/,
      ),
    ).toBeVisible()
    await expect(stopped(stream)).toBe(true)
    await waitFor(() =>
      expect(
        within(canvasElement).getByRole('button', { name: 'Open camera' }),
      ).toHaveFocus(),
    )
  },
}

/** Retake drops the photo and opens the camera again. */
export const Retake: Story = {
  play: async ({ canvasElement }) => {
    const { dialog, shutter } = await openLiveCamera(canvasElement)
    await userEvent.click(shutter)
    await userEvent.click(
      await within(dialog).findByRole('button', { name: 'Retake' }),
    )
    const again = within(dialog).getByRole('button', { name: 'Take photo' })
    await waitFor(() => expect(again).not.toHaveAttribute('aria-disabled'))
    await expect(again).toHaveFocus()
    await expect(within(dialog).queryByRole('img')).toBeNull()
  },
}

/** Switch camera stops the back camera, then opens the front one (mirrored). */
export const SwitchCamera: Story = {
  play: async ({ canvasElement }) => {
    const { dialog, stream } = await openLiveCamera(canvasElement)
    const switchButton = within(dialog).getByRole('button', {
      name: 'Switch camera',
    })
    await userEvent.click(switchButton)
    await waitFor(() => expect(stopped(stream)).toBe(true))
    const video = dialog.querySelector('video') as HTMLVideoElement
    await waitFor(() => expect(video.srcObject).not.toBe(stream))
    await waitFor(() =>
      expect(switchButton).not.toHaveAttribute('aria-disabled'),
    )
    await expect(switchButton).toHaveFocus()
    await expect(getComputedStyle(video).transform).toBe(
      'matrix(-1, 0, 0, 1, 0, 0)',
    )
  },
}

/** Escape closes the camera without a photo; the camera stops and focus goes back. */
export const EscapeCloses: Story = {
  play: async ({ canvasElement }) => {
    const { stream } = await openLiveCamera(canvasElement)
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(body().queryByRole('dialog')).toBeNull())
    await expect(stopped(stream)).toBe(true)
    await expect(within(canvasElement).getByText('Nothing yet')).toBeVisible()
    await waitFor(() =>
      expect(
        within(canvasElement).getByRole('button', { name: 'Open camera' }),
      ).toHaveFocus(),
    )
  },
}

/** Camera access blocked: where to allow it, and the other ways to add a photo. */
export const Blocked: Story = {
  parameters: { camera: 'blocked' },
  play: async ({ canvasElement }) => {
    const dialog = await openCamera(canvasElement)
    await expect(
      await within(dialog).findByText(
        "Camera access is blocked. You can allow it in your browser's site settings.",
        shown,
      ),
    ).toBeVisible()
    const browserCamera = within(dialog).getByRole('button', {
      name: "Use your browser's camera",
    })
    await expect(browserCamera).toHaveFocus()
    await expect(
      within(dialog).getByRole('button', { name: 'Choose from library' }),
    ).toBeVisible()
    await expect(
      within(dialog).queryByRole('button', { name: 'Take photo' }),
    ).toBeNull()
  },
}

/** A fallback runs inside the tap, then the camera closes. */
export const BlockedUseBrowserCamera: Story = {
  parameters: { camera: 'blocked' },
  play: async ({ canvasElement }) => {
    const dialog = await openCamera(canvasElement)
    await userEvent.click(
      await within(dialog).findByRole('button', {
        name: "Use your browser's camera",
      }),
    )
    await waitFor(() => expect(body().queryByRole('dialog')).toBeNull())
    await expect(
      within(canvasElement).getByText("Chose: Use your browser's camera"),
    ).toBeVisible()
  },
}

/** Another app has the camera. */
export const InUse: Story = {
  parameters: { camera: 'busy' },
  play: async ({ canvasElement }) => {
    const dialog = await openCamera(canvasElement)
    await expect(
      await within(dialog).findByText(
        'Another app is using the camera.',
        shown,
      ),
    ).toBeVisible()
  },
}

/** No camera, or a browser that can't open one here (old, or not on HTTPS). */
export const Unavailable: Story = {
  parameters: { camera: 'unavailable' },
  play: async ({ canvasElement }) => {
    const dialog = await openCamera(canvasElement)
    await expect(
      await within(dialog).findByText(
        "The camera isn't available in this browser.",
        shown,
      ),
    ).toBeVisible()
  },
}
