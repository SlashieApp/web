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

/**
 * Uploads a task image via presigned S3 URL from the API. Returns the object URL (without query params).
 */
export async function uploadTaskImageWithPresign(
  client: ApolloClient,
  file: File,
  index: number,
): Promise<string> {
  const safeName = file.name.replace(/[^\w.-]+/g, '_').slice(0, 120)
  const key = `task-images/${Date.now()}-${index}-${safeName}`

  const { data, error } = await client.query<GetS3UploadUrlQuery>({
    query: GET_S3_UPLOAD_URL_QUERY,
    variables: { bucket: Bucket.TaskImages, key, index },
    fetchPolicy: 'network-only',
  })

  if (error) throw error

  const presigned = data?.getS3UploadUrl?.url
  if (!presigned?.trim()) {
    throw new Error('Could not get upload URL. Please try again.')
  }

  const putRes = await fetch(presigned, {
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

  return objectUrlFromPresignedPut(presigned)
}
