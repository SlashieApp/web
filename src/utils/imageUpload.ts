import type { ApolloClient } from '@apollo/client'
import type { CreateImageUploadMutation } from '@codegen/schema'

import CreateImageUpload from '@/graphql/CreateImageUpload.gql'
import { apiFetch } from '@/utils/analytics'
import type { PhotoUploadPhase } from '@/utils/photoUploadProgress'
import { shrinkPhoto } from '@/utils/shrinkPhoto'

/**
 * Shrinks `file` to a JPEG with a long edge of at most `maxEdge` px
 * (`shrinkPhoto`; the original when this browser can't decode it), creates a
 * private upload (`createImageUpload`) and PUTs the photo to it. Returns the
 * `uploadKey` for `finalizeTaskImage` or `finalizeAvatarUpload`, which save
 * it as a metadata-free JPEG. An upload never finalized is deleted by the API
 * after about an hour. `onPhase` hears `preparing` (the shrink) and then
 * `uploading`.
 */
export async function uploadImageBytes(
  client: ApolloClient,
  file: File,
  maxEdge: number,
  context: { flow: string; action: string; url_or_operation: string },
  onPhase?: (phase: PhotoUploadPhase) => void,
): Promise<string> {
  onPhase?.('preparing')
  const photo = await shrinkPhoto(file, maxEdge)
  onPhase?.('uploading')
  const { data } = await client.mutate<CreateImageUploadMutation>({
    mutation: CreateImageUpload,
  })
  const upload = data?.createImageUpload
  if (!upload?.url.trim() || !upload.uploadKey.trim()) {
    throw new Error('Could not get an upload URL. Please try again.')
  }

  let putRes: Response
  try {
    putRes = await apiFetch(
      upload.url,
      {
        method: 'PUT',
        // Content-Type only: no ACL header, so the upload stays private.
        headers: { 'Content-Type': photo.type || 'application/octet-stream' },
        body: photo,
      },
      { ...context, source: 'upload' },
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

  return upload.uploadKey
}
