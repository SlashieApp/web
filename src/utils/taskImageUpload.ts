import type { ApolloClient } from '@apollo/client'
import type { GetTaskS3UploadQuery, TaskStatus } from '@codegen/schema'

import GetTaskS3Upload from '@/app/(stepflow)/tasks/create/graphql/GetTaskS3Upload.gql'
import { apiFetch } from '@/utils/analytics'
import {
  TASK_IMAGE_SLOTS,
  canUploadTaskImages,
  taskImageKey,
} from '@/utils/taskImageKeys'

function objectUrlFromPresignedPut(presignedUrl: string): string {
  try {
    const u = new URL(presignedUrl)
    return `${u.origin}${u.pathname}`
  } catch {
    return presignedUrl.split('?')[0] ?? presignedUrl
  }
}

/**
 * Calls `getTaskS3Upload` and returns a presigned PUT URL (or throws).
 */
export async function getS3PresignedPutUrlForTaskImage(
  client: ApolloClient,
  taskId: string,
  index: string,
): Promise<string> {
  const { data, error } = await client.query<GetTaskS3UploadQuery>({
    query: GetTaskS3Upload,
    variables: { taskId, index },
    fetchPolicy: 'network-only',
  })

  if (error) throw error

  const rows = data?.getTaskS3Upload ?? []
  const presigned = rows.map((r) => r.url).find((u) => Boolean(u?.trim())) ?? ''
  if (!presigned.trim()) {
    throw new Error('Could not get upload URL. Please try again.')
  }

  return presigned
}

/**
 * PUTs `file` to a presigned URL. Returns the stable object URL (no query string).
 */
export async function putTaskImageToPresignedUrl(
  presignedUrl: string,
  file: File,
): Promise<string> {
  let putRes: Response
  try {
    putRes = await apiFetch(
      presignedUrl,
      {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
          'Cache-Control': 'public,max-age=31536000,immutable',
          'x-amz-acl': 'public-read',
        },
        body: file,
      },
      {
        flow: 'task_create',
        action: 'putTaskImageToPresignedUrl',
        source: 'upload',
        url_or_operation: 'task_image_put',
      },
    )
  } catch {
    throw new Error(
      'Upload failed before reaching storage. Check storage CORS for PUT from this origin and try again.',
    )
  }

  if (!putRes.ok) {
    const responseText = await putRes.text().catch(() => '')
    throw new Error(
      `Upload failed (${putRes.status}). ${
        responseText || 'Please check storage permissions/CORS and try again.'
      }`,
    )
  }

  return objectUrlFromPresignedPut(presignedUrl)
}

/** Presign via API (`getTaskS3Upload`, key `<slot>.<ext>`), then upload one file. */
export async function uploadTaskImageWithPresign(
  client: ApolloClient,
  taskId: string,
  file: File,
  slot: number,
): Promise<string> {
  const presigned = await getS3PresignedPutUrlForTaskImage(
    client,
    taskId,
    taskImageKey(slot, file),
  )
  return putTaskImageToPresignedUrl(presigned, file)
}

/**
 * Uploads every photo even when one fails (create and edit: the task is
 * already saved, so the rest should still land). Each file takes the next
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
      await uploadTaskImageWithPresign(client, task.id, files[i], slot)
    } catch {
      failed += 1
    }
  }
  return { failed }
}
