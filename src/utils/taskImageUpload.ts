import type { ApolloClient } from '@apollo/client'
import type { GetS3UploadUrlQuery } from '@codegen/schema'
import { Bucket } from '@codegen/schema'

import { GET_S3_UPLOAD_URL_QUERY } from '@/graphql/storage'

function objectUrlFromPresignedPut(presignedUrl: string): string {
  try {
    const u = new URL(presignedUrl)
    return `${u.origin}${u.pathname}`
  } catch {
    return presignedUrl.split('?')[0] ?? presignedUrl
  }
}

function buildTaskImageObjectKey(file: File, index: number): string {
  const safeName = file.name.replace(/[^\w.-]+/g, '_').slice(0, 120)
  return `task-images/${Date.now()}-${index}-${safeName}`
}

/**
 * Calls `getS3UploadUrl` and returns a presigned PUT URL (or throws).
 */
export async function getS3PresignedPutUrlForTaskImage(
  client: ApolloClient,
  key: string,
  index: number,
): Promise<string> {
  const { data, error } = await client.query<GetS3UploadUrlQuery>({
    query: GET_S3_UPLOAD_URL_QUERY,
    variables: { bucket: Bucket.Task, key, index },
    fetchPolicy: 'network-only',
  })

  if (error) throw error

  const rows = data?.getS3UploadUrl ?? []
  const fromIndex =
    typeof index === 'number' && index >= 0 ? rows[index]?.url : undefined
  const presigned =
    (fromIndex?.trim() ? fromIndex : undefined) ??
    rows.map((r) => r.url).find((u) => Boolean(u?.trim())) ??
    ''
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
  const putRes = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
  })

  if (!putRes.ok) {
    throw new Error(
      'Upload failed. Please check your connection and try again.',
    )
  }

  return objectUrlFromPresignedPut(presignedUrl)
}

/**
 * Presign via API, then upload one file. Prefer {@link uploadTaskImagesWithPresign} from UI submit handlers.
 */
export async function uploadTaskImageWithPresign(
  client: ApolloClient,
  file: File,
  index: number,
): Promise<string> {
  const key = buildTaskImageObjectKey(file, index)
  const presigned = await getS3PresignedPutUrlForTaskImage(client, key, index)
  return putTaskImageToPresignedUrl(presigned, file)
}

/**
 * For each file: `getS3UploadUrl` → presigned PUT → object URL. Empty input returns `[]`.
 */
export async function uploadTaskImagesWithPresign(
  client: ApolloClient,
  files: File[],
): Promise<string[]> {
  if (files.length === 0) return []
  const urls: string[] = []
  for (let i = 0; i < files.length; i += 1) {
    urls.push(await uploadTaskImageWithPresign(client, files[i], i))
  }
  return urls
}
