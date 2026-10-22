import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useRef, useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import {
  storyHeicPhoto,
  storyImage,
  takeStoryPhoto,
} from '@/app/(stepflow)/stepflowStoryHelpers'

import {
  type TaskPhotoTile,
  useTaskPhotos,
} from '../../../helpers/useTaskPhotos'
import {
  CreateTaskVisualsSection,
  type CreateTaskVisualsSectionProps,
} from './CreateTaskVisualsSection'

/** A picked photo already showing its preview. */
function photo(key: string, color: string): TaskPhotoTile {
  return { key, state: 'ready', src: storyImage(color, 176) }
}

type DemoProps = Pick<
  CreateTaskVisualsSectionProps,
  'bare' | 'sectionHeading' | 'existingImageUrls' | 'rejected'
> & { initial?: TaskPhotoTile[] }

/** Tiles in a given state; photos picked here show straight away. */
function CreateTaskVisualsSectionDemo({ initial = [], ...props }: DemoProps) {
  const [photos, setPhotos] = useState(initial)
  const nextRef = useRef(0)
  return (
    <CreateTaskVisualsSection
      {...props}
      photos={photos}
      onFilesAdded={(added) =>
        setPhotos((prev) => [
          ...prev,
          ...added.map(
            (file): TaskPhotoTile => ({
              key: `picked-${nextRef.current++}`,
              state: 'ready',
              src: URL.createObjectURL(file),
            }),
          ),
        ])
      }
      onRemoveFile={(index) =>
        setPhotos((prev) => prev.filter((_, i) => i !== index))
      }
    />
  )
}

/** The section on the real `useTaskPhotos`, which converts HEIC photos. */
function LiveTaskPhotos() {
  const photos = useTaskPhotos()
  return (
    <CreateTaskVisualsSection
      bare
      photos={photos.tiles}
      rejected={photos.rejected}
      onFilesAdded={photos.add}
      onRemoveFile={photos.remove}
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

/** No photos yet, with a mouse: one dashed Add photos tile that opens the file picker. */
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

/** Phones and tablets: Add photos offers our camera or the library; a shot joins the photos. */
export const TouchScreen: Story = {
  parameters: { touchScreen: true },
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole('button', { name: 'Add photos' }))
    const drawer = await body.findByRole('dialog', { name: 'Add a photo' })
    await expect(
      within(drawer).getByRole('button', { name: 'Choose from library' }),
    ).toBeVisible()
    await takeStoryPhoto(drawer)
    // The camera and the drawer under it have closed.
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())
    await expect(
      await canvas.findByRole('button', { name: 'Photo 1' }),
    ).toBeVisible()
  },
}

/** Two photos picked: previews (tap to view) with a remove button on each. */
export const WithPhotos: Story = {
  args: {
    initial: [photo('pipe', '#9ec5e8'), photo('sink', '#f0c987')],
  },
}

/** A HEIC photo converting: its tile says so (busy) until the preview is ready. */
export const ConvertingPhoto: Story = {
  args: {
    initial: [
      photo('pipe', '#9ec5e8'),
      { key: 'heic', state: 'converting', src: null },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const text = canvas.getByText('Converting photo…')
    await expect(text).toBeVisible()
    await expect(text.closest('[aria-busy="true"]')).toHaveTextContent(
      'Photo 2',
    )
    await expect(
      canvas.getByRole('button', { name: 'Remove photo 2' }),
    ).toBeVisible()
  },
}

/** A HEIC this browser couldn't convert: no preview, but it still uploads. */
export const PreviewNotAvailable: Story = {
  args: {
    initial: [
      { key: 'heic', state: 'unavailable', src: null },
      photo('sink', '#f0c987'),
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const text = canvas.getByText('Preview not available')
    await expect(text).toBeVisible()
    await expect(text.parentElement).toHaveTextContent('Photo 1')
    // Full screen pages through the photos it can show.
    await userEvent.click(canvas.getByRole('button', { name: 'Photo 2' }))
    const dialog = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog',
      { name: 'Photo preview' },
    )
    const shown = await within(dialog).findByRole('img', { name: 'Photo 2' })
    await waitFor(() => expect(shown).toBeVisible())
  },
}

/** A real HEIC picked in Chromium: "Converting photo…", then its preview. */
export const HeicConverts: Story = {
  render: () => <LiveTaskPhotos />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const library = canvasElement.querySelector<HTMLInputElement>(
      'input[type="file"]:not([capture])',
    )
    if (!library) throw new Error('No library input')
    await userEvent.upload(library, await storyHeicPhoto())
    await expect(await canvas.findByText('Converting photo…')).toBeVisible()
    const preview = await canvas.findByRole(
      'img',
      { name: 'Photo 1' },
      { timeout: 15_000 },
    )
    await waitFor(() =>
      expect((preview as HTMLImageElement).naturalWidth).toBe(240),
    )
    await expect(canvas.queryByText('Converting photo…')).toBeNull()
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
    initial: [photo('angle', '#f0c987')],
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
