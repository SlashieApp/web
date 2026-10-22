/** The back camera (`environment`, for things) or the front (`user`, for a selfie). */
export type CameraFacing = 'environment' | 'user'

/**
 * Why the camera didn't open: `blocked` (the person or the browser said no),
 * `busy` (another app has it) or `unavailable` (no camera, or a browser that
 * can't open one here, such as an old one or a page not on HTTPS).
 */
export type CameraFailure = 'blocked' | 'busy' | 'unavailable'

/**
 * What the browser says about the camera permission: `prompt` (it can still
 * ask), `denied` (blocked for good: it won't ask again), `granted`, or
 * `unknown` (it can't say: some browsers don't know the camera here).
 */
export type CameraPermission = 'granted' | 'prompt' | 'denied' | 'unknown'

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

/** A `PermissionStatus.state` as a {@link CameraPermission}. */
export function cameraPermission(state: unknown): CameraPermission {
  return state === 'granted' || state === 'prompt' || state === 'denied'
    ? state
    : 'unknown'
}

/**
 * Whether the blocked screen should send the person to the site settings
 * instead of asking again. `denied` means the browser won't prompt. Where the
 * browser can't say, being refused again after Allow camera tells us the same.
 */
export function needsSiteSettings(
  permission: CameraPermission,
  askedAgain: boolean,
): boolean {
  return permission === 'denied' || (permission === 'unknown' && askedAgain)
}

/**
 * Follows the camera permission: `onState` hears it now (`changed` is false)
 * and again whenever it changes (`changed` is true). Returns the function
 * that stops listening. Says nothing where the browser can't be asked about
 * the camera (some throw, some reject).
 */
export function watchCameraPermission(
  permissions: Pick<Permissions, 'query'> | undefined,
  onState: (permission: CameraPermission, changed: boolean) => void,
): () => void {
  let stopped = false
  let stopListening = () => {}
  const watch = async () => {
    let queried: PermissionStatus | undefined
    try {
      queried = await permissions?.query({ name: 'camera' as PermissionName })
    } catch {
      return
    }
    const status = queried
    if (!status || stopped) return
    const onChange = () => onState(cameraPermission(status.state), true)
    status.addEventListener('change', onChange)
    stopListening = () => status.removeEventListener('change', onChange)
    onState(cameraPermission(status.state), false)
  }
  void watch()
  return () => {
    stopped = true
    stopListening()
  }
}

/** `camera-<milliseconds>.jpg`, like the names phones give photos. */
export function cameraFileName(takenAt: Date): string {
  return `camera-${takenAt.getTime()}.jpg`
}
