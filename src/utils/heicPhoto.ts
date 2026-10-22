/** HEIC and HEIF MIME types (iPhone photos; some Android phones too). */
const HEIC_TYPES = [
  'image/heic',
  'image/heif',
  'image/heic-sequence',
  'image/heif-sequence',
]

const HEIC_EXTENSION = /\.(heic|heif)$/i

/**
 * The converted photo is a working copy: the upload shrinks and re-encodes
 * it at the API's 0.82 (FE-339), so keep this one close to the original.
 */
const CONVERTED_JPEG_QUALITY = 0.92

/** Longer than a 12 MP photo takes on a slow phone; a stuck converter ends here. */
const CONVERT_TIMEOUT_MS = 60_000

/**
 * A HEIC or HEIF photo, by its type or by its name: browsers that don't know
 * the format (Chrome on Windows, for one) leave the type empty.
 */
export function isHeicFile(file: Pick<File, 'name' | 'type'>): boolean {
  return (
    HEIC_TYPES.includes(file.type.trim().toLowerCase()) ||
    HEIC_EXTENSION.test(file.name.trim())
  )
}

/** `IMG_0001.HEIC` becomes `IMG_0001.jpg`; a name without an extension gains one. */
export function jpegFileName(name: string): string {
  const dot = name.lastIndexOf('.')
  return `${dot > 0 ? name.slice(0, dot) : name}.jpg`
}

async function browserDecodes(file: Blob): Promise<boolean> {
  try {
    const bitmap = await createImageBitmap(file)
    bitmap.close()
    return true
  } catch {
    return false
  }
}

function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const expired = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error('Photo conversion timed out.')),
      ms,
    )
  })
  return Promise.race([work, expired]).finally(() => clearTimeout(timer))
}

/** One conversion at a time: each decodes a full-size photo in memory. */
let queue: Promise<unknown> = Promise.resolve()

function inTurn<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task)
  queue = run.catch(() => undefined)
  return run
}

/**
 * The photo to preview and upload, and whether this browser can show it: a
 * HEIC it can't decode comes back as a JPEG (`convertHeicPhoto`), or, when
 * that fails, unchanged with `viewable: false` (it still uploads, and the
 * API converts it). Every other photo comes back as it is.
 */
export async function viewablePhoto(
  file: File,
): Promise<{ file: File; viewable: boolean }> {
  if (!isHeicFile(file)) return { file, viewable: true }
  try {
    return { file: await convertHeicPhoto(file), viewable: true }
  } catch {
    return { file, viewable: false }
  }
}

/**
 * A HEIC or HEIF photo as a JPEG this browser can show: unchanged where the
 * browser decodes it already (Safari), otherwise converted with libheif
 * (`heic-to`, about 3 MB, downloaded here the first time a photo needs it and
 * run in a worker). Upright, like the original; the JPEG has no metadata.
 * Throws when the photo can't be converted.
 */
export function convertHeicPhoto(file: File): Promise<File> {
  return inTurn(async () => {
    if (await browserDecodes(file)) return file
    const { heicTo } = await import('heic-to/csp')
    const jpeg = await withTimeout(
      heicTo({
        blob: file,
        type: 'image/jpeg',
        quality: CONVERTED_JPEG_QUALITY,
      }),
      CONVERT_TIMEOUT_MS,
    )
    return new File([jpeg], jpegFileName(file.name), {
      type: 'image/jpeg',
      lastModified: file.lastModified,
    })
  })
}
