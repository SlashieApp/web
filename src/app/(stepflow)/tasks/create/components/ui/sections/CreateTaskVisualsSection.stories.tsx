import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

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
  'bare' | 'sectionHeading' | 'existingImageUrls'
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

/** No photos yet: just the dashed upload area and Upload button. */
export const Empty: Story = {}

/** Two photos picked: previews with a remove button on each. */
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

/** Card mode (edit page): the upload area sits in a titled section card. */
export const CardMode: Story = {
  args: { bare: false },
}
