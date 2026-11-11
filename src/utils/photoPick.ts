import { isHeicFile } from '@/utils/heicPhoto'
import { taskImageExtension } from '@/utils/taskImageKeys'

/** Why a picked file was turned away. `tooMany` covers every file past the limit. */
export type PhotoRejection =
  | { reason: 'notAPhoto'; name: string }
  | { reason: 'unsupportedType'; name: string }
  | { reason: 'tooLarge'; name: string }
  | { reason: 'tooMany' }

/**
 * Which picked files can be added where photos go (a task, a worker's
 * portfolio): a picture the API can convert, up to `maxMb` each, up to `max`
 * in all. `existing` counts the photos already there or picked.
 */
export function acceptPhotos(
  picked: readonly File[],
  existing: number,
  { max, maxMb }: { max: number; maxMb: number },
): { accepted: File[]; rejected: PhotoRejection[] } {
  const accepted: File[] = []
  const rejected: PhotoRejection[] = []
  let overLimit = false
  for (const file of picked) {
    // A HEIC can come with no type (the browser doesn't know the format).
    if (!file.type.startsWith('image/') && !isHeicFile(file)) {
      rejected.push({ reason: 'notAPhoto', name: file.name })
    } else if (!taskImageExtension(file)) {
      // A picture the API can't convert (e.g. GIF, BMP or TIFF).
      rejected.push({ reason: 'unsupportedType', name: file.name })
    } else if (file.size > maxMb * 1024 * 1024) {
      rejected.push({ reason: 'tooLarge', name: file.name })
    } else if (existing + accepted.length >= max) {
      overLimit = true
    } else {
      accepted.push(file)
    }
  }
  if (overLimit) rejected.push({ reason: 'tooMany' })
  return { accepted, rejected }
}
