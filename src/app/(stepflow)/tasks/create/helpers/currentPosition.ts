import type { CreateTaskLatLng } from './createTaskStartCentre'

/**
 * The browser's location, or null when it is denied, unavailable, or too
 * slow. Used for create's starting pin and by locate-me on the task
 * location maps (create and Edit task).
 */
export function currentPosition(
  highAccuracy: boolean,
): Promise<CreateTaskLatLng | null> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(null)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      () => resolve(null),
      { enableHighAccuracy: highAccuracy, timeout: 12_000, maximumAge: 60_000 },
    )
  })
}
