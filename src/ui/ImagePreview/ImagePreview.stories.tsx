import { HStack, Image, chakra } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { LocaleProvider } from '@/i18n/LocaleProvider'
import { sdlFocusRing } from '@/theme/styles'

import { ImagePreview, type ImagePreviewItem } from './ImagePreview'

/** Inline SVG placeholder photo, so stories never fetch a remote image. */
function photo(label: string, from: string, to: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/><circle cx="610" cy="150" r="64" fill="#fff" fill-opacity=".35"/><path d="M0 470 230 300l190 130 150-110L800 440v160H0z" fill="#000" fill-opacity=".18"/><text x="400" y="320" text-anchor="middle" font-family="sans-serif" font-size="46" fill="#fff">${label}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/** Not a decodable image: fires `onError` without any network request. */
const brokenSrc = 'data:image/png;base64,AAAA'

const photos: ImagePreviewItem[] = [
  {
    src: photo('Kitchen tap', '#2f6f9f', '#8fc1de'),
    alt: 'Kitchen tap dripping into the sink',
  },
  {
    src: photo('Pipes', '#7a5a3a', '#d2b48c'),
    alt: 'Pipes under the sink',
  },
  {
    src: photo('Tools', '#3f6b4f', '#9bc9a6'),
    alt: 'Tools on a workbench',
  },
  {
    src: photo('Cabinet', '#8a3f6b', '#d9a6c4'),
    alt: 'Water marks inside the cabinet',
  },
  {
    src: photo('Floor', '#5a5f8a', '#b3b8e0'),
    alt: 'Tiles in front of the sink',
  },
]

const ThumbButton = chakra('button')

/** Thumbnails that open the preview at the tapped photo, as features wire it. */
function PreviewDemo({
  items,
  initialIndex,
}: {
  items: ImagePreviewItem[]
  initialIndex: number | null
}) {
  const [index, setIndex] = useState(initialIndex)
  return (
    <>
      <HStack gap={2} wrap="wrap">
        {items.map((item, i) => (
          <ThumbButton
            key={item.src}
            type="button"
            onClick={() => setIndex(i)}
            boxSize="88px"
            borderRadius="lg"
            overflow="hidden"
            borderWidth="1px"
            borderColor="border.default"
            bg="bg.subtle"
            cursor="zoom-in"
            _focusVisible={sdlFocusRing}
          >
            <Image
              src={item.src}
              alt={item.alt}
              w="full"
              h="full"
              objectFit="cover"
            />
          </ThumbButton>
        ))}
      </HStack>
      <ImagePreview
        items={items}
        index={index}
        onIndexChange={setIndex}
        onClose={() => setIndex(null)}
      />
    </>
  )
}

/**
 * SDL ImagePreview. Full-screen photo viewer over a blurred, dark scrim, with
 * zoom (buttons, wheel, pinch, double-tap), pan, and previous/next for several
 * photos. Controls use the mode-independent `bg.inverted*` roles.
 */
const meta = {
  title: 'UI/ImagePreview',
  component: ImagePreview,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    // The open viewer covers the page, so Docs renders each story in an iframe.
    docs: { story: { inline: false, iframeHeight: 560 } },
  },
  args: {
    items: photos,
    index: 0,
    onIndexChange: fn(),
    onClose: fn(),
  },
  render: (args) => (
    <PreviewDemo items={args.items} initialIndex={args.index} />
  ),
} satisfies Meta<typeof ImagePreview>

export default meta
type Story = StoryObj<typeof meta>

function page(canvasElement: HTMLElement) {
  return within(canvasElement.ownerDocument.body)
}

async function findPreview(canvasElement: HTMLElement) {
  const dialog = await page(canvasElement).findByRole(
    'dialog',
    { name: 'Photo preview' },
    { timeout: 3000 },
  )
  await waitFor(() => expect(dialog).toBeVisible())
  return within(dialog)
}

/** One photo: no previous/next and no counter; Close shuts it. */
export const SinglePhoto: Story = {
  args: { items: photos.slice(0, 1) },
  play: async ({ canvasElement }) => {
    const preview = await findPreview(canvasElement)
    await expect(
      preview.getByRole('img', { name: photos[0].alt }),
    ).toBeInTheDocument()
    await expect(
      preview.queryByRole('button', { name: 'Next photo' }),
    ).toBeNull()
    await expect(preview.queryByText('1 of 1')).toBeNull()
    await userEvent.click(preview.getByRole('button', { name: 'Close' }))
    await waitFor(() =>
      expect(page(canvasElement).queryByRole('dialog')).toBeNull(),
    )
  },
}

/** Several photos: the counter, previous/next and arrow keys, looping at the ends. */
export const SeveralPhotos: Story = {
  args: { index: 1 },
  play: async ({ canvasElement }) => {
    const preview = await findPreview(canvasElement)
    await preview.findByText('2 of 5')
    await userEvent.click(preview.getByRole('button', { name: 'Next photo' }))
    await preview.findByText('3 of 5')
    await preview.findByRole('img', { name: photos[2].alt })
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}')
    await preview.findByText('1 of 5')
    await userEvent.click(
      preview.getByRole('button', { name: 'Previous photo' }),
    )
    await preview.findByText('5 of 5')
  },
}

/** Zoomed in with +: zoom out comes alive, and the next photo starts fitted again. */
export const ZoomedIn: Story = {
  play: async ({ canvasElement }) => {
    const preview = await findPreview(canvasElement)
    const zoomIn = preview.getByRole('button', { name: 'Zoom in' })
    const zoomOut = preview.getByRole('button', { name: 'Zoom out' })
    await expect(zoomOut).toHaveAttribute('aria-disabled', 'true')
    for (let i = 0; i < 3; i++) await userEvent.click(zoomIn)
    const img = preview.getByRole('img', { name: photos[0].alt })
    await waitFor(() => expect(img.style.transform).toContain('scale(4)'))
    await expect(zoomIn).toHaveAttribute('aria-disabled', 'true')
    await expect(zoomOut).not.toHaveAttribute('aria-disabled')
    await userEvent.click(preview.getByRole('button', { name: 'Next photo' }))
    const next = await preview.findByRole('img', { name: photos[1].alt })
    await expect(next.style.transform).toContain('scale(1)')
    await expect(zoomOut).toHaveAttribute('aria-disabled', 'true')
  },
}

/** Double-click (double-tap on touch) zooms to 2x there, and again back to fitted. */
export const DoubleClickZoom: Story = {
  play: async ({ canvasElement }) => {
    const preview = await findPreview(canvasElement)
    const img = preview.getByRole('img', { name: photos[0].alt })
    await userEvent.dblClick(img)
    await waitFor(() => expect(img.style.transform).toContain('scale(2)'))
    await userEvent.dblClick(img)
    await waitFor(() => expect(img.style.transform).toContain('scale(1)'))
  },
}

/** Wheel or trackpad pinch zooms; dragging then pans, but never off screen. */
export const WheelZoomAndPan: Story = {
  play: async ({ canvasElement }) => {
    const preview = await findPreview(canvasElement)
    const img = preview.getByRole('img', { name: photos[0].alt })
    const box = img.getBoundingClientRect()
    const centre = {
      clientX: box.left + box.width / 2,
      clientY: box.top + box.height / 2,
    }
    for (let i = 0; i < 4; i++) {
      img.dispatchEvent(
        new WheelEvent('wheel', {
          ...centre,
          deltaY: -300,
          bubbles: true,
          cancelable: true,
        }),
      )
    }
    await waitFor(() => expect(img.style.transform).toContain('scale(4)'))
    // Drag far to the right: the photo stops with its left edge at the screen edge.
    const dragged = { ...centre, clientX: centre.clientX + 5000 }
    await userEvent.pointer([
      { keys: '[MouseLeft>]', target: img, coords: centre },
      { target: img, coords: dragged },
      { keys: '[/MouseLeft]', target: img, coords: dragged },
    ])
    const stage = img.parentElement as HTMLElement
    const maxX = (img.offsetWidth * 4 - stage.clientWidth) / 2
    await waitFor(() =>
      expect(img.style.transform).toContain(`translate3d(${maxX}px`),
    )
  },
}

/** Dragging sideways when not zoomed changes photo, like a swipe on touch. */
export const SwipeToNext: Story = {
  play: async ({ canvasElement }) => {
    const preview = await findPreview(canvasElement)
    const img = preview.getByRole('img', { name: photos[0].alt })
    const box = img.getBoundingClientRect()
    const start = { clientX: box.left + box.width / 2, clientY: box.top + 50 }
    const end = { ...start, clientX: start.clientX - 120 }
    await userEvent.pointer([
      { keys: '[MouseLeft>]', target: img, coords: start },
      { target: img, coords: end },
      { keys: '[/MouseLeft]', target: img, coords: end },
    ])
    await preview.findByText('2 of 5')
  },
}

/** A photo that fails to load: "Photo unavailable" in its place, zoom off. */
export const BrokenImage: Story = {
  args: {
    items: [{ src: brokenSrc, alt: 'Photo that will not load' }, photos[1]],
  },
  play: async ({ canvasElement }) => {
    const preview = await findPreview(canvasElement)
    await preview.findByText('Photo unavailable')
    await expect(
      preview.getByRole('button', { name: 'Zoom in' }),
    ).toHaveAttribute('aria-disabled', 'true')
  },
}

/** Closed: a thumbnail opens its photo; Escape closes and focus goes back to it. */
export const OpenFromThumbnail: Story = {
  args: { items: photos.slice(0, 3), index: null },
  play: async ({ canvasElement }) => {
    const thumb = within(canvasElement).getByRole('button', {
      name: photos[1].alt,
    })
    await userEvent.click(thumb)
    const preview = await findPreview(canvasElement)
    await preview.findByText('2 of 3')
    await userEvent.keyboard('{Escape}')
    await waitFor(() =>
      expect(page(canvasElement).queryByRole('dialog')).toBeNull(),
    )
    await waitFor(() => expect(thumb).toHaveFocus())
  },
}

/** Phone: the photo fills the width; swipe or the arrows change photo. */
export const Phone: Story = {
  args: { index: 2 },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Traditional Chinese copy (from the `/zh-hk` URL prefix). */
export const TraditionalChinese: Story = {
  args: { index: 1 },
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/tasks' } } },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const dialog = await page(canvasElement).findByRole(
      'dialog',
      { name: '相片預覽' },
      { timeout: 3000 },
    )
    await waitFor(() => expect(dialog).toBeVisible())
    await within(dialog).findByText('2 / 5')
    await expect(
      within(dialog).getByRole('button', { name: '下一張相片' }),
    ).toBeVisible()
  },
}
