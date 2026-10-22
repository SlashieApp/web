import { describe, expect, it } from 'vitest'

import { isHeicFile, jpegFileName } from './heicPhoto'

const file = (name: string, type = '') => ({ name, type })

describe('isHeicFile', () => {
  it('knows HEIC and HEIF by type', () => {
    expect(isHeicFile(file('IMG_0001', 'image/heic'))).toBe(true)
    expect(isHeicFile(file('IMG_0001', 'image/heif'))).toBe(true)
    expect(isHeicFile(file('burst', 'image/heic-sequence'))).toBe(true)
    expect(isHeicFile(file('IMG_0001', 'IMAGE/HEIC'))).toBe(true)
  })

  it('knows them by name when the browser leaves the type empty', () => {
    expect(isHeicFile(file('IMG_0001.HEIC'))).toBe(true)
    expect(isHeicFile(file('scan.heif'))).toBe(true)
    expect(isHeicFile(file('photo.heic', 'application/octet-stream'))).toBe(
      true,
    )
  })

  it('leaves other photos alone', () => {
    expect(isHeicFile(file('IMG_0001.jpg', 'image/jpeg'))).toBe(false)
    expect(isHeicFile(file('scan.png', 'image/png'))).toBe(false)
    expect(isHeicFile(file('photo.avif', 'image/avif'))).toBe(false)
    expect(isHeicFile(file('heic-notes.txt', 'text/plain'))).toBe(false)
    expect(isHeicFile(file('IMG_0001'))).toBe(false)
  })
})

describe('jpegFileName', () => {
  it('swaps the extension for .jpg', () => {
    expect(jpegFileName('IMG_0001.HEIC')).toBe('IMG_0001.jpg')
    expect(jpegFileName('holiday.photo.heif')).toBe('holiday.photo.jpg')
  })

  it('adds one when there is none', () => {
    expect(jpegFileName('IMG_0001')).toBe('IMG_0001.jpg')
    expect(jpegFileName('.heic')).toBe('.heic.jpg')
  })
})
