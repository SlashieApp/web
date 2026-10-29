import { formatMessage } from '@/i18n/loadPageI11n'
import { BREAKPOINT_PX } from '@/theme/breakpoints'
import { PAGE_CONTAINER_MAX_W_CSS } from '@/theme/pageContainer'

import type { DemoTaskId, PhoneCopy } from '../phone/phoneCopy'

/**
 * Pure model of the map panel (`MapShowcase`): which demo tasks it shows,
 * where their pins sit on the drawn map, and the strings each task card and
 * pin label are built from. The demo tasks come from `landing.phone.tasks`;
 * nothing here adds copy.
 */

/**
 * The five demo tasks, in the order the pins are tabbed: top to bottom on the
 * map, in both layouts (see `PIN_SPOTS`).
 */
export const SHOWCASE_ORDER = [
  'move',
  'wardrobe',
  'paint',
  'hedge',
  'clean',
] as const satisfies readonly DemoTaskId[]

/** The pin that is selected on first paint (the phone's search starts here too). */
export const DEFAULT_SHOWCASE_TASK: DemoTaskId = 'move'

/** What one task card and one pin say, resolved from the phone bag. */
export type ShowcaseTask = {
  id: DemoTaskId
  title: string
  /** The area, shown as the card's tag and under the pin. */
  area: string
  /** "£45": the pin's text and the card's price. */
  price: string
  /** "3 quotes". */
  quotes: string
  /** The pin button's accessible name: "Show the £45 task". */
  pinLabel: string
}

export function buildShowcaseTasks(copy: PhoneCopy): ShowcaseTask[] {
  return SHOWCASE_ORDER.map((id) => {
    const task = copy.tasks[id]
    return {
      id,
      title: task.title,
      area: task.area,
      price: task.price,
      quotes: formatMessage(copy.search.quotes, { count: task.quotes }),
      pinLabel: formatMessage(copy.search.selectPin, { price: task.price }),
    }
  })
}

/** The task for `id`, or the first one when `id` is not (or no longer) shown. */
export function pickShowcaseTask(
  tasks: readonly ShowcaseTask[],
  id: DemoTaskId,
): ShowcaseTask {
  return tasks.find((task) => task.id === id) ?? tasks[0]
}

/**
 * The map's two layouts. Below `md` the card sits under the map, so the pins
 * use all of it; from `md` the card floats over the map's bottom-left corner
 * and the pins keep clear of it. Fractions of the map box.
 */
export type MapLayout = 'narrow' | 'wide'

/** A pin's anchor (the foot of its dot) as fractions of the map box. */
export type PinSpot = { x: number; y: number }

export const PIN_SPOTS: Record<MapLayout, Record<DemoTaskId, PinSpot>> = {
  narrow: {
    move: { x: 0.64, y: 0.36 },
    wardrobe: { x: 0.28, y: 0.48 },
    paint: { x: 0.7, y: 0.6 },
    hedge: { x: 0.3, y: 0.72 },
    clean: { x: 0.66, y: 0.86 },
  },
  wide: {
    move: { x: 0.4, y: 0.28 },
    wardrobe: { x: 0.64, y: 0.38 },
    paint: { x: 0.16, y: 0.5 },
    hedge: { x: 0.64, y: 0.68 },
    clean: { x: 0.88, y: 0.84 },
  },
}

/**
 * The map box's aspect ratio (width / height) at each breakpoint, mirrored in
 * the component's CSS: 9:10 on a phone, 3:2 from `sm`, 9:5 from `md`, 11:5
 * from `lg`.
 */
export const MAP_ASPECT = {
  base: 9 / 10,
  sm: 3 / 2,
  md: 9 / 5,
  lg: 11 / 5,
} as const

/** The page column's width (`sizes.page`, 80rem) and its side gutters, in px. */
const PAGE_COLUMN_PX = Number.parseFloat(PAGE_CONTAINER_MAX_W_CSS) * 16
const GUTTER_PX = { base: 16, md: 24, lg: 32 } as const

/** The layout the map uses on a viewport this wide. */
export function layoutAt(viewportWidth: number): MapLayout {
  return viewportWidth >= BREAKPOINT_PX.md ? 'wide' : 'narrow'
}

/**
 * The map box on a viewport this wide, in px: the page column less its
 * gutters, at the breakpoint's aspect ratio.
 */
export function mapSizeAt(viewportWidth: number): {
  width: number
  height: number
} {
  const gutter =
    viewportWidth >= BREAKPOINT_PX.lg
      ? GUTTER_PX.lg
      : viewportWidth >= BREAKPOINT_PX.md
        ? GUTTER_PX.md
        : GUTTER_PX.base
  const width = Math.min(viewportWidth, PAGE_COLUMN_PX) - 2 * gutter
  const aspect =
    viewportWidth >= BREAKPOINT_PX.lg
      ? MAP_ASPECT.lg
      : viewportWidth >= BREAKPOINT_PX.md
        ? MAP_ASPECT.md
        : viewportWidth >= BREAKPOINT_PX.sm
          ? MAP_ASPECT.sm
          : MAP_ASPECT.base
  return { width, height: width / aspect }
}

/** Where the floating card sits from `md`: inset from the map's bottom-left. */
export const CARD_INSET_PX = 20
export const CARD_WIDTH_PX = 380
/** The card's tallest case: a two-line title under a tag, plus the meta line. */
export const CARD_MAX_HEIGHT_PX = 140

/**
 * The map's title chip, top-left: inset 16px, 36px tall and up to 180px wide,
 * plus a gap of 8px that pins keep clear of.
 */
export const CHIP_ZONE_PX = {
  inset: 16,
  width: 180,
  height: 36,
  gap: 8,
} as const

/**
 * A pin's footprint around its anchor, with room for the area label under the
 * dot: 80 wide, 48 above the anchor (the price pill and its dot) and 18 below.
 */
export const PIN_BOX_PX = { halfW: 40, above: 48, below: 18 } as const

export type Rect = { left: number; top: number; right: number; bottom: number }

/** The pin's footprint on a map `width` by `height` pixels. */
export function pinRect(spot: PinSpot, width: number, height: number): Rect {
  const x = spot.x * width
  const y = spot.y * height
  return {
    left: x - PIN_BOX_PX.halfW,
    right: x + PIN_BOX_PX.halfW,
    top: y - PIN_BOX_PX.above,
    bottom: y + PIN_BOX_PX.below,
  }
}

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
  )
}

/** The floating card's largest footprint on a map `width` by `height` pixels. */
export function cardRect(width: number, height: number): Rect {
  return {
    left: CARD_INSET_PX,
    right: CARD_INSET_PX + Math.min(CARD_WIDTH_PX, width - 2 * CARD_INSET_PX),
    top: height - CARD_INSET_PX - CARD_MAX_HEIGHT_PX,
    bottom: height - CARD_INSET_PX,
  }
}

/** The pairs of tasks whose pins would touch on this map, in layout order. */
export function overlappingPins(
  layout: MapLayout,
  width: number,
  height: number,
): [DemoTaskId, DemoTaskId][] {
  const spots = PIN_SPOTS[layout]
  const pairs: [DemoTaskId, DemoTaskId][] = []
  SHOWCASE_ORDER.forEach((a, index) => {
    for (const b of SHOWCASE_ORDER.slice(index + 1)) {
      if (
        rectsOverlap(
          pinRect(spots[a], width, height),
          pinRect(spots[b], width, height),
        )
      ) {
        pairs.push([a, b])
      }
    }
  })
  return pairs
}

/** The tasks whose pins sit under the floating card on this map. */
export function pinsUnderCard(
  layout: MapLayout,
  width: number,
  height: number,
): DemoTaskId[] {
  const card = cardRect(width, height)
  return SHOWCASE_ORDER.filter((id) =>
    rectsOverlap(pinRect(PIN_SPOTS[layout][id], width, height), card),
  )
}

/** The title chip's footprint, with the gap pins keep clear of. */
export function chipRect(): Rect {
  const { inset, width, height, gap } = CHIP_ZONE_PX
  return {
    left: inset - gap,
    top: inset - gap,
    right: inset + width + gap,
    bottom: inset + height + gap,
  }
}

/** The tasks whose pins sit under the title chip on this map. */
export function pinsUnderChip(
  layout: MapLayout,
  width: number,
  height: number,
): DemoTaskId[] {
  const chip = chipRect()
  return SHOWCASE_ORDER.filter((id) =>
    rectsOverlap(pinRect(PIN_SPOTS[layout][id], width, height), chip),
  )
}
