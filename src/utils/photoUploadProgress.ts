import { formatMessage } from '@/i18n/loadPageI11n'

/** What one photo is doing: shrunk to a JPEG in the browser (FE-339), then sent. */
export type PhotoUploadPhase = 'preparing' | 'uploading'

/** One step of a photo upload. `index` counts from 1, for display. */
export type PhotoUploadProgress = {
  phase: PhotoUploadPhase
  index: number
  total: number
}

export type PhotoProgressCopy = Record<PhotoUploadPhase, string>

/**
 * What the busy Post or Save button says: the photo step in hand, such as
 * "Uploading photo 2 of 3". `idle` is the line before the first photo: Post
 * says "Posting task", Save has none and keeps its spinner.
 */
export function photoProgressLabel(
  progress: PhotoUploadProgress | null,
  copy: PhotoProgressCopy,
  idle?: string,
): string | undefined {
  if (!progress) return idle
  return formatMessage(copy[progress.phase], {
    index: progress.index,
    total: progress.total,
  })
}
