/**
 * The drawn map behind the pins (`MapShowcase`): a quiet, monochrome sketch of
 * a city, with no tiles and no network. The shapes are data so the component
 * stays small; colours are chosen in the component, from semantic tokens.
 *
 * Drawn on one canvas that the map crops to its box (`slice`, centred): the
 * river runs down the middle, so every crop, from a phone to a wide screen,
 * keeps it, and the street grid is the same everywhere, so a crop never shows
 * an edge.
 */
export const MAP_VIEWBOX = { width: 1200, height: 600 } as const

/** The river: one stroke that bends down the middle of the canvas. */
export const MAP_RIVER =
  'M 600 -40 C 540 90, 660 190, 612 310 S 548 500, 604 640'
export const MAP_RIVER_WIDTH = 46

/** Wide roads, drawn with a hairline casing. They cross the river (bridges). */
export const MAP_MAJOR_ROADS: readonly string[] = [
  'M -40 430 C 180 400, 360 320, 560 300 S 900 230, 1240 110',
  'M -40 120 C 160 170, 340 210, 520 180 S 860 140, 1240 330',
  'M 300 -40 C 330 140, 280 300, 340 460 S 390 600, 360 640',
  'M 760 -40 C 740 120, 800 240, 760 370 S 720 540, 770 640',
  'M 1010 -40 C 990 140, 1040 270, 1015 390 S 970 540, 1010 640',
  'M -40 520 C 200 500, 420 550, 640 505 S 1000 470, 1240 530',
]
export const MAP_MAJOR_ROAD_WIDTH = 9

/** Parks: soft rounded patches a shade darker than the land. */
export const MAP_PARKS: readonly {
  x: number
  y: number
  width: number
  height: number
  radius: number
}[] = [
  { x: 200, y: 262, width: 150, height: 92, radius: 30 },
  { x: 812, y: 52, width: 176, height: 104, radius: 34 },
  { x: 392, y: 424, width: 124, height: 84, radius: 28 },
  { x: 940, y: 462, width: 150, height: 84, radius: 30 },
  { x: 64, y: 52, width: 110, height: 72, radius: 26 },
]

/**
 * Local streets: two families of near-parallel lines at slightly different
 * tilts, with spacing that varies in a fixed pattern so the blocks are not all
 * one size. Deterministic (the same on the server and the client).
 */
export const MAP_STREET_SPACING = { min: 58, max: 98 } as const

/** The gap before street `index`: 58 to 98, stepping in a fixed pattern. */
export function streetSpacing(index: number): number {
  const { min, max } = MAP_STREET_SPACING
  const steps = 5
  const step = (max - min) / (steps - 1)
  return min + ((index * 53 + 17) % steps) * step
}

/** Positions along an axis from `start` to past `end`, spaced by `streetSpacing`. */
export function streetPositions(
  start: number,
  end: number,
  offset = 0,
): number[] {
  const positions: number[] = []
  let at = start
  for (let index = offset; at <= end; index += 1) {
    positions.push(Math.round(at))
    at += streetSpacing(index)
  }
  return positions
}

function buildMinorStreets(): string[] {
  const { width, height } = MAP_VIEWBOX
  // Near-vertical streets, leaning about 10 degrees.
  const verticals = streetPositions(-120, width + 120).map(
    (x) => `M ${x + 60} -40 L ${x - 60} ${height + 40}`,
  )
  // Near-horizontal streets, leaning about 4 degrees.
  const horizontals = streetPositions(-60, height + 60, 7).map(
    (y) => `M -40 ${y - 40} L ${width + 40} ${y + 40}`,
  )
  return [...verticals, ...horizontals]
}

export const MAP_MINOR_STREETS: readonly string[] = buildMinorStreets()
export const MAP_MINOR_STREET_WIDTH = 3
