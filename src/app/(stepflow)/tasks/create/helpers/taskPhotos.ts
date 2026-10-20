import { taskImageExtension } from '@/utils/taskImageKeys'

/** Photos per task (slots 0 to 9): workers see them on the task page. */
export const TASK_PHOTOS_MAX = 10

/** Per photo, before upload. */
export const TASK_PHOTO_MAX_MB = 10

export type TaskPhotoRejection =
  | { reason: 'notAPhoto'; name: string }
  | { reason: 'unsupportedType'; name: string }
  | { reason: 'tooLarge'; name: string }
  | { reason: 'tooMany' }

/** Which picked files can join the task (`existing` = photos already on it or picked). */
export function acceptTaskPhotos(
  picked: readonly File[],
  existing: number,
): { accepted: File[]; rejected: TaskPhotoRejection[] } {
  const accepted: File[] = []
  const rejected: TaskPhotoRejection[] = []
  let overLimit = false
  for (const file of picked) {
    if (!file.type.startsWith('image/')) {
      rejected.push({ reason: 'notAPhoto', name: file.name })
    } else if (!taskImageExtension(file)) {
      // A picture the API can't store (e.g. BMP or TIFF).
      rejected.push({ reason: 'unsupportedType', name: file.name })
    } else if (file.size > TASK_PHOTO_MAX_MB * 1024 * 1024) {
      rejected.push({ reason: 'tooLarge', name: file.name })
    } else if (existing + accepted.length >= TASK_PHOTOS_MAX) {
      overLimit = true
    } else {
      accepted.push(file)
    }
  }
  if (overLimit) rejected.push({ reason: 'tooMany' })
  return { accepted, rejected }
}
