/**
 * Slashie Design-System values mapped for Chakra theme + `@ui` components.
 * Source: `Design-System/*.md`
 */

/** Brand & neutrals (colors.md Slashie quick reference) */
export const dsColors = {
  brand: '#00DC82',
  brandStrong: '#00AB63',
  brandMedium: '#53D388',
  brandSoft: '#92E7B7',
  brandSofter: '#D9F4E5',
  heading: '#0B1714',
  body: '#6B7370',
  bodySubtle: '#3F4B45',
  pageBg: '#F7F9F8',
  cardBg: '#FFFFFF',
  borderDefault: '#E5E7EB',
  borderDefaultMedium: '#E5E7EB',
  borderBrand: '#00DC82',
  success: '#22C55E',
  danger: '#EF4444',
  disabledBg: '#F3F4F6',
  disabledFg: '#9CA3AF',
  inputBg: '#F9FAFB',
} as const

/** shadows.md */
export const dsShadows = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const

/** buttons.md glint layer */
export function dsButtonGlint(shadowBase: string = dsShadows.xs): string {
  return `${shadowBase}, inset rgba(255, 255, 255, 0.25) 0 6px 0 -5px, rgba(0, 0, 0, 0.12) 0 4px 10px -5px`
}

/** buttons.md sizes — fontSize / px / py */
export const dsButtonSizes = {
  xs: { fontSize: '12px', px: 3, py: 1.5 },
  sm: { fontSize: '14px', px: 3, py: 2 },
  md: { fontSize: '14px', px: 4, py: 2.5 },
  lg: { fontSize: '16px', px: 5, py: 3 },
  xl: { fontSize: '16px', px: 6, py: 3.5 },
} as const

/** inputs.md */
export const dsInput = {
  fontSize: '14px',
  px: 3,
  py: 2.5,
  radius: 'md',
  minH: '40px',
} as const

/** cards.md */
export const dsCard = {
  radius: 'md',
  shadow: dsShadows.xs,
} as const
