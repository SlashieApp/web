import { TaskStatus } from '@codegen/schema'

/** Photo slots under `tasks/<taskId>/`: one digit, 0 to 9 (the API's INVALID_INDEX otherwise). */
export const TASK_IMAGE_SLOTS: readonly number[] = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
]

/** File extensions the API takes on a photo key. */
export const TASK_IMAGE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'heic',
  'heif',
  'avif',
] as const

export type TaskImageExtension = (typeof TASK_IMAGE_EXTENSIONS)[number]

const EXTENSION_BY_MIME: Record<string, TaskImageExtension> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/pjpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/heic': 'heic',
  'image/heic-sequence': 'heic',
  'image/heif': 'heif',
  'image/heif-sequence': 'heif',
  'image/avif': 'avif',
}

function isTaskImageExtension(value: string): value is TaskImageExtension {
  return (TASK_IMAGE_EXTENSIONS as readonly string[]).includes(value)
}

/**
 * The key's extension: the file name's when the API takes it, otherwise one
 * from the MIME type. Null when neither gives an allowed type (the photo is
 * refused before upload).
 */
export function taskImageExtension(
  file: Pick<File, 'name' | 'type'>,
): TaskImageExtension | null {
  const dot = file.name.lastIndexOf('.')
  const fromName =
    dot >= 0
      ? file.name
          .slice(dot + 1)
          .trim()
          .toLowerCase()
      : ''
  if (isTaskImageExtension(fromName)) return fromName
  return EXTENSION_BY_MIME[file.type.trim().toLowerCase()] ?? null
}

/** `3.jpg`: the slot, then the extension. Throws for a slot outside 0 to 9 or an unknown type. */
export function taskImageKey(
  slot: number,
  file: Pick<File, 'name' | 'type'>,
): string {
  if (!Number.isInteger(slot) || slot < 0 || slot > 9) {
    throw new Error(`Task photo slot ${slot} is outside 0 to 9.`)
  }
  const extension = taskImageExtension(file)
  if (!extension) throw new Error(`${file.name} is not a supported photo type.`)
  return `${slot}.${extension}`
}

/** Photos can be added only while the task is open or a draft (else TASK_NOT_EDITABLE). */
export function canUploadTaskImages(
  status: TaskStatus | null | undefined,
): boolean {
  return status === TaskStatus.Open || status === TaskStatus.Draft
}

/** The slot a stored photo URL uses (`…/tasks/<id>/3.jpg` → 3), or null. */
function slotFromUrl(url: string): number | null {
  const match = url.match(/\/(\d+)(?:\.[a-z0-9]+)?(?:\?|#|$)/i)
  if (!match) return null
  const n = Number.parseInt(match[1], 10)
  return Number.isInteger(n) ? n : null
}

/** Slots 0 to 9 not used by the task's existing photos, lowest first. */
export function freeTaskImageSlots(
  existingImageUrls: readonly string[],
): number[] {
  const used = new Set(existingImageUrls.map(slotFromUrl))
  return TASK_IMAGE_SLOTS.filter((slot) => !used.has(slot))
}

/** The lowest free slot (0 to 9), or null when all ten are taken. */
export function nextTaskImageUploadIndex(
  existingImageUrls: readonly string[],
): number | null {
  return freeTaskImageSlots(existingImageUrls)[0] ?? null
}
