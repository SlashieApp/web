import { describe, expect, it } from 'vitest'

import { cameraConstraints, cameraFailure, cameraFileName } from './camera'

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

describe('cameraFileName', () => {
  it('names the photo after the moment it was taken', () => {
    expect(cameraFileName(new Date(1_792_000_000_000))).toBe(
      'camera-1792000000000.jpg',
    )
  })
})
