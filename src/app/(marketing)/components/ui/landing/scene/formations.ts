import { STORY_STAGES, type StoryStage } from '../story/storyState'

export const SCENE_OBJECTS = [
  'toolbox',
  'bucket',
  'boxes',
  'roller',
  'screwdriver',
  'pin',
] as const

export type SceneObjectId = (typeof SCENE_OBJECTS)[number]

/** Phones and portrait screens show three objects, not six. */
export const COMPACT_OBJECTS: readonly SceneObjectId[] = [
  'pin',
  'toolbox',
  'roller',
]

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

/**
 * Wide screens. The phone sits centred low in the hero, then pinned in the
 * right column (x ~ 0.22) through both acts, so act formations stay on the
 * right half and clear of the step text on the left.
 */
const WIDE: Record<FormationName, Formation> = {
  hero: {
    toolbox: pose(-0.33, 0.02, 0, 0.45, 0.5, 0.08, 1),
    bucket: pose(-0.37, -0.31, 0.5, 0.3, -0.3, -0.05, 0.95),
    pin: pose(-0.18, -0.3, 1.5, 0.1, 0.4, -0.15, 0.8),
    boxes: pose(0.33, 0.02, 0, 0.35, -0.5, 0, 0.95),
    roller: pose(0.36, -0.29, 0.5, 0.3, -0.4, 0.5, 1),
    screwdriver: pose(0.2, -0.34, 1.5, 0.2, 0.3, -0.9, 1),
  },
  customer: {
    toolbox: pose(0.43, 0.27, -0.5, 0.4, -0.6, 0.1, 0.85),
    boxes: pose(0.44, -0.21, 0, 0.3, -0.4, 0, 0.8),
    bucket: pose(0.06, -0.36, -0.8, 0.3, 0.4, 0, 0.7),
    pin: pose(0.07, 0.3, 1, 0.1, 0.5, -0.2, 0.6),
    roller: pose(0.48, 0.02, -1.5, 0.3, -0.3, 0.6, 0.75),
    screwdriver: pose(0.34, -0.43, 1, 0.2, 0.2, -1.1, 0.7),
  },
  worker: {
    toolbox: pose(0.07, -0.3, 1.2, 0.4, 0.6, 0.05, 1.05),
    screwdriver: pose(0.42, 0.3, 1, 0.2, -0.2, -0.7, 0.95),
    roller: pose(0.45, -0.25, 0.5, 0.3, -0.4, 0.4, 0.95),
    pin: pose(0.07, 0.3, 0.5, 0.1, 0.4, -0.15, 0.6),
    boxes: pose(0.49, 0.03, -2, 0.3, -0.4, 0, 0.6),
    bucket: pose(0.3, -0.48, -2, 0.3, 0.3, 0, 0.55),
  },
  // Trust + pricing are left-aligned and full width: keep the right side
  // busy and only let objects peek in from the far left.
  scatter: {
    toolbox: pose(0.4, 0.33, -1, 0.4, 0.8, 0.1, 0.75),
    boxes: pose(0.44, -0.3, -1, 0.3, -0.7, 0, 0.7),
    roller: pose(0.33, 0.02, -0.5, 0.3, -0.5, 0.5, 0.7),
    screwdriver: pose(0.47, -0.02, 0, 0.2, 0.3, -0.8, 0.6),
    bucket: pose(-0.57, -0.33, -1, 0.3, -0.5, 0, 0.65),
    pin: pose(-0.56, 0.3, 0, 0.1, 0.6, -0.1, 0.5),
  },
  gather: {
    toolbox: pose(-0.36, 0.22, 0, 0.45, 0.5, 0.08, 0.9),
    bucket: pose(-0.38, -0.2, 0.3, 0.3, -0.3, -0.05, 0.85),
    pin: pose(-0.22, -0.33, 1.2, 0.1, 0.4, -0.15, 0.65),
    boxes: pose(0.36, 0.22, 0, 0.35, -0.5, 0, 0.85),
    roller: pose(0.38, -0.2, 0.3, 0.3, -0.4, 0.5, 0.9),
    screwdriver: pose(0.22, -0.34, 1.2, 0.2, 0.3, -0.9, 0.7),
  },
}

/** Portrait / narrow screens: three small objects hugging the edges. */
const COMPACT: Record<FormationName, Formation> = {
  ...WIDE,
  hero: {
    ...WIDE.hero,
    pin: pose(0.37, -0.02, 1, 0.1, 0.4, -0.15, 0.5),
    toolbox: pose(-0.4, -0.16, 0, 0.45, 0.5, 0.08, 0.55),
    roller: pose(0.41, -0.38, 0, 0.3, -0.4, 0.5, 0.55),
  },
  // Steps fill the width with text: objects only peek in from the edges.
  customer: {
    ...WIDE.customer,
    pin: pose(0.5, 0.3, 0, 0.1, 0.5, -0.2, 0.45),
    toolbox: pose(-0.52, -0.05, -0.5, 0.4, -0.6, 0.1, 0.5),
    roller: pose(0.5, -0.38, 0, 0.3, -0.3, 0.6, 0.5),
  },
  worker: {
    ...WIDE.worker,
    pin: pose(-0.5, 0.3, 0, 0.1, 0.4, -0.15, 0.45),
    toolbox: pose(0.52, -0.08, 0, 0.4, 0.6, 0.05, 0.55),
    roller: pose(-0.5, -0.38, 0, 0.3, -0.4, 0.4, 0.5),
  },
  scatter: {
    ...WIDE.scatter,
    pin: pose(-0.47, 0.34, 0, 0.1, 0.6, -0.1, 0.4),
    toolbox: pose(0.48, 0.05, -1, 0.4, 0.8, 0.1, 0.45),
    roller: pose(-0.46, -0.36, -1, 0.3, -0.5, 0.5, 0.45),
  },
  gather: {
    ...WIDE.gather,
    pin: pose(0.38, 0.3, 0.5, 0.1, 0.4, -0.15, 0.45),
    toolbox: pose(-0.42, 0.18, 0, 0.45, 0.5, 0.08, 0.5),
    roller: pose(0.4, -0.34, 0.3, 0.3, -0.4, 0.5, 0.5),
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

/** The object each step pulls toward the phone (it echoes the step). */
const FOCUS_FOR_STAGE: Partial<Record<StoryStage, SceneObjectId>> = {
  post: 'pin',
  quotes: 'boxes',
  hire: 'toolbox',
  review: 'roller',
  workerFind: 'pin',
  workerQuote: 'screwdriver',
  workerProfile: 'toolbox',
}

/**
 * Beside the pinned phone's left edge, nearer the camera: below the pin's
 * spot (y 0.3) and above the bucket's (y -0.36) so a big focus object
 * doesn't land on either.
 */
const WIDE_FOCUS = { x: 0.06, y: -0.06, z: 2 }
/** Each step turns every object a little, so the scene moves as you read. */
const TURN_PER_STAGE = 0.45

/** Target pose for one object at one stage. Pure, so it is unit-tested. */
export function poseFor(
  id: SceneObjectId,
  stage: StoryStage,
  compact: boolean,
): Pose {
  const base = (compact ? COMPACT : WIDE)[FORMATION_FOR_STAGE[stage]][id]
  const turn = STORY_STAGES.indexOf(stage) * TURN_PER_STAGE
  const focused = !compact && FOCUS_FOR_STAGE[stage] === id
  if (!focused) return { ...base, ry: base.ry + turn }
  return {
    ...base,
    ...WIDE_FOCUS,
    ry: base.ry + turn,
    s: base.s * 1.2,
  }
}
