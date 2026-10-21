import { describe, expect, it } from 'vitest'

import { TASK_PHOTOS_MAX, acceptTaskPhotos } from './taskPhotos'

const photo = (name: string, mb = 1, type = 'image/jpeg') =>
  new File([new Uint8Array(Math.round(mb * 1024 * 1024))], name, { type })

describe('acceptTaskPhotos', () => {
  it('adds pictures under the limits', () => {
    const result = acceptTaskPhotos(
      [photo('a.jpg'), photo('b.png', 2, 'image/png')],
      0,
    )
    expect(result.accepted.map((f) => f.name)).toEqual(['a.jpg', 'b.png'])
    expect(result.rejected).toEqual([])
  })

  it('turns down a file that is not a picture', () => {
    const result = acceptTaskPhotos(
      [photo('notes.pdf', 1, 'application/pdf')],
      0,
    )
    expect(result.accepted).toEqual([])
    expect(result.rejected).toEqual([
      { reason: 'notAPhoto', name: 'notes.pdf' },
    ])
  })

  it('turns down a picture type the API cannot convert', () => {
    const result = acceptTaskPhotos(
      [photo('scan.bmp', 1, 'image/bmp'), photo('cat.gif', 1, 'image/gif')],
      0,
    )
    expect(result.rejected).toEqual([
      { reason: 'unsupportedType', name: 'scan.bmp' },
      { reason: 'unsupportedType', name: 'cat.gif' },
    ])
  })

  it('takes a photo with no extension when its type is allowed', () => {
    const result = acceptTaskPhotos([photo('IMG_0001', 1, 'image/heic')], 0)
    expect(result.accepted.map((f) => f.name)).toEqual(['IMG_0001'])
  })

  it('turns down a picture over 10 MB', () => {
    const result = acceptTaskPhotos([photo('huge.jpg', 11)], 0)
    expect(result.rejected).toEqual([{ reason: 'tooLarge', name: 'huge.jpg' }])
  })

  it(`stops at ${TASK_PHOTOS_MAX} photos, counting the ones already there`, () => {
    const picked = [photo('1.jpg'), photo('2.jpg'), photo('3.jpg')]
    const result = acceptTaskPhotos(picked, TASK_PHOTOS_MAX - 1)
    expect(result.accepted.map((f) => f.name)).toEqual(['1.jpg'])
    expect(result.rejected).toEqual([{ reason: 'tooMany' }])
  })
})
