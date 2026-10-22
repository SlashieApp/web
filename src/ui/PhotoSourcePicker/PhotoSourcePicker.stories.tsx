import { Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test'

import { Button } from '../Button/Button'
import {
  PhotoSourcePicker,
  type PhotoSourcePickerProps,
} from './PhotoSourcePicker'

type DemoProps = Omit<PhotoSourcePickerProps, 'onFiles' | 'children'>

/** The picker with a plain button, listing what it hands back. */
function PhotoSourcePickerDemo(props: DemoProps) {
  const [names, setNames] = useState<string[]>([])
  return (
    <Stack gap={3} align="flex-start">
      <PhotoSourcePicker
        {...props}
        onFiles={(files) => setNames(files.map((file) => file.name))}
      >
        {(trigger) => (
          <Button {...trigger} variant="secondary">
            Add photos
          </Button>
        )}
      </PhotoSourcePicker>
      <Text fontSize="sm" color="text.muted">
        {names.length > 0 ? `Picked: ${names.join(', ')}` : 'Nothing picked'}
      </Text>
    </Stack>
  )
}

/**
 * Records which hidden input a tap clicks instead of opening the browser's
 * picker, and whether the drawer was still open at that moment (the click
 * has to happen inside the tap, not after the drawer animates away).
 */
function watchInputClicks() {
  const clicks: { input: HTMLInputElement; drawerOpen: boolean }[] = []
  const spy = spyOn(HTMLInputElement.prototype, 'click').mockImplementation(
    function (this: HTMLInputElement) {
      clicks.push({
        input: this,
        drawerOpen: Boolean(
          document.querySelector('[role="dialog"][data-state="open"]'),
        ),
      })
    },
  )
  return { clicks, restore: () => spy.mockRestore() }
}

/**
 * SDL PhotoSourcePicker: one photo button. On a phone or tablet it opens a
 * bottom drawer offering Take photo (the camera, through an input with
 * `capture`) and Choose from library; with a mouse it opens the file picker
 * straight away. The place renders its own button with the trigger props.
 * `parameters: { touchScreen: true }` makes a desktop story answer the
 * touch-screen query as a phone does.
 */
const meta = {
  title: 'UI/PhotoSourcePicker',
  component: PhotoSourcePickerDemo,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { camera: 'environment', multiple: true },
  argTypes: {
    camera: { control: 'inline-radio', options: ['environment', 'user'] },
  },
} satisfies Meta<typeof PhotoSourcePickerDemo>

export default meta
type Story = StoryObj<typeof meta>

/** Mouse or trackpad: the button opens the file picker straight away, no drawer. */
export const Desktop: Story = {
  play: async ({ canvasElement }) => {
    const watch = watchInputClicks()
    try {
      await userEvent.click(
        within(canvasElement).getByRole('button', { name: 'Add photos' }),
      )
      await expect(watch.clicks).toHaveLength(1)
      await expect(watch.clicks[0].input).not.toHaveAttribute('capture')
      await expect(watch.clicks[0].input).toHaveAttribute('multiple')
      await expect(
        within(canvasElement.ownerDocument.body).queryByRole('dialog'),
      ).toBeNull()
    } finally {
      watch.restore()
    }
  },
}

// Open-drawer stories are left off the autodocs page: the drawer would cover it.
/** Touch screen: the button opens the "Add a photo" drawer, focus inside it. */
export const TouchScreen: Story = {
  tags: ['!autodocs'],
  parameters: { touchScreen: true },
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Add photos' }),
    )
    const drawer = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog',
      { name: 'Add a photo' },
    )
    await waitFor(() =>
      expect(drawer).toContainElement(document.activeElement as HTMLElement),
    )
    await expect(
      within(drawer).getByRole('button', { name: 'Take photo' }),
    ).toBeVisible()
    await expect(
      within(drawer).getByRole('button', { name: 'Choose from library' }),
    ).toBeVisible()
  },
}

/** Take photo clicks the back-camera input inside the tap, closes, and returns focus. */
export const TouchTakePhoto: Story = {
  tags: ['!autodocs'],
  parameters: { touchScreen: true },
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body)
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Add photos',
    })
    await userEvent.click(trigger)
    const drawer = await body.findByRole('dialog', { name: 'Add a photo' })
    const watch = watchInputClicks()
    try {
      await userEvent.click(
        within(drawer).getByRole('button', { name: 'Take photo' }),
      )
      await expect(watch.clicks).toHaveLength(1)
      await expect(watch.clicks[0].drawerOpen).toBe(true)
      await expect(watch.clicks[0].input).toHaveAttribute(
        'capture',
        'environment',
      )
      await expect(watch.clicks[0].input).toHaveAttribute('accept', 'image/*')
    } finally {
      watch.restore()
    }
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())
  },
}

/** Choose from library clicks the library input, which takes several photos. */
export const TouchChooseFromLibrary: Story = {
  tags: ['!autodocs'],
  parameters: { touchScreen: true },
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Add photos' }),
    )
    const drawer = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog',
      { name: 'Add a photo' },
    )
    const watch = watchInputClicks()
    try {
      await userEvent.click(
        within(drawer).getByRole('button', { name: 'Choose from library' }),
      )
      await expect(watch.clicks).toHaveLength(1)
      await expect(watch.clicks[0].drawerOpen).toBe(true)
      await expect(watch.clicks[0].input).not.toHaveAttribute('capture')
      await expect(watch.clicks[0].input).toHaveAttribute('multiple')
    } finally {
      watch.restore()
    }
  },
}

/** Escape closes the drawer without picking, and focus goes back to the button. */
export const TouchEscapeCloses: Story = {
  tags: ['!autodocs'],
  parameters: { touchScreen: true },
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body)
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Add photos',
    })
    await userEvent.click(trigger)
    await body.findByRole('dialog', { name: 'Add a photo' })
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())
  },
}

/** Profile and worker setup: the front camera for a selfie, one photo at a time. */
export const FrontCamera: Story = {
  args: { camera: 'user', multiple: false },
  play: async ({ canvasElement }) => {
    const camera = canvasElement.querySelector('input[capture]')
    await expect(camera).toHaveAttribute('capture', 'user')
    await expect(
      canvasElement.querySelector('input[type="file"]:not([capture])'),
    ).not.toHaveAttribute('multiple')
  },
}

/** A photo from the camera comes back through the same handler as the library. */
export const PhotoTaken: Story = {
  play: async ({ canvasElement }) => {
    const camera =
      canvasElement.querySelector<HTMLInputElement>('input[capture]')
    if (!camera) throw new Error('No camera input')
    await userEvent.upload(
      camera,
      new File(['shot'], 'camera.jpg', { type: 'image/jpeg' }),
    )
    await expect(
      within(canvasElement).getByText('Picked: camera.jpg'),
    ).toBeVisible()
  },
}
