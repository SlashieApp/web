import { ChakraProvider, type ChakraProviderProps } from '@chakra-ui/react'
import { createElement } from 'react'
import { type Root, createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import { lightSystem } from '@/theme/chakraSystem'

import { CameraCapture } from './CameraCapture'
import { type CameraFacing, cameraConstraints } from './camera'

// Chromium's fake camera (launch args in `vitest.config.mts`) answers
// getUserMedia here, with no prompt.

// `@ui` buttons and copy reach Next's router, which needs Next to load; the
// camera never navigates.
vi.mock('next/link', () => ({ default: () => null }))
vi.mock('next/navigation', () => ({ usePathname: () => '/' }))

const ended = (stream: MediaStream) =>
  stream.getTracks().every((track) => track.readyState === 'ended')

/**
 * Every stream the camera opens, and whether all the earlier ones had
 * stopped by the time it asked for the next.
 */
function watchCamera() {
  const media = navigator.mediaDevices
  const open = media.getUserMedia.bind(media)
  const streams: MediaStream[] = []
  const earlierStopped: boolean[] = []
  const spy = vi
    .spyOn(media, 'getUserMedia')
    .mockImplementation(async (constraints) => {
      earlierStopped.push(streams.every(ended))
      const stream = await open(constraints)
      streams.push(stream)
      return stream
    })
  return { spy, streams, earlierStopped }
}

let root: Root | null = null

/** Shows the camera, open, as the photo button does; returns the photos it hands over. */
function showCamera(facing: CameraFacing) {
  const photos: File[] = []
  const host = document.body.appendChild(document.createElement('div'))
  const view = createRoot(host)
  root = view
  const render = (open: boolean) =>
    view.render(
      createElement(
        ChakraProvider,
        // The child comes as the third argument; the type wants it in props.
        { value: lightSystem } as ChakraProviderProps,
        createElement(CameraCapture, {
          open,
          onOpenChange: render,
          facing,
          onPhoto: (file: File) => photos.push(file),
          fallbackActions: [],
        }),
      ),
    )
  render(true)
  return photos
}

/** Waits for the picture; returns the video's real size. */
async function live() {
  await expect
    .element(page.getByRole('button', { name: 'Take photo' }))
    .not.toHaveAttribute('aria-disabled')
  const video = document.querySelector('video')
  if (!video) throw new Error('No viewfinder')
  return { width: video.videoWidth, height: video.videoHeight }
}

afterEach(() => {
  root?.unmount()
  root = null
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe('CameraCapture', () => {
  it('takes a JPEG at the camera size, and the camera has stopped by Use photo', async () => {
    const camera = watchCamera()
    const photos = showCamera('environment')
    const size = await live()
    expect(camera.spy).toHaveBeenCalledWith(cameraConstraints('environment'))
    expect(size.width).toBeGreaterThan(0)

    await page.getByRole('button', { name: 'Take photo' }).click()
    const use = page.getByRole('button', { name: 'Use photo' })
    await expect.element(use).not.toHaveAttribute('aria-disabled')
    await use.click()
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument()

    expect(photos).toHaveLength(1)
    const [photo] = photos
    expect(photo.type).toBe('image/jpeg')
    expect(photo.name).toMatch(/^camera-\d+\.jpg$/)
    const bitmap = await createImageBitmap(photo)
    expect({ width: bitmap.width, height: bitmap.height }).toEqual(size)
    bitmap.close()
    expect(camera.streams).toHaveLength(1)
    expect(ended(camera.streams[0])).toBe(true)
  })

  it('stops the camera when it is closed without a photo', async () => {
    const camera = watchCamera()
    const photos = showCamera('user')
    await live()
    expect(camera.spy).toHaveBeenCalledWith(cameraConstraints('user'))
    expect(ended(camera.streams[0])).toBe(false)

    await page.getByRole('button', { name: 'Close camera' }).click()
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument()
    expect(photos).toHaveLength(0)
    expect(camera.streams.every(ended)).toBe(true)
  })

  /**
   * A browser that refuses the first request (the camera is not allowed yet)
   * and opens the camera once it is asked again. Notes whether the browser
   * saw a tap at each request.
   */
  function refuseFirstRequest() {
    const media = navigator.mediaDevices
    const open = media.getUserMedia.bind(media)
    const tapped: boolean[] = []
    const spy = vi
      .spyOn(media, 'getUserMedia')
      .mockImplementation(async (constraints) => {
        tapped.push(navigator.userActivation.isActive)
        if (tapped.length === 1) {
          throw new DOMException('Permission dismissed', 'NotAllowedError')
        }
        return open(constraints)
      })
    return { spy, tapped }
  }

  it('asks again from the tap on Allow camera, and opens the camera', async () => {
    const camera = refuseFirstRequest()
    showCamera('environment')
    const allow = page.getByRole('button', { name: 'Allow camera' })
    await expect.element(allow).toBeVisible()
    expect(camera.spy).toHaveBeenCalledTimes(1)

    await allow.click()
    await live()
    expect(camera.spy).toHaveBeenCalledTimes(2)
    expect(camera.spy).toHaveBeenLastCalledWith(
      cameraConstraints('environment'),
    )
    expect(camera.tapped[1]).toBe(true)
    await expect.element(allow).not.toBeInTheDocument()
  })

  it('opens the camera, with no tap, once the permission becomes allowed', async () => {
    const camera = refuseFirstRequest()
    const status = Object.assign(new EventTarget(), { state: 'denied' })
    vi.spyOn(navigator.permissions, 'query').mockResolvedValue(
      status as unknown as PermissionStatus,
    )
    showCamera('environment')
    await expect
      .element(page.getByRole('paragraph'))
      .toHaveTextContent(/blocked for this site/)

    status.state = 'granted'
    status.dispatchEvent(new Event('change'))
    await live()
    expect(camera.spy).toHaveBeenCalledTimes(2)
  })

  it('stops the back camera before it opens the front one', async () => {
    const camera = watchCamera()
    showCamera('environment')
    await live()

    await page.getByRole('button', { name: 'Switch camera' }).click()
    await vi.waitFor(() => expect(camera.streams).toHaveLength(2))
    await live()
    expect(camera.spy).toHaveBeenLastCalledWith(cameraConstraints('user'))
    expect(camera.earlierStopped).toEqual([true, true])
    expect(ended(camera.streams[1])).toBe(false)
  })
})
