/** What a tap or click on a standalone map pin does. */
export type MapPinTapAction = 'select' | 'open'

/**
 * The same for touch and mouse (FE-401). The first tap on a pin selects its
 * task, the way picking a list card or a carousel card does. A tap on the pin
 * of the task that is already selected opens it.
 */
export function mapPinTapAction(
  tappedTaskId: string,
  selectedTaskId: string | null | undefined,
): MapPinTapAction {
  return tappedTaskId === selectedTaskId ? 'open' : 'select'
}
