import { describe, expect, it } from 'vitest'

import { convertHeicPhoto } from './heicPhoto'
import { shrinkPhoto } from './shrinkPhoto'

/**
 * A real HEIC (HEVC in a HEIF box, written by libheif): 240 x 160, red,
 * green, blue and yellow quarters. Chromium can't decode HEIC, so these
 * tests run the converter.
 */
async function heicFixture(name = 'IMG_0001.HEIC', type = 'image/heic') {
  const url = new URL('./heicPhoto.fixture.heic', import.meta.url)
  const bytes = await (await fetch(url)).arrayBuffer()
  return new File([bytes], name, { type, lastModified: 1_700_000_000_000 })
}

/** The decoded size and the RGB at the middle of each quarter. */
async function read(blob: Blob) {
  const bitmap = await createImageBitmap(blob)
  const { width, height } = bitmap
  const canvas = new OffscreenCanvas(width, height)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('No 2D canvas')
  context.drawImage(bitmap, 0, 0)
  bitmap.close()
  const quarters = [
    [width / 4, height / 4],
    [(3 * width) / 4, height / 4],
    [width / 4, (3 * height) / 4],
    [(3 * width) / 4, (3 * height) / 4],
  ].map(([x, y]) =>
    Array.from(context.getImageData(x, y, 1, 1).data.slice(0, 3)),
  )
  return { size: { width, height }, quarters }
}

const close = (actual: number[], expected: number[]) =>
  actual.every((value, i) => Math.abs(value - expected[i]) <= 16)

describe('convertHeicPhoto', () => {
  it('turns a HEIC this browser cannot decode into a decodable JPEG', async () => {
    const heic = await heicFixture()
    await expect(createImageBitmap(heic)).rejects.toThrow()

    const jpeg = await convertHeicPhoto(heic)
    expect(jpeg).not.toBe(heic)
    expect(jpeg.type).toBe('image/jpeg')
    expect(jpeg.name).toBe('IMG_0001.jpg')
    expect(jpeg.lastModified).toBe(heic.lastModified)
    const bytes = new Uint8Array(await jpeg.slice(0, 3).arrayBuffer())
    expect(Array.from(bytes)).toEqual([0xff, 0xd8, 0xff])

    const { size, quarters } = await read(jpeg)
    expect(size).toEqual({ width: 240, height: 160 })
    expect(close(quarters[0], [229, 57, 53])).toBe(true)
    expect(close(quarters[1], [67, 160, 71])).toBe(true)
    expect(close(quarters[2], [30, 136, 229])).toBe(true)
    expect(close(quarters[3], [253, 216, 53])).toBe(true)
  })

  it('converts a HEIC picked with no type, known by its name', async () => {
    const jpeg = await convertHeicPhoto(await heicFixture('scan.heif', ''))
    expect(jpeg.name).toBe('scan.jpg')
    expect((await read(jpeg)).size).toEqual({ width: 240, height: 160 })
  })

  it('gives the JPEG to the upload shrink like any other photo', async () => {
    const jpeg = await convertHeicPhoto(await heicFixture())
    const shrunk = await shrinkPhoto(jpeg, 120)
    expect(shrunk.type).toBe('image/jpeg')
    expect((await read(shrunk)).size).toEqual({ width: 120, height: 80 })
  })

  it('keeps a photo this browser decodes itself, as Safari does HEIC', async () => {
    const canvas = new OffscreenCanvas(30, 20)
    canvas.getContext('2d')?.fillRect(0, 0, 30, 20)
    const png = await canvas.convertToBlob({ type: 'image/png' })
    const decodable = new File([png], 'IMG_0002.HEIC', { type: 'image/heic' })
    expect(await convertHeicPhoto(decodable)).toBe(decodable)
  })

  it('fails on a file that is not really a HEIC', async () => {
    const broken = new File([new Uint8Array(512)], 'IMG_0003.HEIC', {
      type: 'image/heic',
    })
    let failed = false
    await convertHeicPhoto(broken).catch(() => {
      failed = true
    })
    expect(failed).toBe(true)
  })

  it('converts photos picked together one after another', async () => {
    const photos = await Promise.all([heicFixture('a.heic'), heicFixture()])
    const jpegs = await Promise.all(photos.map(convertHeicPhoto))
    expect(jpegs.map((jpeg) => jpeg.name)).toEqual(['a.jpg', 'IMG_0001.jpg'])
  })
})
