/** The back camera (`environment`, for things) or the front (`user`, for a selfie). */
export type CameraFacing = 'environment' | 'user'

/**
 * Why the camera didn't open: `blocked` (the person or the browser said no),
 * `busy` (another app has it) or `unavailable` (no camera, or a browser that
 * can't open one here, such as an old one or a page not on HTTPS).
 */
export type CameraFailure = 'blocked' | 'busy' | 'unavailable'

/** High enough that the upload's shrink (FE-339) decides the final quality. */
export const CAMERA_JPEG_QUALITY = 0.92

/** Asks for `facing` at up to 4K; any camera will do if that one is missing. */
export function cameraConstraints(
  facing: CameraFacing,
): MediaStreamConstraints {
  return {
    video: {
      facingMode: { ideal: facing },
      width: { ideal: 3840 },
      height: { ideal: 2160 },
    },
    audio: false,
  }
}

/** What to tell the person when opening the camera fails with `error`. */
export function cameraFailure(error: unknown): CameraFailure {
  const name =
    typeof error === 'object' && error !== null && 'name' in error
      ? error.name
      : null
  if (name === 'NotAllowedError') return 'blocked'
  if (name === 'NotReadableError') return 'busy'
  // NotFoundError, OverconstrainedError, NotSupportedError and the rest.
  return 'unavailable'
}

/** `camera-<milliseconds>.jpg`, like the names phones give photos. */
export function cameraFileName(takenAt: Date): string {
  return `camera-${takenAt.getTime()}.jpg`
}
