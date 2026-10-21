import type { ApolloClient } from '@apollo/client'
import type {
  FinalizeTaskImageMutation,
  FinalizeTaskImageMutationVariables,
  TaskStatus,
} from '@codegen/schema'

import FinalizeTaskImage from '@/app/(stepflow)/tasks/create/graphql/FinalizeTaskImage.gql'
import { uploadImageBytes } from '@/utils/imageUpload'
import {
  TASK_IMAGE_SLOTS,
  canUploadTaskImages,
  taskImageIndex,
} from '@/utils/taskImageKeys'

/** Long edge, in px, of a stored task photo (the API's size). */
export const TASK_PHOTO_MAX_EDGE = 2048

/**
 * Uploads one photo into `slot` (0 to 9): shrunk to a JPEG, then
 * `createImageUpload`, PUT and `finalizeTaskImage`, which stores it as
 * `tasks/<taskId>/<slot>.jpg` and replaces any earlier photo in that slot.
 * Returns the photo's public URL.
 */
export async function uploadTaskImage(
  client: ApolloClient,
  taskId: string,
  file: File,
  slot: number,
): Promise<string> {
  const index = taskImageIndex(slot, file)
  const uploadKey = await uploadImageBytes(client, file, TASK_PHOTO_MAX_EDGE, {
    flow: 'task_create',
    action: 'uploadTaskImage',
    url_or_operation: 'task_image_put',
  })
  const { data } = await client.mutate<
    FinalizeTaskImageMutation,
    FinalizeTaskImageMutationVariables
  >({
    mutation: FinalizeTaskImage,
    variables: { taskId, index, uploadKey },
  })
  const url = data?.finalizeTaskImage?.trim()
  if (!url) throw new Error('Could not save the photo. Please try again.')
  return url
}

/**
 * Uploads every photo, one at a time (each is decoded in memory to shrink
 * it), even when one fails (create and edit: the task is already saved, so
 * the rest should still land). Each file takes the next
 * free slot; a file with no slot left, or any file while the task is not open
 * or a draft, is not sent and counts as failed. Returns how many failed.
 */
export async function uploadTaskImagesSettled(
  client: ApolloClient,
  task: { id: string; status: TaskStatus | null | undefined },
  files: readonly File[],
  slots: readonly number[] = TASK_IMAGE_SLOTS,
): Promise<{ failed: number }> {
  if (!canUploadTaskImages(task.status)) return { failed: files.length }
  let failed = 0
  for (let i = 0; i < files.length; i += 1) {
    const slot = slots[i]
    if (slot === undefined) {
      failed += 1
      continue
    }
    try {
      await uploadTaskImage(client, task.id, files[i], slot)
    } catch {
      failed += 1
    }
  }
  return { failed }
}
