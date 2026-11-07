/** Set on the root by the compact pin: its rendered height in px. */
export const TASK_DETAIL_PIN_HEIGHT_VAR = '--task-detail-pin-height' as const

/**
 * Space so the last content line can scroll above the compact pin. At least
 * the 2-row pin plus the safe area, and never less than the pin as measured
 * (a worker's "asked you to quote" note makes it taller, and a long name
 * wraps), plus a little air.
 */
export const TASK_DETAIL_PIN_CLEARANCE =
  `max(calc(7.5rem + env(safe-area-inset-bottom, 0px)), calc(var(${TASK_DETAIL_PIN_HEIGHT_VAR}, 0px) + 0.75rem))` as const
