/**
 * WebGL colours for the landing objects. WebGL can't read Chakra tokens, so
 * this is the one sanctioned place for raw hex on the landing: greens mirror
 * the SDL green scale (`src/theme/chakraSystem.ts`); the rest are material
 * colours (cardboard, wood, metal, mop) that have no UI token.
 */
export const SCENE_COLORS = {
  /** green.600: main glossy plastic. */
  plastic: '#02A567',
  /** green.500: tape, stripes, highlights. */
  plasticLight: '#00C275',
  /** green.800: handles, grips, trims. */
  plasticDark: '#05683F',
  /** green.900: bucket interior. */
  plasticDeep: '#053D27',
  cardboard: '#CFA06A',
  cardboardDark: '#B9874F',
  wood: '#C9935A',
  metal: '#C9D1CE',
  /** Mop strands and roller sleeve. */
  fabric: '#F3F1EA',
  /** neutral.900 at low opacity: blob shadows. */
  shadow: '#0A1512',
} as const
