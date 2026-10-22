import { describe, expect, it, vi } from 'vitest'

import {
  type CameraPermission,
  cameraConstraints,
  cameraFailure,
  cameraFileName,
  cameraPermission,
  needsSiteSettings,
  watchCameraPermission,
} from './camera'

/** An error like the ones `getUserMedia` rejects with. */
const failed = (name: string) => new DOMException('No camera', name)

describe('cameraConstraints', () => {
  it('asks for the back camera at up to 4K, video only', () => {
    expect(cameraConstraints('environment')).toEqual({
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 3840 },
        height: { ideal: 2160 },
      },
      audio: false,
    })
  })

  it('asks for the front camera for a selfie', () => {
    expect(cameraConstraints('user').video).toMatchObject({
      facingMode: { ideal: 'user' },
    })
  })
})

describe('cameraFailure', () => {
  it('says blocked when the person or the browser refused', () => {
    expect(cameraFailure(failed('NotAllowedError'))).toBe('blocked')
  })

  it('says busy when another app has the camera', () => {
    expect(cameraFailure(failed('NotReadableError'))).toBe('busy')
  })

  it('says unavailable when there is no camera to open', () => {
    expect(cameraFailure(failed('NotFoundError'))).toBe('unavailable')
    expect(cameraFailure(failed('OverconstrainedError'))).toBe('unavailable')
    expect(cameraFailure(failed('NotSupportedError'))).toBe('unavailable')
  })

  it('says unavailable for anything else', () => {
    expect(cameraFailure(new TypeError('getUserMedia is missing'))).toBe(
      'unavailable',
    )
    expect(cameraFailure(undefined)).toBe('unavailable')
    expect(cameraFailure('NotAllowedError')).toBe('unavailable')
  })
})

describe('cameraPermission', () => {
  it('passes on the three states a browser reports', () => {
    expect(cameraPermission('granted')).toBe('granted')
    expect(cameraPermission('prompt')).toBe('prompt')
    expect(cameraPermission('denied')).toBe('denied')
  })

  it('says unknown for anything else', () => {
    expect(cameraPermission('maybe')).toBe('unknown')
    expect(cameraPermission(undefined)).toBe('unknown')
    expect(cameraPermission(null)).toBe('unknown')
  })
})

describe('needsSiteSettings', () => {
  it('sends the person to the site settings when the browser will not ask', () => {
    expect(needsSiteSettings('denied', false)).toBe(true)
    expect(needsSiteSettings('denied', true)).toBe(true)
  })

  it('asks again while the browser still can, even after a dismissed prompt', () => {
    expect(needsSiteSettings('prompt', false)).toBe(false)
    expect(needsSiteSettings('prompt', true)).toBe(false)
    expect(needsSiteSettings('granted', true)).toBe(false)
  })

  it('asks once where the browser cannot say, and again points to settings if refused', () => {
    expect(needsSiteSettings('unknown', false)).toBe(false)
    expect(needsSiteSettings('unknown', true)).toBe(true)
  })
})

describe('watchCameraPermission', () => {
  /** Permissions like a browser's, with a camera status the test can change. */
  function browserPermissions(state: string) {
    const status = Object.assign(new EventTarget(), { state })
    const query = vi.fn(async (_descriptor: { name: string }) => status)
    return {
      permissions: { query } as unknown as Pick<Permissions, 'query'>,
      query,
      change: (next: string) => {
        status.state = next
        status.dispatchEvent(new Event('change'))
      },
    }
  }

  const listener = () =>
    vi.fn<(permission: CameraPermission, changed: boolean) => void>()

  /** Lets the browser's answer arrive. */
  const answered = () => new Promise((resolve) => setTimeout(resolve, 0))

  it('asks about the camera and reports its state, not as a change', async () => {
    const browser = browserPermissions('denied')
    const onState = listener()
    watchCameraPermission(browser.permissions, onState)
    await vi.waitFor(() =>
      expect(onState).toHaveBeenCalledWith('denied', false),
    )
    expect(browser.query).toHaveBeenCalledWith({ name: 'camera' })
    expect(onState).toHaveBeenCalledTimes(1)
  })

  it('reports every change after that', async () => {
    const browser = browserPermissions('denied')
    const onState = listener()
    watchCameraPermission(browser.permissions, onState)
    await vi.waitFor(() => expect(onState).toHaveBeenCalledTimes(1))

    browser.change('granted')
    expect(onState).toHaveBeenLastCalledWith('granted', true)
    browser.change('prompt')
    expect(onState).toHaveBeenLastCalledWith('prompt', true)
    expect(onState).toHaveBeenCalledTimes(3)
  })

  it('reports a state it does not know as unknown', async () => {
    const onState = listener()
    watchCameraPermission(browserPermissions('maybe').permissions, onState)
    await vi.waitFor(() =>
      expect(onState).toHaveBeenCalledWith('unknown', false),
    )
  })

  it('stops listening when told to', async () => {
    const browser = browserPermissions('denied')
    const onState = listener()
    const stop = watchCameraPermission(browser.permissions, onState)
    await vi.waitFor(() => expect(onState).toHaveBeenCalledTimes(1))

    stop()
    browser.change('granted')
    expect(onState).toHaveBeenCalledTimes(1)
  })

  it('never starts listening if told to stop before the browser answered', async () => {
    const browser = browserPermissions('denied')
    const onState = listener()
    const stop = watchCameraPermission(browser.permissions, onState)
    stop()
    await answered()

    browser.change('granted')
    expect(onState).not.toHaveBeenCalled()
  })

  it('says nothing where the browser throws for the camera', async () => {
    const onState = listener()
    const permissions = {
      query: () => {
        throw new TypeError("'camera' is not a valid permission name")
      },
    } as unknown as Pick<Permissions, 'query'>
    expect(() => watchCameraPermission(permissions, onState)).not.toThrow()
    await answered()
    expect(onState).not.toHaveBeenCalled()
  })

  it('says nothing where the browser rejects the camera', async () => {
    const onState = listener()
    const permissions = {
      query: async () => {
        throw new TypeError("'camera' is not a valid permission name")
      },
    } as unknown as Pick<Permissions, 'query'>
    watchCameraPermission(permissions, onState)
    await answered()
    expect(onState).not.toHaveBeenCalled()
  })

  it('says nothing in a browser without the Permissions API', async () => {
    const onState = listener()
    const stop = watchCameraPermission(undefined, onState)
    await answered()
    expect(onState).not.toHaveBeenCalled()
    expect(() => stop()).not.toThrow()
  })
})

describe('cameraFileName', () => {
  it('names the photo after the moment it was taken', () => {
    expect(cameraFileName(new Date(1_792_000_000_000))).toBe(
      'camera-1792000000000.jpg',
    )
  })
})
