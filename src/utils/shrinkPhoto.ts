/** The API's JPEG quality for stored photos. */
const JPEG_QUALITY = 0.82

/**
 * The size to draw a `width` x `height` photo at so its long edge is at most
 * `maxEdge`: never larger than the photo, in whole pixels, at least 1 px.
 */
export function shrunkPhotoSize(
  width: number,
  height: number,
  maxEdge: number,
): { width: number; height: number } {
  const scale = Math.min(1, maxEdge / Math.max(width, height))
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

/** Draws `bitmap` on white (no black behind transparency), then frees it. */
function drawOnWhite(
  context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null,
  bitmap: ImageBitmap,
  width: number,
  height: number,
) {
  try {
    if (!context) throw new Error('No 2D canvas.')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, width, height)
    context.imageSmoothingQuality = 'high'
    context.drawImage(bitmap, 0, 0, width, height)
  } finally {
    bitmap.close()
  }
}

async function encodeJpeg(
  bitmap: ImageBitmap,
  width: number,
  height: number,
): Promise<Blob> {
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(width, height)
    drawOnWhite(canvas.getContext('2d'), bitmap, width, height)
    return canvas.convertToBlob({ type: 'image/jpeg', quality: JPEG_QUALITY })
  }
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  drawOnWhite(canvas.getContext('2d'), bitmap, width, height)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('No JPEG.'))),
      'image/jpeg',
      JPEG_QUALITY,
    )
  })
}

/**
 * The photo to upload: decoded upright (EXIF orientation applied), shrunk so
 * its long edge is at most `maxEdge` (never enlarged), on white where it was
 * transparent, and re-encoded as a JPEG, which drops all metadata including
 * location. Same targets as the API, which still re-saves it. A photo this
 * browser can't decode (HEIC outside Safari, for one) comes back unchanged
 * and the API converts it.
 */
export async function shrinkPhoto(file: File, maxEdge: number): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: 'from-image',
    })
    const { width, height } = shrunkPhotoSize(
      bitmap.width,
      bitmap.height,
      maxEdge,
    )
    return await encodeJpeg(bitmap, width, height)
  } catch {
    return file
  }
}
