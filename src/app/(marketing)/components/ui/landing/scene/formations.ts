import { BREAKPOINT_PX } from '@/theme/breakpoints'
import { PAGE_CONTAINER_MAX_W_CSS } from '@/theme/pageContainer'

import { STORY_STAGES, type StoryStage } from '../story/storyState'

/**
 * The three props of the scene (tone refresh, train 2): a toolbox, boxes and a
 * map pin. Phones and portrait screens keep two of them.
 */
export const SCENE_OBJECTS = ['toolbox', 'boxes', 'pin'] as const

export type SceneObjectId = (typeof SCENE_OBJECTS)[number]

/** Phones and portrait screens (below `lg`) show two objects, not three. */
export const COMPACT_OBJECTS: readonly SceneObjectId[] = ['pin', 'toolbox']

/** The scene camera's distance from the z = 0 plane (`LandingScene`). */
export const CAMERA_Z = 12

/** The screen height the formations are drawn for; the hero keeps its distance from the top on others. */
export const REFERENCE_HEIGHT_PX = 900

/**
 * Where an object sits. `x` / `y` are fractions of the visible viewport at
 * the z = 0 plane (-0.5 = left / bottom edge, 0.5 = right / top edge), so a
 * formation holds its shape on any screen size. `z` is world units toward
 * the camera; rotations are radians.
 */
export type Pose = {
  x: number
  y: number
  z: number
  rx: number
  ry: number
  rz: number
  s: number
}

type FormationName = 'hero' | 'customer' | 'worker' | 'scatter' | 'gather'
type Formation = Record<SceneObjectId, Pose>

function pose(
  x: number,
  y: number,
  z: number,
  rx: number,
  ry: number,
  rz: number,
  s: number,
): Pose {
  return { x, y, z, rx, ry, rz, s }
}

/*
 * Sizes are about 70% of what the scene had with six objects (the toolbox was
 * 1 in the hero, the boxes 0.95, the pin 0.8); the models keep their extents.
 *
 * What the page puts where, so the props stay clear of its text:
 * - hero: centred text from the top of the page and an opaque map panel about
 *   470px down, so the hero formation is in fractions of a 900px tall screen
 *   but keeps its distance from the top on any height (`poseFor`). On wide
 *   screens the toolbox and the boxes flank the search, level with it, and the
 *   pin sits top right. On phones and tablets the text fills the width, so the
 *   two props sit either side of the "See how it works" row, under the trust
 *   row and above the panel.
 * - the acts: steps on the left, the phone pinned in the right column, so the
 *   props hug the right edge, whole, in the strip between the phone and the
 *   right rail (`phoneStripPx`): a prop is scaled down to fit it, and where the
 *   strip is too narrow to hold one at a size that reads (a laptop under 1280px
 *   wide) it waits off the right edge instead of showing as a sliver cut by
 *   the phone. Below `lg` the text runs edge to edge, so the props only peek in
 *   at the screen's edges: how far is capped by the free strip beside the text
 *   (`peekReachPx`), so a prop never reaches into the page's gutter, and a
 *   strip that shows less than `PROP_MIN_FIT` of a prop (a phone's 12px gutter)
 *   shows none of it: it waits off the edge (a sliver reads as a rendering
 *   fault, not an object). Below `lg` each prop also keeps to one side in every
 *   formation (the toolbox left, the pin right), so none ever glides across the
 *   text from one edge to the other.
 * - trust and pricing sit under opaque panels, so their formation is only a
 *   place to wait: off the screen's edges (`parked`), so a prop never shows
 *   sliced by a section's edge while the close scrolls in, and glides in for it.
 *   The hero's formation waits there too once the hero is out of view
 *   (`sceneStage`), so the props are not left in the middle of the screen
 *   behind the map panel and the bento, where their shadows and a box's
 *   underside showed in the transparent strip under the bento.
 * - the close: centred text in a column of 40rem at most, so the props stay
 *   outside it, either side of the heading, and clear of the footer (the footer
 *   is opaque and would slice them: `closeFitPx` lifts them, and where the
 *   room between the header and the footer is smaller than they are, shrinks
 *   them, or parks them).
 */

/**
 * Wide screens (`lg` and up), three objects.
 */
const WIDE: Record<FormationName, Formation> = {
  hero: {
    toolbox: pose(-0.37, 0.07, 0, 0.45, 0.5, 0.08, 0.7),
    boxes: pose(0.37, 0.07, 0, 0.35, -0.5, 0, 0.67),
    pin: pose(0.4, 0.3, 0.5, 0.1, 0.3, -0.15, 0.56),
  },
  customer: {
    toolbox: pose(0.47, 0.27, -0.5, 0.4, -0.6, 0.1, 0.6),
    pin: pose(0.48, 0.02, 0.5, 0.1, 0.3, -0.2, 0.44),
    boxes: pose(0.47, -0.25, 0, 0.3, -0.4, 0, 0.56),
  },
  worker: {
    pin: pose(0.47, 0.28, 0.5, 0.1, 0.3, -0.15, 0.44),
    boxes: pose(0.48, 0.01, -0.5, 0.3, -0.4, 0, 0.5),
    toolbox: pose(0.47, -0.26, 0.5, 0.4, 0.6, 0.05, 0.62),
  },
  // Trust and pricing sit under opaque panels: wait off the right edge (they
  // are `parked`, so the page column does not hold them in).
  scatter: {
    toolbox: pose(0.7, 0.3, -1, 0.4, 0.8, 0.1, 0.52),
    boxes: pose(0.72, -0.3, -1, 0.3, -0.7, 0, 0.49),
    pin: pose(0.74, 0, 0, 0.1, 0.3, -0.1, 0.38),
  },
  gather: {
    toolbox: pose(-0.37, 0.05, 0, 0.45, 0.5, 0.08, 0.63),
    boxes: pose(0.37, 0.05, 0, 0.35, -0.5, 0, 0.6),
    pin: pose(0.42, -0.08, 0.5, 0.1, 0.3, -0.15, 0.46),
  },
}

/**
 * Portrait / narrow screens: two small objects hugging the edges. The boxes
 * are not drawn here (`COMPACT_OBJECTS`), so they keep their wide pose.
 */
const COMPACT: Record<FormationName, Formation> = {
  // Either side of the "See how it works" row, in the margins the trust row
  // and the link leave (the same spot from a phone to a tablet).
  hero: {
    ...WIDE.hero,
    toolbox: pose(-0.39, -0.018, 0, 0.15, 0.5, 0.08, 0.3),
    pin: pose(0.39, 0.01, 0, 0.1, 0.3, -0.15, 0.32),
  },
  // Steps fill the width with text: objects only peek in from the edges (how
  // far is capped, see `peekReachPx`). Each keeps its side in every formation,
  // so none glides across the text; the worker act swaps their heights, not
  // their sides.
  customer: {
    ...WIDE.customer,
    toolbox: pose(-0.52, -0.2, -0.5, 0.4, -0.6, 0.1, 0.35),
    pin: pose(0.52, -0.05, 0, 0.1, 0.3, -0.2, 0.32),
  },
  worker: {
    ...WIDE.worker,
    toolbox: pose(-0.52, -0.05, 0, 0.4, 0.6, 0.05, 0.39),
    pin: pose(0.52, -0.2, 0, 0.1, 0.3, -0.15, 0.32),
  },
  // Parked off the edges, on the sides they keep.
  scatter: {
    ...WIDE.scatter,
    toolbox: pose(-0.72, 0.05, -1, 0.4, 0.8, 0.1, 0.32),
    pin: pose(0.72, 0.34, 0, 0.1, 0.3, -0.1, 0.28),
  },
  gather: {
    ...WIDE.gather,
    toolbox: pose(-0.52, 0.1, 0, 0.45, 0.5, 0.08, 0.35),
    pin: pose(0.52, 0.1, 0.5, 0.1, 0.3, -0.15, 0.32),
  },
}

const FORMATION_FOR_STAGE: Record<StoryStage, FormationName> = {
  hero: 'hero',
  post: 'customer',
  quotes: 'customer',
  chat: 'customer',
  hire: 'customer',
  review: 'customer',
  workerFind: 'worker',
  workerQuote: 'worker',
  workerProfile: 'worker',
  trust: 'scatter',
  pricing: 'scatter',
  cta: 'gather',
}

/** The object each step brings forward (it echoes the step). */
const FOCUS_FOR_STAGE: Partial<Record<StoryStage, SceneObjectId>> = {
  post: 'pin',
  quotes: 'boxes',
  hire: 'toolbox',
  review: 'toolbox',
  workerFind: 'pin',
  workerQuote: 'boxes',
  workerProfile: 'toolbox',
}

/** How far toward the camera the step's object comes, in world units. */
const FOCUS_LIFT = 1.2
/** How much bigger the step's object gets. */
const FOCUS_GROW = 1.2
/** Each step turns every object a little, so the scene moves as you read. */
const TURN_PER_STAGE = 0.45
/** The pin is a flat slab: it sways about its pose instead of turning, so it is never edge-on. */
const PIN_SWAY = 0.45
/** How far the sway moves from one step to the next, in radians of its cycle. */
const PIN_SWAY_STEP = 0.9

/**
 * What each prop reaches from its origin at scale 1, in world units: half its
 * width (the hammer and the spanner, and the quarter turns the formations give
 * it, included), its height above the origin, and its depth below it down to
 * the bottom of its blob shadow. Measured on the rendered models.
 */
export const PROP_REACH: Record<
  SceneObjectId,
  { halfWidth: number; above: number; below: number }
> = {
  toolbox: { halfWidth: 1.25, above: 1.35, below: 1.2 },
  boxes: { halfWidth: 1.15, above: 0.85, below: 1.2 },
  pin: { halfWidth: 0.6, above: 0.9, below: 1.2 },
}

/**
 * How a formation holds its props on the screen:
 * - `free`: where the formation puts them (the hero on a phone, where the text
 *   leaves room beside its last row);
 * - `column`: wide screens keep the whole prop inside the page column's rails
 *   (the hero and the close, which have nothing but centred text);
 * - `strip`: in the acts, from `lg`, the whole prop sits in the free strip
 *   between the pinned phone and the right rail, scaled down to fit, or off the
 *   right edge where the strip is too narrow to hold one that reads;
 * - `peek`: below `lg` the text runs edge to edge, so a prop only peeks in from
 *   the screen's edge, as far as the free strip beside the text (the pose says
 *   which side), or not at all where the strip would show only a sliver;
 * - `parked`: off the screen's edges, under opaque panels.
 */
export type Placement = 'free' | 'column' | 'strip' | 'peek' | 'parked'

export function placementFor(stage: StoryStage, compact: boolean): Placement {
  const name = FORMATION_FOR_STAGE[stage]
  if (name === 'scatter') return 'parked'
  if (name === 'hero') return compact ? 'free' : 'column'
  if (compact) return 'peek'
  return name === 'gather' ? 'column' : 'strip'
}

/**
 * The stage the scene draws. Behind the opaque map panel and bento the hero's
 * formation would sit in the middle of the screen with its shadows showing
 * under them, so once the hero is out of view its props wait where the opaque
 * panels' formation waits (off the edges), and come back with the hero.
 */
export const PARKED_STAGE: StoryStage = 'trust'

export function sceneStage(stage: StoryStage, heroInView: boolean): StoryStage {
  return stage === 'hero' && !heroInView ? PARKED_STAGE : stage
}

/** The text a peeking prop keeps clear of: the acts' steps, or the close's centred column. */
export type PeekLayout = 'steps' | 'centred'

export function peekLayoutFor(stage: StoryStage): PeekLayout {
  return FORMATION_FOR_STAGE[stage] === 'gather' ? 'centred' : 'steps'
}

/** The page column's width (`sizes.page`, 80rem), in px: the rails stand on its edges. */
export const PAGE_COLUMN_PX = Number.parseFloat(PAGE_CONTAINER_MAX_W_CSS) * 16

/** The air a prop keeps between its outer edge and a rail. */
export const RAIL_MARGIN_PX = 16

/** The air a peeking prop keeps between itself and the text. */
export const PEEK_CLEARANCE_PX = 4

/** The page gutter below `lg`: 16px on a phone, 24px from `md`. */
const GUTTER_PX = { base: 16, md: 24 } as const
/** A step's text column, `maxW="38rem"` in the story, and the close's, 40rem. */
const TEXT_MAX_PX = { steps: 608, centred: 640 } as const

/**
 * How far in from the screen's edge a peeking prop may reach (px): the free
 * strip between the edge and the text, less a few px of air. Below `lg` the
 * steps' text starts at the gutter and ends at most 38rem on, so on a phone
 * both strips are the gutter (a sliver) and on a tablet the right one is wide.
 * The close's text is centred.
 */
export function peekReachPx(
  viewportPx: number,
  side: 'left' | 'right',
  layout: PeekLayout,
): number {
  const gutter = viewportPx >= BREAKPOINT_PX.md ? GUTTER_PX.md : GUTTER_PX.base
  const width = Math.min(TEXT_MAX_PX[layout], viewportPx - 2 * gutter)
  const left = layout === 'steps' ? gutter : (viewportPx - width) / 2
  const strip = side === 'left' ? left : viewportPx - (left + width)
  return Math.max(0, strip - PEEK_CLEARANCE_PX)
}

/** The smallest share of a prop that is worth showing: a smaller one waits off the edge. */
export const PROP_MIN_FIT = 0.6

/** The narrowest a strip can be and still hold a prop worth looking at (px). */
export const STRIP_MIN_PX = 48

/**
 * How far past the screen's edge a waiting prop sits (px), beyond its reach: a
 * prop floats, turns and tilts toward the pointer, and its shadow is wider than
 * it is deep, so it needs more than its own width to be fully out of sight.
 */
export const PARK_MARGIN_PX = 48

/** The pinned phone's width: up to 300px, shorter on short screens (`STICKY_PHONE_W`). */
export const PHONE_MAX_PX = 300
export const PHONE_VH_OFFSET_PX = 150
export const PHONE_VH_DIVISOR = 2.1

export function phoneWidthPx(heightPx: number): number {
  return Math.min(
    PHONE_MAX_PX,
    (heightPx - PHONE_VH_OFFSET_PX) / PHONE_VH_DIVISOR,
  )
}

/**
 * The layout of how it works from `lg`, as `LandingStory` sets it: the page's
 * 32px gutter, the phone's column 22rem (352px) wide at `lg`, and from `xl`
 * half of the content less a 64px gap; the phone is centred in its column.
 */
const STORY_GUTTER_PX = 32
const STORY_PHONE_COLUMN_LG_PX = 352
const STORY_COLUMN_GAP_XL_PX = 64

/** The air between a prop and the phone's frame. */
export const PHONE_CLEARANCE_PX = 8

/**
 * The free strip between the pinned phone and the right rail, from `lg`, in px
 * from the screen's centre: `from` is the phone's right edge less nothing but a
 * little air, `to` the rail less its margin. A laptop 1024 to 1279px wide has
 * about 60px of it (the phone column is 352px and the phone 300 at most); from
 * 1280px, 150 to 190px. Pure, so it is unit-tested.
 */
export function phoneStripPx(
  viewportPx: number,
  heightPx: number,
): { from: number; to: number } {
  const page = Math.min(viewportPx, PAGE_COLUMN_PX)
  const content = page - 2 * STORY_GUTTER_PX
  const column =
    viewportPx >= BREAKPOINT_PX.xl
      ? (content - STORY_COLUMN_GAP_XL_PX) / 2
      : STORY_PHONE_COLUMN_LG_PX
  const phoneCentre = page / 2 - STORY_GUTTER_PX - column / 2
  return {
    from: phoneCentre + phoneWidthPx(heightPx) / 2 + PHONE_CLEARANCE_PX,
    to: page / 2 - RAIL_MARGIN_PX,
  }
}

/**
 * The free margin outside the right rail, in px from the screen's centre: on a
 * screen wider than the page column (80rem) there is room beyond the rail, and
 * a prop sits whole in it instead of in the narrower strip beside the phone
 * once that margin is the wider of the two (from about 1650px wide).
 */
export function railMarginStripPx(viewportPx: number): {
  from: number
  to: number
} {
  const rail = Math.min(viewportPx, PAGE_COLUMN_PX) / 2
  return { from: rail + RAIL_MARGIN_PX, to: viewportPx / 2 - RAIL_MARGIN_PX }
}

/** Where a prop is drawn: its x (px from the screen's centre) and how much of its size it keeps. */
export type Placed = { x: number; fit: number }

/**
 * Places a prop horizontally (px from the centre of the screen, where it
 * appears) by its placement, and says how much of its size it keeps (`fit`, 1
 * unless a strip is too narrow for it at its size). `halfPx` is half the prop's
 * width on screen; `restHalfPx` the same for the prop at rest, without the
 * growth a step gives it (so a step's prop is not parked just for being the
 * step's). `free` and `parked` leave the pose's position; `column` holds the
 * whole prop inside the rails; `strip` holds it whole in the strip beside the
 * phone, shrunk to fit; `peek` puts exactly the free strip's worth of it in from
 * the edge the pose is on. Where a strip would show less than `PROP_MIN_FIT` of
 * a prop, the prop is put just off the screen's edge instead (`parkedX`).
 * Pure, so it is unit-tested.
 */
export function placeProp({
  xPx,
  halfPx,
  restHalfPx = halfPx,
  viewportPx,
  heightPx = REFERENCE_HEIGHT_PX,
  placement,
  layout = 'steps',
}: {
  xPx: number
  halfPx: number
  restHalfPx?: number
  viewportPx: number
  heightPx?: number
  placement: Placement
  layout?: PeekLayout
}): Placed {
  if (placement === 'free' || placement === 'parked') {
    return { x: xPx, fit: 1 }
  }
  if (placement === 'column') {
    // The whole prop, not its centre, stays inside the rails (the page column,
    // or the screen where that is narrower), with a margin.
    const rail = Math.min(viewportPx, PAGE_COLUMN_PX) / 2
    const limit = Math.max(0, rail - RAIL_MARGIN_PX - halfPx)
    return { x: Math.max(-limit, Math.min(limit, xPx)), fit: 1 }
  }
  const edge = viewportPx / 2
  if (placement === 'strip') {
    // The strip beside the phone, or the margin outside the rail where that is
    // wider (a wide monitor): the prop sits whole in the wider of the two.
    const beside = phoneStripPx(viewportPx, heightPx)
    const outside = railMarginStripPx(viewportPx)
    const inMargin = outside.to - outside.from > beside.to - beside.from
    const { from, to } = inMargin ? outside : beside
    const room = to - from
    // Too narrow for the prop at rest to read: wait off the right edge.
    if (room < Math.max(STRIP_MIN_PX, PROP_MIN_FIT * 2 * restHalfPx)) {
      return { x: edge + halfPx + PARK_MARGIN_PX, fit: 1 }
    }
    const fit = Math.min(1, room / (2 * halfPx))
    const half = halfPx * fit
    return {
      // Centred in the margin; beside the phone the pose says where (it hugs
      // the rail). Either way the prop stays whole.
      x: inMargin
        ? (from + to) / 2
        : Math.max(from + half, Math.min(to - half, xPx)),
      fit,
    }
  }
  // Peek: the pose only says which side; the prop is placed so that `reach` px
  // of it shows in from that edge (all of it, if it is narrower than that).
  const side = xPx < 0 ? 'left' : 'right'
  const reach = peekReachPx(viewportPx, side, layout)
  if (reach < PROP_MIN_FIT * 2 * restHalfPx) {
    // A sliver reads as a fault, not an object: wait just off the edge.
    const out = edge + halfPx + PARK_MARGIN_PX
    return { x: side === 'left' ? -out : out, fit: 1 }
  }
  const shown = Math.min(reach, 2 * halfPx)
  return {
    x: side === 'left' ? -edge + shown - halfPx : edge - shown + halfPx,
    fit: 1,
  }
}

/** `placeProp`'s x alone. */
export function placeX(args: Parameters<typeof placeProp>[0]): number {
  return placeProp(args).x
}

/** The air between a prop's shadow and the footer's top edge. */
export const FOOTER_MARGIN_PX = 24
/** The air between a prop's top and the header's foot. */
export const HEADER_MARGIN_PX = 8

/** The camera's vertical field of view (degrees): the scene's `Canvas` uses it. */
export const CAMERA_FOV = 32

/** Wide formations are tuned at 16:10; narrower windows shrink the objects. */
export const WIDE_ASPECT = 1.6

/** The height of the z = 0 plane the camera sees, in world units. */
export const WORLD_HEIGHT =
  2 * CAMERA_Z * Math.tan((CAMERA_FOV / 2) * (Math.PI / 180))

/**
 * Sizes follow the viewport height (a perspective camera), so wide formations
 * are shrunk on less-wide windows to keep them off the centre.
 */
export function fitFor(compact: boolean, aspect: number): number {
  return compact ? 1 : Math.min(1, aspect / WIDE_ASPECT)
}

/** The least share of their size the close's props keep before they wait off the edges instead. */
export const CLOSE_MIN_FIT = 0.5

/**
 * How the close's props fit between the header and the opaque footer: lifted
 * (`lift`, px, up), scaled (`scale`, 1 or less, about each prop's own centre) or
 * `parked` (waiting off the screen's edges, as under the opaque panels).
 */
export type CloseFit = { lift: number; scale: number; parked: boolean }

/**
 * Fits the close's props between the header and the footer so that none of
 * them, shadow included, is cut by either. The close's props sit level with its
 * call, and at the foot of the page the footer covers the bottom of the screen
 * (its top edge is at `footerTopPx`; `null`, or past the screen's foot, means no
 * footer in view). They are lifted together, by the most any one needs, so the
 * formation keeps its shape. Where the room between the header and the footer
 * is smaller than the props (a laptop screen under about 900px tall at the end
 * of the page), lifting is not enough: the props are scaled down together until
 * they fit (the largest scale at which a lift exists that clears both edges),
 * and where that would leave them under `CLOSE_MIN_FIT` of their size they are
 * parked, so the footer never slices one. Pure, so it is unit-tested.
 */
export function closeFitPx({
  ids,
  compact,
  widthPx,
  heightPx,
  footerTopPx,
  headerPx,
}: {
  ids: readonly SceneObjectId[]
  compact: boolean
  widthPx: number
  heightPx: number
  footerTopPx: number | null
  headerPx: number
}): CloseFit {
  if (footerTopPx === null) return { lift: 0, scale: 1, parked: false }
  const perUnit = heightPx / WORLD_HEIGHT
  const fit = fitFor(compact, widthPx / heightPx)
  const top = headerPx + HEADER_MARGIN_PX
  const bottom = footerTopPx - FOOTER_MARGIN_PX
  const props = ids.map((id) => {
    const pose = poseFor(id, 'cta', compact, heightPx)
    const near = CAMERA_Z / (CAMERA_Z - pose.z)
    const px = perUnit * near * pose.s * fit
    return {
      centre: heightPx / 2 - pose.y * heightPx * near,
      above: PROP_REACH[id].above * px,
      below: PROP_REACH[id].below * px,
    }
  })
  // At scale k, prop i's foot is at `centre + below k - lift` and prop j's top at
  // `centre - above k - lift`. A lift clears both edges for every prop when, for
  // every pair, the lowest foot and the highest top fit in the room:
  //   (centre_i + below_i k) - bottom <= (centre_j - above_j k) - top.
  let scale = 1
  for (const low of props) {
    for (const high of props) {
      scale = Math.min(
        scale,
        (high.centre - low.centre + (bottom - top)) / (low.below + high.above),
      )
    }
  }
  scale = Math.max(0, scale)
  if (scale < CLOSE_MIN_FIT) return { lift: 0, scale: 1, parked: true }
  const needed = Math.max(
    ...props.map((prop) => prop.centre + prop.below * scale - bottom),
  )
  const room = Math.min(
    ...props.map((prop) => prop.centre - prop.above * scale - top),
  )
  return {
    lift: Math.max(0, Math.min(needed, Math.max(0, room))),
    scale,
    parked: false,
  }
}

/**
 * Target pose for one object at one stage. Pure, so it is unit-tested.
 *
 * `heightPx` is the screen's height. The hero's text and map panel sit a fixed
 * number of pixels from the top of the page whatever the screen's height, so
 * the hero formation keeps its distance from the top (a tall screen would
 * otherwise carry the props down behind the panel). Every other formation is
 * a fraction of the screen. `withFocus` false gives the pose at rest, without the
 * growth and lift the step's own object gets (what a strip is sized by).
 */
export function poseFor(
  id: SceneObjectId,
  stage: StoryStage,
  compact: boolean,
  heightPx: number = REFERENCE_HEIGHT_PX,
  withFocus = true,
): Pose {
  const name = FORMATION_FOR_STAGE[stage]
  const placed = (compact ? COMPACT : WIDE)[name][id]
  const base =
    name === 'hero'
      ? {
          ...placed,
          y: 0.5 - ((0.5 - placed.y) * REFERENCE_HEIGHT_PX) / heightPx,
        }
      : placed
  const index = STORY_STAGES.indexOf(stage)
  const turn =
    id === 'pin'
      ? Math.sin(index * PIN_SWAY_STEP) * PIN_SWAY
      : index * TURN_PER_STAGE
  const focused = withFocus && !compact && FOCUS_FOR_STAGE[stage] === id
  if (!focused) return { ...base, ry: base.ry + turn }
  // Nearer the camera, an object drifts outward in the picture; scale x and y
  // back so it grows in place, beside the phone, instead of leaving the screen.
  const z = base.z + FOCUS_LIFT
  const keep = (CAMERA_Z - z) / (CAMERA_Z - base.z)
  return {
    ...base,
    x: base.x * keep,
    y: base.y * keep,
    z,
    ry: base.ry + turn,
    s: base.s * FOCUS_GROW,
  }
}
