import type { ApolloClient } from '@apollo/client'
import type { GetProfileAvatarUploadQuery } from '@codegen/schema'

import GetProfileAvatarUpload from '@/app/(dashboard)/profile/graphql/GetProfileAvatarUpload.gql'

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024
export const AVATAR_ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

/** Client-side validation. Returns an error message or `null` when the file is acceptable. */
export function validateAvatarFile(file: File): string | null {
  if (!AVATAR_ACCEPTED_TYPES.includes(file.type as never)) {
    return 'Use a JPG, PNG, or WebP image.'
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return 'Image must be 5MB or smaller.'
  }
  return null
}

function fallbackObjectUrl(presignedUrl: string): string {
  try {
    const u = new URL(presignedUrl)
    return `${u.origin}${u.pathname}`
  } catch {
    return presignedUrl.split('?')[0] ?? presignedUrl
  }
}

function avatarFilename(file: File): string {
  const extension = file.name.split('.').pop()?.trim().toLowerCase()
  return extension ? `avatar.${extension}` : 'avatar'
}

/**
 * Presign via `getProfileAvatarUpload`, PUT the file to object storage, and
 * return the stable public URL to persist via `updateMyProfile`. Mirrors the
 * task-image presigned upload flow.
 */
export async function uploadProfileAvatar(
  client: ApolloClient,
  file: File,
): Promise<string> {
  const { data, error } = await client.query<GetProfileAvatarUploadQuery>({
    query: GetProfileAvatarUpload,
    variables: { filename: avatarFilename(file) },
    fetchPolicy: 'network-only',
  })

  if (error) throw error

  const slot = data?.getProfileAvatarUpload
  const presignedUrl = slot?.url?.trim()
  if (!presignedUrl) {
    throw new Error('Could not get an upload URL. Please try again.')
  }

  let putRes: Response
  try {
    putRes = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        'Cache-Control': 'public,max-age=31536000,immutable',
        'x-amz-acl': 'public-read',
      },
      body: file,
    })
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

  return slot?.publicUrl?.trim() || fallbackObjectUrl(presignedUrl)
}
