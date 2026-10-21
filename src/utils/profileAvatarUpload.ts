import type { ApolloClient } from '@apollo/client'
import type {
  FinalizeAvatarUploadMutation,
  FinalizeAvatarUploadMutationVariables,
} from '@codegen/schema'

import FinalizeAvatarUpload from '@/app/(dashboard)/profile/graphql/FinalizeAvatarUpload.gql'
import { uploadImageBytes } from '@/utils/imageUpload'

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024
export const AVATAR_ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/avif',
] as const

export type AvatarFileProblem = 'type' | 'size'

/** Why a picked file can't be a profile photo (callers word it), or null. */
export function validateAvatarFile(file: File): AvatarFileProblem | null {
  if (!AVATAR_ACCEPTED_TYPES.includes(file.type as never)) return 'type'
  if (file.size > AVATAR_MAX_BYTES) return 'size'
  return null
}

export type SavedAvatar = FinalizeAvatarUploadMutation['finalizeAvatarUpload']

/**
 * Uploads `file` (`createImageUpload`, then a PUT) and makes it the signed-in
 * user's avatar with `finalizeAvatarUpload`, which converts it to a
 * metadata-free JPEG and saves `avatarUrl`. Returns the updated user.
 */
export async function uploadProfileAvatar(
  client: ApolloClient,
  file: File,
): Promise<SavedAvatar> {
  const uploadKey = await uploadImageBytes(client, file, {
    flow: 'profile_update',
    action: 'uploadProfileAvatar',
    url_or_operation: 'profile_avatar_put',
  })
  const { data } = await client.mutate<
    FinalizeAvatarUploadMutation,
    FinalizeAvatarUploadMutationVariables
  >({
    mutation: FinalizeAvatarUpload,
    variables: { uploadKey },
  })
  const saved = data?.finalizeAvatarUpload
  if (!saved) throw new Error('Could not save your photo. Please try again.')
  return saved
}
