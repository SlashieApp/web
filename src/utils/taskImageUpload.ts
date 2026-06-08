import type { ApolloClient } from '@apollo/client'
import type { GetTaskS3UploadQuery } from '@codegen/schema'

import GetTaskS3Upload from '@/app/(task)/tasks/create/graphql/GetTaskS3Upload.gql'
import { apiFetch } from '@/utils/analytics'

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

/**
 * Presign via API, then upload one file. Prefer {@link uploadTaskImagesWithPresign} from UI submit handlers.
 */
export async function uploadTaskImageWithPresign(
  client: ApolloClient,
  taskId: string,
  file: File,
  index: number,
): Promise<string> {
  const extension = file.name.split('.').pop()?.trim().toLowerCase()
  const indexWithExtension = extension ? `${index}.${extension}` : `${index}`
  const presigned = await getS3PresignedPutUrlForTaskImage(
    client,
    taskId,
    indexWithExtension,
  )
  return putTaskImageToPresignedUrl(presigned, file)
}

/**
 * For each file: `getTaskS3Upload` → presigned PUT → object URL. Empty input returns `[]`.
 */
export async function uploadTaskImagesWithPresign(
  client: ApolloClient,
  taskId: string,
  files: File[],
  startIndex = 0,
): Promise<string[]> {
  if (files.length === 0) return []
  const urls: string[] = []
  for (let i = 0; i < files.length; i += 1) {
    urls.push(
      await uploadTaskImageWithPresign(
        client,
        taskId,
        files[i],
        startIndex + i,
      ),
    )
  }
  return urls
}

/** Next S3 object index under `tasks/<taskId>/` from existing image URLs. */
export function nextTaskImageUploadIndex(
  existingImageUrls: readonly string[],
): number {
  let max = -1
  for (const url of existingImageUrls) {
    const match = url.match(/\/(\d+)(?:\.[a-z0-9]+)?(?:\?|#|$)/i)
    if (!match) continue
    const n = Number.parseInt(match[1], 10)
    if (Number.isFinite(n)) max = Math.max(max, n)
  }
  return max + 1
}
