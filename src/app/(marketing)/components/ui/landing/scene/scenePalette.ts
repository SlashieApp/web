/**
 * WebGL colours for the landing objects. WebGL can't read Chakra tokens, so
 * this is the one sanctioned place for raw hex on the landing (the unit test
 * `scenePalette.test.ts` keeps it that way).
 *
 * The props are white and zinc with one green part each (tone refresh, train
 * 2). The zincs mirror the SDL neutral ramp (`src/theme/chakraSystem.ts`) and
 * the green is the brand fill, `green.400`. No cardboard, wood or metal tones.
 */
export const SCENE_COLORS = {
  /** neutral.0: the lightest planes. */
  white: '#FFFFFF',
  /** neutral.200: main bodies. */
  neutral200: '#E4E4E7',
  /** neutral.300: second bodies, shafts. */
  neutral300: '#D4D4D8',
  /** neutral.400: seams and fine tools. */
  neutral400: '#A1A1AA',
  /** neutral.500: latches, posts, handles. */
  neutral500: '#71717A',
  /** The ink of the scene (zinc 800): the hammer head and little else. */
  ink: '#27272A',
  /** green.400: the one green part of each object. A fill, never a line. */
  accent: '#00DC82',
  /** Ink at low opacity: blob shadows. */
  shadow: '#27272A',
} as const

export type SceneColor = (typeof SCENE_COLORS)[keyof typeof SCENE_COLORS]
