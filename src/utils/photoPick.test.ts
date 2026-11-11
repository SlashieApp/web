import { describe, expect, it } from 'vitest'

import { acceptPhotos } from './photoPick'

const file = (name: string, type: string, bytes = 10) =>
  new File([new Uint8Array(bytes)], name, { type })

describe('acceptPhotos', () => {
  const limits = { max: 3, maxMb: 1 }

  it('takes photos up to the limit and says the rest were too many, once', () => {
    const picked = [1, 2, 3, 4].map((n) => file(`${n}.jpg`, 'image/jpeg'))
    const { accepted, rejected } = acceptPhotos(picked, 1, limits)
    expect(accepted.map((f) => f.name)).toEqual(['1.jpg', '2.jpg'])
    expect(rejected).toEqual([{ reason: 'tooMany' }])
  })

  it('names what it turns away and why', () => {
    const { accepted, rejected } = acceptPhotos(
      [
        file('notes.pdf', 'application/pdf'),
        file('clip.gif', 'image/gif'),
        file('huge.jpg', 'image/jpeg', 1024 * 1024 + 1),
        file('fine.png', 'image/png'),
      ],
      0,
      limits,
    )
    expect(accepted.map((f) => f.name)).toEqual(['fine.png'])
    expect(rejected).toEqual([
      { reason: 'notAPhoto', name: 'notes.pdf' },
      { reason: 'unsupportedType', name: 'clip.gif' },
      { reason: 'tooLarge', name: 'huge.jpg' },
    ])
  })

  it('takes a HEIC the browser gave no type', () => {
    const { accepted } = acceptPhotos([file('IMG_0001.HEIC', '')], 0, limits)
    expect(accepted).toHaveLength(1)
  })

  it('a different place has its own limit', () => {
    const picked = Array.from({ length: 13 }, (_, i) =>
      file(`${i}.jpg`, 'image/jpeg'),
    )
    expect(
      acceptPhotos(picked, 0, { max: 12, maxMb: 10 }).accepted,
    ).toHaveLength(12)
  })
})
