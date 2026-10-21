import { describe, expect, it } from 'vitest'

import { shrunkPhotoSize } from './shrinkPhoto'

describe('shrunkPhotoSize', () => {
  it('fits the long edge to the limit, keeping the shape', () => {
    expect(shrunkPhotoSize(4000, 3000, 2048)).toEqual({
      width: 2048,
      height: 1536,
    })
    expect(shrunkPhotoSize(3000, 4000, 2048)).toEqual({
      width: 1536,
      height: 2048,
    })
    expect(shrunkPhotoSize(4032, 3024, 1024)).toEqual({
      width: 1024,
      height: 768,
    })
  })

  it('rounds to whole pixels without passing the limit', () => {
    expect(shrunkPhotoSize(5000, 3333, 2048)).toEqual({
      width: 2048,
      height: 1365,
    })
    expect(shrunkPhotoSize(4031, 4031, 1024)).toEqual({
      width: 1024,
      height: 1024,
    })
  })

  it('never enlarges a photo at or under the limit', () => {
    expect(shrunkPhotoSize(800, 600, 2048)).toEqual({ width: 800, height: 600 })
    expect(shrunkPhotoSize(1024, 500, 1024)).toEqual({
      width: 1024,
      height: 500,
    })
  })

  it('keeps at least 1 px on a very thin photo', () => {
    expect(shrunkPhotoSize(10000, 2, 1024)).toEqual({ width: 1024, height: 1 })
  })
})
