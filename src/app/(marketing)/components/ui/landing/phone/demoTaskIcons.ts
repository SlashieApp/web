import type { IconType } from 'react-icons'
import {
  LuHammer,
  LuPackage,
  LuPaintRoller,
  LuSparkles,
  LuSprout,
} from 'react-icons/lu'

import type { DemoTaskId } from './phoneCopy'

/**
 * The icon in a demo task card's tile: what kind of job it is, never a colour.
 * One table for every place the same demo task is drawn (the map panel's card
 * and the phone's search card), so a task wears the same icon wherever it
 * shows on the page.
 */
export const DEMO_TASK_ICONS: Record<DemoTaskId, IconType> = {
  move: LuPackage,
  wardrobe: LuHammer,
  paint: LuPaintRoller,
  hedge: LuSprout,
  clean: LuSparkles,
}
