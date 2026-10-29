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
 *   props hug the right edge (they peek out from behind the phone on laptops
 *   and sit in the margin beside it on wide screens). Nothing sits between the
 *   steps and the phone: there is no room there at `lg`. Below `lg` they peek
 *   in at the edges beside the inline phone.
 * - trust and pricing sit under opaque panels, so their formation is only a
 *   place to wait.
 * - the close: centred text in a column of 40rem at most, so the props stay
 *   outside it, either side of the heading.
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
  // Trust and pricing sit under opaque panels: wait at the right edge.
  scatter: {
    toolbox: pose(0.44, 0.3, -1, 0.4, 0.8, 0.1, 0.52),
    boxes: pose(0.45, -0.3, -1, 0.3, -0.7, 0, 0.49),
    pin: pose(0.47, 0, 0, 0.1, 0.3, -0.1, 0.38),
  },
  gather: {
    toolbox: pose(-0.37, 0.05, 0, 0.45, 0.5, 0.08, 0.63),
    boxes: pose(0.37, 0.05, 0, 0.35, -0.5, 0, 0.6),
    pin: pose(0.41, -0.14, 0.5, 0.1, 0.3, -0.15, 0.46),
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
    toolbox: pose(-0.39, -0.01, 0, 0.15, 0.5, 0.08, 0.3),
    pin: pose(0.39, 0.01, 0, 0.1, 0.3, -0.15, 0.32),
  },
  // Steps fill the width with text: objects only peek in from the edges.
  customer: {
    ...WIDE.customer,
    toolbox: pose(-0.52, -0.2, -0.5, 0.4, -0.6, 0.1, 0.35),
    pin: pose(0.52, -0.05, 0, 0.1, 0.3, -0.2, 0.32),
  },
  worker: {
    ...WIDE.worker,
    toolbox: pose(0.52, -0.2, 0, 0.4, 0.6, 0.05, 0.39),
    pin: pose(-0.52, -0.05, 0, 0.1, 0.3, -0.15, 0.32),
  },
  scatter: {
    ...WIDE.scatter,
    toolbox: pose(0.48, 0.05, -1, 0.4, 0.8, 0.1, 0.32),
    pin: pose(-0.47, 0.34, 0, 0.1, 0.3, -0.1, 0.28),
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
 * The widest the props sit from the screen's centre, in CSS pixels. The page
 * column is 80rem (640px a side) and the phone ends 170px short of its rail,
 * so this is the middle of the strip beside the phone. Past it a wide screen
 * would carry the props off into the empty margin, away from the page.
 */
export const WIDE_X_LIMIT_PX = 555

/**
 * Keeps a prop's horizontal position (px from the centre of the screen) inside
 * the page column on wide screens. Narrower screens are not limited: their
 * formations are fractions of a screen that is the page.
 */
export function limitX(xPx: number, compact: boolean): number {
  if (compact) return xPx
  return Math.max(-WIDE_X_LIMIT_PX, Math.min(WIDE_X_LIMIT_PX, xPx))
}

/**
 * Target pose for one object at one stage. Pure, so it is unit-tested.
 *
 * `heightPx` is the screen's height. The hero's text and map panel sit a fixed
 * number of pixels from the top of the page whatever the screen's height, so
 * the hero formation keeps its distance from the top (a tall screen would
 * otherwise carry the props down behind the panel). Every other formation is
 * a fraction of the screen.
 */
export function poseFor(
  id: SceneObjectId,
  stage: StoryStage,
  compact: boolean,
  heightPx: number = REFERENCE_HEIGHT_PX,
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
  const focused = !compact && FOCUS_FOR_STAGE[stage] === id
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
