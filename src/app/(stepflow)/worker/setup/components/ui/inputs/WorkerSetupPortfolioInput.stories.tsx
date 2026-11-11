import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { storyImage } from '@/app/(stepflow)/stepflowStoryHelpers'

import {
  WorkerSetupPortfolioInput,
  type WorkerSetupPortfolioInputProps,
} from './WorkerSetupPortfolioInput'

function ControlledPortfolio(
  props: Omit<WorkerSetupPortfolioInputProps, 'onChange'>,
) {
  const [value, setValue] = useState(props.value)
  return (
    <WorkerSetupPortfolioInput {...props} value={value} onChange={setValue} />
  )
}

/** An uploaded photo: a data image stands in for one on our storage. */
const photo = (color: string) => storyImage(color, 120)
const OLD_LINK = 'https://kitchens.example.invalid/before-and-after.jpg'

/** A photo file the picker accepts. */
const file = (name: string, type = 'image/jpeg') =>
  new File(['photo'], name, { type })

/** The hidden library input the Add photos tile opens with a mouse. */
const library = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLInputElement>(
    'input[type="file"]:not([capture])',
  ) as HTMLInputElement

const meta = {
  title: 'Worker setup/WorkerSetupPortfolioInput',
  component: WorkerSetupPortfolioInput,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    value: [],
    onChange: () => {},
    // Each story upload "stores" a new coloured photo.
    upload: async (picked: File) =>
      photo(`hsl(${picked.name.length * 37}, 60%, 70%)`),
  },
  render: (args) => (
    <Box maxW="560px">
      <ControlledPortfolio {...args} />
    </Box>
  ),
} satisfies Meta<WorkerSetupPortfolioInputProps>

export default meta

type Story = StoryObj<typeof meta>

/** Empty: the dashed Add photos tile and the helper. No link field. */
export const Empty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('button', { name: 'Add photos' }),
    ).toBeVisible()
    await expect(canvas.queryByRole('textbox')).toBeNull()
    await expect(canvas.queryByPlaceholderText(/https/)).toBeNull()
  },
}

/** Uploaded photos as tiles, each with its remove button, and the count. */
export const WithPhotos: Story = {
  args: { value: [photo('#9ec5e8'), photo('#f2c1a0'), photo('#b7e0b1')] },
}

/** Removing a photo takes its tile away and the count down. */
export const RemovePhoto: Story = {
  args: WithPhotos.args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('3 of 12')).toBeVisible()
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove photo 2' }),
    )
    await expect(canvas.getByText('2 of 12')).toBeVisible()
    await expect(canvas.getAllByRole('img')).toHaveLength(2)
  },
}

/** Twelve photos: the Add photos tile is gone and the helper says why. */
export const AtCap: Story = {
  args: {
    value: Array.from({ length: 12 }, (_, i) =>
      photo(`hsl(${i * 30}, 60%, 75%)`),
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.queryByRole('button', { name: 'Add photos' }),
    ).toBeNull()
    await expect(canvas.getByText('You can add up to 12 photos.')).toBeVisible()
  },
}

/**
 * A link saved before uploads existed (BE-120): listed apart as text, never
 * drawn as an image, with a way to remove it.
 */
export const OldLinks: Story = {
  args: { value: [photo('#9ec5e8'), OLD_LINK] },
}

/** The old link is text, not an image, and its remove button clears the notice. */
export const RemoveOldLink: Story = {
  args: OldLinks.args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByText('Links are no longer shown on your profile'),
    ).toBeVisible()
    await expect(canvas.getByText(OLD_LINK)).toBeVisible()
    // Only the uploaded photo is an image: the link's host is never asked for it.
    await expect(canvas.getAllByRole('img')).toHaveLength(1)
    await expect(
      canvasElement.querySelector(`img[src="${OLD_LINK}"]`),
    ).toBeNull()
    await userEvent.click(
      canvas.getByRole('button', { name: `Remove link ${OLD_LINK}` }),
    )
    await expect(
      canvas.queryByText('Links are no longer shown on your profile'),
    ).toBeNull()
  },
}

/**
 * Picking photos uploads them straight away: a tile says "Uploading photo…",
 * the form is told to wait, and each photo joins the list as it lands.
 */
export const Uploading: Story = {
  args: {
    onUploadingChange: fn(),
    upload: fn(
      (picked: File) =>
        new Promise<string>((resolve) => {
          setTimeout(
            () =>
              resolve(photo(picked.name === 'one.jpg' ? '#9ec5e8' : '#f2c1a0')),
            300,
          )
        }),
    ),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.upload(library(canvasElement), [
      file('one.jpg'),
      file('two.jpg'),
    ])
    await expect(
      canvas.getAllByText('Uploading photo…').length,
    ).toBeGreaterThan(0)
    await waitFor(() =>
      expect(args.onUploadingChange).toHaveBeenCalledWith(true),
    )
    await waitFor(() => expect(canvas.getByText('2 of 12')).toBeVisible(), {
      timeout: 3000,
    })
    await waitFor(() => expect(canvas.getAllByRole('img')).toHaveLength(2))
    await expect(canvas.queryByText('Uploading photo…')).toBeNull()
    await waitFor(() =>
      expect(args.onUploadingChange).toHaveBeenLastCalledWith(false),
    )
    await expect(args.upload).toHaveBeenCalledTimes(2)
  },
}

/** A photo that fails to upload is named in a message; the others still land. */
export const UploadFails: Story = {
  args: {
    upload: async (picked: File) => {
      if (picked.name === 'broken.jpg') throw new Error('network')
      return photo('#b7e0b1')
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.upload(library(canvasElement), [
      file('broken.jpg'),
      file('fine.jpg'),
    ])
    await waitFor(() =>
      expect(
        canvas.getByText("broken.jpg didn't upload. Try again."),
      ).toBeVisible(),
    )
    await waitFor(() => expect(canvas.getAllByRole('img')).toHaveLength(1))
    await expect(canvas.getByRole('alert')).toBeVisible()
  },
}

/** A file that is not a photo, or a type we can't use, is turned away by name. */
export const RejectsOtherFiles: Story = {
  args: { upload: fn(async () => photo('#b7e0b1')) },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.upload(
      library(canvasElement),
      [file('notes.pdf', 'application/pdf'), file('clip.gif', 'image/gif')],
      { applyAccept: false },
    )
    await expect(
      canvas.getByText("notes.pdf isn't a photo, so it wasn't added."),
    ).toBeVisible()
    await expect(
      canvas.getByText(
        "clip.gif wasn't added. Use a JPG, PNG, WebP, HEIC or AVIF photo.",
      ),
    ).toBeVisible()
    await expect(args.upload).not.toHaveBeenCalled()
  },
}

/** Picking more than fit: the photos up to twelve upload, the rest are left out. */
export const TooMany: Story = {
  args: {
    value: Array.from({ length: 11 }, (_, i) =>
      photo(`hsl(${i * 30}, 60%, 75%)`),
    ),
    upload: fn(async () => photo('#333333')),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.upload(library(canvasElement), [
      file('a.jpg'),
      file('b.jpg'),
    ])
    await waitFor(() => expect(canvas.getByText('12 of 12')).toBeVisible())
    await expect(args.upload).toHaveBeenCalledTimes(1)
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'You can add up to 12 photos.',
    )
  },
}
