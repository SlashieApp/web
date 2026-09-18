import { PIN_Z_INDEX } from '../../taskMap/pin/styles'

/**
 * You-pin + driving path + task-pin presentation. Geometry is the same on
 * every viewport; line weight and pin stacking live here so overlay/offset
 * can stay independent.
 */
export const PINS_PATH_LINE_WIDTH = {
  mobile: 4,
  tablet: 4,
  web: 4,
} as const

export const PINS_PATH_LINE_OPACITY = 0.88

export const PINS_PATH_Z_INDEX = PIN_Z_INDEX

export const PINS_PATH_ANIM_MS = 400
