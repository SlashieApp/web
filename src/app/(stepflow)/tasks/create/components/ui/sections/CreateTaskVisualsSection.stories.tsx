import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { storyImage } from '@/app/(stepflow)/stepflowStoryHelpers'

import {
  CreateTaskVisualsSection,
  type CreateTaskVisualsSectionProps,
} from './CreateTaskVisualsSection'

function photo(name: string, color: string) {
  return {
    file: new File([name], name, { type: 'image/jpeg' }),
    preview: storyImage(color, 176),
  }
}

type DemoProps = Pick<
  CreateTaskVisualsSectionProps,
  'bare' | 'sectionHeading' | 'existingImageUrls' | 'rejected'
> & { initial?: ReturnType<typeof photo>[] }

function CreateTaskVisualsSectionDemo({ initial = [], ...props }: DemoProps) {
  const [photos, setPhotos] = useState(initial)
  return (
    <CreateTaskVisualsSection
      {...props}
      files={photos.map((p) => p.file)}
      previews={photos.map((p) => p.preview)}
      onFilesAdded={(added) =>
        setPhotos((prev) => [
          ...prev,
          ...added.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
          })),
        ])
      }
      onRemoveFile={(index) =>
        setPhotos((prev) => prev.filter((_, i) => i !== index))
      }
    />
  )
}

const meta = {
  title: 'Create task/CreateTaskVisualsSection',
  component: CreateTaskVisualsSectionDemo,
  parameters: { layout: 'padded' },
  args: { bare: true },
} satisfies Meta<typeof CreateTaskVisualsSectionDemo>

export default meta
type Story = StoryObj<typeof meta>

/** No photos yet, with a mouse: just the dashed Add photos tile (no Take photo). */
export const Empty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('button', { name: 'Add photos' }),
    ).toBeVisible()
    await expect(
      canvas.queryByRole('button', { name: 'Take photo' }),
    ).toBeNull()
  },
}

/** Phones and tablets: a Take photo tile opens the back camera; its shot joins the photos. */
export const TouchScreen: Story = {
  globals: { touch: 'on', viewport: { value: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('button', { name: 'Take photo' }),
    ).toBeVisible()
    const camera =
      canvasElement.querySelector<HTMLInputElement>('input[capture]')
    if (!camera) throw new Error('No camera input')
    await expect(camera).toHaveAttribute('capture', 'environment')
    await expect(camera).toHaveAttribute('accept', 'image/*')
    await userEvent.upload(
      camera,
      new File(['shot'], 'camera.jpg', { type: 'image/jpeg' }),
    )
    await expect(
      await canvas.findByRole('button', { name: 'Photo 1' }),
    ).toBeVisible()
  },
}

/** Two photos picked: previews (tap to view) with a remove button on each. */
export const WithPhotos: Story = {
  args: {
    initial: [
      photo('leaking-pipe.jpg', '#9ec5e8'),
      photo('under-the-sink.jpg', '#f0c987'),
    ],
  },
}

/** Edit flow: photos already uploaded to the task, shown above new ones. */
export const ExistingPhotos: Story = {
  args: {
    existingImageUrls: [storyImage('#7fcfa6', 176), storyImage('#c9b3e8', 176)],
  },
}

/** Edit flow with a new photo added beside the uploaded ones. */
export const ExistingAndNewPhotos: Story = {
  args: {
    existingImageUrls: [storyImage('#7fcfa6', 176)],
    initial: [photo('new-angle.jpg', '#f0c987')],
  },
}

/** Tapping a photo opens it full screen; saved and new photos page through together. */
export const PreviewOpen: Story = {
  args: ExistingAndNewPhotos.args,
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Photo 2' }),
    )
    const dialog = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog',
      { name: 'Photo preview' },
    )
    await within(dialog).findByText('2 of 2')
  },
}

/** The remove button beside a new photo still takes it out (no preview opens). */
export const RemovePhoto: Story = {
  args: WithPhotos.args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove photo 1' }),
    )
    await waitFor(() =>
      expect(canvas.queryByRole('button', { name: 'Photo 2' })).toBeNull(),
    )
    await expect(canvas.getByRole('button', { name: 'Photo 1' })).toBeVisible()
    await expect(
      within(canvasElement.ownerDocument.body).queryByRole('dialog'),
    ).toBeNull()
  },
}

/** Card mode (edit page): the upload area sits in a titled section card. */
export const CardMode: Story = {
  args: { bare: false },
}

/** Picked files refused before upload: a PDF, and a BMP photo the API can't store. */
export const Rejected: Story = {
  args: {
    rejected: [
      { reason: 'notAPhoto', name: 'quote.pdf' },
      { reason: 'unsupportedType', name: 'scan.bmp' },
    ],
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText(
        "scan.bmp wasn't added. Use a JPG, PNG, WebP, HEIC or AVIF photo.",
      ),
    ).toBeVisible()
  },
}
