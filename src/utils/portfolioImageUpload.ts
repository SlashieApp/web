import type { ApolloClient } from '@apollo/client'
import type {
  FinalizePortfolioImageMutation,
  FinalizePortfolioImageMutationVariables,
} from '@codegen/schema'

import FinalizePortfolioImage from '@/app/(stepflow)/worker/setup/graphql/FinalizePortfolioImage.gql'
import { uploadImageBytes } from '@/utils/imageUpload'
import type { PhotoUploadPhase } from '@/utils/photoUploadProgress'

/** Long edge, in px, of a stored portfolio photo (the API's size). */
export const PORTFOLIO_PHOTO_MAX_EDGE = 2048

/**
 * Uploads one photo of a worker's work (BE-120): shrunk to a JPEG, then
 * `createImageUpload`, PUT and `finalizePortfolioImage`, which stores it on
 * our own storage. Returns the photo's public URL. The photo is on the
 * profile once that URL is saved in `portfolioUrls`; the API deletes one that
 * never is. `onPhase` hears `preparing` and `uploading`.
 */
export async function uploadPortfolioImage(
  client: ApolloClient,
  file: File,
  onPhase?: (phase: PhotoUploadPhase) => void,
): Promise<string> {
  const uploadKey = await uploadImageBytes(
    client,
    file,
    PORTFOLIO_PHOTO_MAX_EDGE,
    {
      flow: 'worker_profile',
      action: 'uploadPortfolioImage',
      url_or_operation: 'portfolio_image_put',
    },
    onPhase,
  )
  const { data } = await client.mutate<
    FinalizePortfolioImageMutation,
    FinalizePortfolioImageMutationVariables
  >({
    mutation: FinalizePortfolioImage,
    variables: { uploadKey },
  })
  const url = data?.finalizePortfolioImage?.trim()
  if (!url) throw new Error('Could not save the photo. Please try again.')
  return url
}
