import { afterEach, describe, expect, it, vi } from 'vitest'

import { shrinkPhoto } from './shrinkPhoto'

/** A blue picture of `width` x `height`, its top-left quarter transparent. */
async function photo(
  width: number,
  height: number,
  type: 'image/png' | 'image/jpeg',
): Promise<Blob> {
  const canvas = new OffscreenCanvas(width, height)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('No 2D canvas')
  context.fillStyle = '#0000ff'
  context.fillRect(0, 0, width, height)
  context.clearRect(0, 0, width / 2, height / 2)
  return canvas.convertToBlob({ type })
}

/** Adds an EXIF block saying "turn 90 degrees clockwise" (orientation 6). */
async function withOrientation6(jpeg: Blob): Promise<Blob> {
  const bytes = new Uint8Array(await jpeg.arrayBuffer())
  // biome-ignore format: one EXIF field per line
  const app1 = new Uint8Array([
    0xff, 0xe1, 0x00, 0x22, // APP1, 34 bytes
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00, // "Exif"
    0x4d, 0x4d, 0x00, 0x2a, 0x00, 0x00, 0x00, 0x08, // TIFF, big-endian
    0x00, 0x01, // one entry
    0x01, 0x12, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, 0x00, 0x06, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, // no next IFD
  ])
  return new Blob([bytes.slice(0, 2), app1, bytes.slice(2)], {
    type: 'image/jpeg',
  })
}

function asFile(blob: Blob, name: string): File {
  return new File([blob], name, { type: blob.type })
}

/** The decoded size and the RGB at a few points of `blob`. */
async function read(blob: Blob, points: [number, number][]) {
  const bitmap = await createImageBitmap(blob)
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('No 2D canvas')
  context.drawImage(bitmap, 0, 0)
  const size = { width: bitmap.width, height: bitmap.height }
  bitmap.close()
  const colors = points.map(([x, y]) =>
    Array.from(context.getImageData(x, y, 1, 1).data.slice(0, 3)),
  )
  return { size, colors }
}

function hasExif(bytes: Uint8Array): boolean {
  return new TextDecoder('latin1').decode(bytes).includes('Exif')
}

const close = (actual: number[], expected: number[]) =>
  actual.every((value, i) => Math.abs(value - expected[i]) <= 8)

describe('shrinkPhoto', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shrinks a large PNG to a 2048 px JPEG, transparency on white', async () => {
    const original = asFile(await photo(4000, 3000, 'image/png'), 'big.png')
    const out = await shrinkPhoto(original, 2048)
    expect(out.type).toBe('image/jpeg')
    const { size, colors } = await read(out, [
      [100, 100],
      [1800, 1300],
    ])
    expect(size).toEqual({ width: 2048, height: 1536 })
    expect(close(colors[0], [255, 255, 255])).toBe(true)
    expect(close(colors[1], [0, 0, 255])).toBe(true)
  })

  it('never enlarges a small photo but still re-encodes it as a JPEG', async () => {
    const original = asFile(await photo(300, 200, 'image/png'), 'small.png')
    const out = await shrinkPhoto(original, 1024)
    expect(out.type).toBe('image/jpeg')
    expect((await read(out, [])).size).toEqual({ width: 300, height: 200 })
  })

  it('turns the pixels upright and drops the EXIF block', async () => {
    const turned = await withOrientation6(await photo(400, 200, 'image/jpeg'))
    expect(hasExif(new Uint8Array(await turned.arrayBuffer()))).toBe(true)
    const out = await shrinkPhoto(asFile(turned, 'turned.jpg'), 2048)
    expect(out.type).toBe('image/jpeg')
    expect((await read(out, [])).size).toEqual({ width: 200, height: 400 })
    expect(hasExif(new Uint8Array(await out.arrayBuffer()))).toBe(false)
  })

  it('draws on a canvas element where OffscreenCanvas is missing', async () => {
    const original = asFile(await photo(3000, 4000, 'image/png'), 'tall.png')
    vi.stubGlobal('OffscreenCanvas', undefined)
    const out = await shrinkPhoto(original, 1024)
    vi.unstubAllGlobals()
    expect(out.type).toBe('image/jpeg')
    const { size, colors } = await read(out, [[50, 50]])
    expect(size).toEqual({ width: 768, height: 1024 })
    expect(close(colors[0], [255, 255, 255])).toBe(true)
  })

  it('returns a photo it cannot decode unchanged', async () => {
    const heic = new File([new Uint8Array(64)], 'IMG_0001.HEIC', {
      type: 'image/heic',
    })
    expect(await shrinkPhoto(heic, 2048)).toBe(heic)
  })
})
