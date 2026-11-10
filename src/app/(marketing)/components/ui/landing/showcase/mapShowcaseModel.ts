import { formatMessage } from '@/i18n/loadPageI11n'
import { BREAKPOINT_PX } from '@/theme/breakpoints'
import { PAGE_CONTAINER_PX } from '@/theme/pageContainer'

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
  /**
   * The pin button's accessible name: "Show the £45 task, Camden". It holds
   * both words the pin shows (the price and the area), so a voice command that
   * says either finds it (WCAG 2.5.3), and no two pins share a name.
   */
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
      pinLabel: `${formatMessage(copy.search.selectPin, { price: task.price })}, ${task.area}`,
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
 * The map's two layouts. Below `lg` the card sits under the map, so the pins
 * use all of it; from `lg` the card opens beside the selected pin, like a
 * popover, and the pins leave room for it. Fractions of the map box.
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
    move: { x: 0.34, y: 0.22 },
    wardrobe: { x: 0.8, y: 0.3 },
    paint: { x: 0.14, y: 0.54 },
    hedge: { x: 0.4, y: 0.72 },
    clean: { x: 0.86, y: 0.86 },
  },
}

/**
 * The map box's height on a phone (below `sm`), in px: short enough for the
 * card under it to show on the first scroll past the hero.
 */
export const MAP_PHONE_HEIGHT_PX = 300

/**
 * The map box's aspect ratio (width / height) from each breakpoint up,
 * mirrored in the component's CSS: 3:2 from `sm`, 9:5 from `md`, 11:5 from
 * `lg`. (Below `sm` it is `MAP_PHONE_HEIGHT_PX` tall at any width.)
 */
export const MAP_ASPECT = {
  sm: 3 / 2,
  md: 9 / 5,
  lg: 11 / 5,
} as const

/** The layout the map uses on a viewport this wide. */
export function layoutAt(viewportWidth: number): MapLayout {
  return viewportWidth >= BREAKPOINT_PX.lg ? 'wide' : 'narrow'
}

/**
 * The map box on a viewport this wide, in px: the page column, edge to edge
 * (no gutters, no inset: the map runs between the frame's rails), at the
 * phone's height or the breakpoint's aspect ratio.
 */
export function mapSizeAt(viewportWidth: number): {
  width: number
  height: number
} {
  const width = Math.min(viewportWidth, PAGE_CONTAINER_PX)
  if (viewportWidth < BREAKPOINT_PX.sm) {
    return { width, height: MAP_PHONE_HEIGHT_PX }
  }
  const aspect =
    viewportWidth >= BREAKPOINT_PX.lg
      ? MAP_ASPECT.lg
      : viewportWidth >= BREAKPOINT_PX.md
        ? MAP_ASPECT.md
        : MAP_ASPECT.sm
  return { width, height: width / aspect }
}

/** The card beside its pin, from `lg`: its width and its tallest case (a two-line title under a tag, plus the meta line). */
export const CARD_WIDTH_PX = 320
export const CARD_MAX_HEIGHT_PX = 124
/**
 * The gap between the card and its pin's footprint. Small, because the
 * footprint already holds air round the pill: the card lands about 16px from
 * what is drawn, close enough to read as the pin's own.
 */
export const CARD_GAP_PX = 4

/**
 * Which side of its pin a task's card opens on (the one with room), and which
 * of its edges lines up with the pin: its top with the pill's top, or its foot
 * with the area label's foot.
 */
export type CardPlacement = { side: 'left' | 'right'; align: 'top' | 'bottom' }

export const CARD_PLACEMENT: Record<DemoTaskId, CardPlacement> = {
  move: { side: 'right', align: 'top' },
  wardrobe: { side: 'left', align: 'top' },
  paint: { side: 'right', align: 'bottom' },
  hedge: { side: 'right', align: 'top' },
  clean: { side: 'left', align: 'bottom' },
}

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
 * dot (12px caps, the longest area about 84px wide): 88 wide, 48 above the
 * anchor (the price pill and its dot) and 20 below.
 */
export const PIN_BOX_PX = { halfW: 44, above: 48, below: 20 } as const

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

/**
 * The card's CSS insets in the map box, from `lg`: beside its pin's footprint
 * with the gap between them, level with the footprint's top or its foot.
 */
export function cardInsets(
  id: DemoTaskId,
): Partial<Record<'left' | 'right' | 'top' | 'bottom', string>> {
  const spot = PIN_SPOTS.wide[id]
  const { side, align } = CARD_PLACEMENT[id]
  const across = PIN_BOX_PX.halfW + CARD_GAP_PX
  const percent = (fraction: number) => `${fraction * 100}%`
  return {
    ...(side === 'right'
      ? { left: `calc(${percent(spot.x)} + ${across}px)` }
      : { right: `calc(${percent(1 - spot.x)} + ${across}px)` }),
    ...(align === 'top'
      ? { top: `calc(${percent(spot.y)} - ${PIN_BOX_PX.above}px)` }
      : { bottom: `calc(${percent(1 - spot.y)} - ${PIN_BOX_PX.below}px)` }),
  }
}

/**
 * The card's largest footprint beside its pin on a map `width` by `height`
 * pixels: `cardInsets` in px, at the card's tallest.
 */
export function cardRect(id: DemoTaskId, width: number, height: number): Rect {
  const pin = pinRect(PIN_SPOTS.wide[id], width, height)
  const { side, align } = CARD_PLACEMENT[id]
  const left =
    side === 'right'
      ? pin.right + CARD_GAP_PX
      : pin.left - CARD_GAP_PX - CARD_WIDTH_PX
  const top = align === 'top' ? pin.top : pin.bottom - CARD_MAX_HEIGHT_PX
  return {
    left,
    right: left + CARD_WIDTH_PX,
    top,
    bottom: top + CARD_MAX_HEIGHT_PX,
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

/** The tasks whose pins sit under the card of task `id` on this map. */
export function pinsUnderCard(
  id: DemoTaskId,
  width: number,
  height: number,
): DemoTaskId[] {
  const card = cardRect(id, width, height)
  return SHOWCASE_ORDER.filter((other) =>
    rectsOverlap(pinRect(PIN_SPOTS.wide[other], width, height), card),
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
