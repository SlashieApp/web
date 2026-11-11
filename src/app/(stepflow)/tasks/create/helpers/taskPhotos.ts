import { type PhotoRejection, acceptPhotos } from '@/utils/photoPick'

/** Photos per task (slots 0 to 9): workers see them on the task page. */
export const TASK_PHOTOS_MAX = 10

/** Per photo, before upload. */
export const TASK_PHOTO_MAX_MB = 10

export type TaskPhotoRejection = PhotoRejection

/** Which picked files can join the task (`existing` = photos already on it or picked). */
export function acceptTaskPhotos(
  picked: readonly File[],
  existing: number,
): { accepted: File[]; rejected: TaskPhotoRejection[] } {
  return acceptPhotos(picked, existing, {
    max: TASK_PHOTOS_MAX,
    maxMb: TASK_PHOTO_MAX_MB,
  })
}
