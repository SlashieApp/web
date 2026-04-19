/**
 * Reusable **primary / tertiary / danger** surface roles (fg, bg, border).
 * Used to build `intent*` semantic tokens in `system.ts` so tags, icons, and
 * pills do not duplicate hex setup per component.
 */
export type IntentTone = 'primary' | 'tertiary' | 'danger'

export type IntentRole = {
  fg: string
  bg: string
  border: string
}

export type IntentPalette = Record<IntentTone, IntentRole>

export const lightIntentPalette: IntentPalette = {
  primary: {
    fg: '#166534',
    bg: '#ecfdf5',
    border: '#86efac',
  },
  tertiary: {
    fg: '#1e3a5f',
    bg: '#eff6ff',
    border: '#93c5fd',
  },
  danger: {
    fg: '#991b1b',
    bg: '#fef2f2',
    border: '#fecaca',
  },
}

export const darkIntentPalette: IntentPalette = {
  primary: {
    fg: '#00DC82',
    bg: 'rgba(0, 220, 130, 0.16)',
    border: '#00DC82',
  },
  tertiary: {
    fg: '#7dd3fc',
    bg: 'rgba(56, 189, 248, 0.14)',
    border: '#7dd3fc',
  },
  danger: {
    fg: '#fda4af',
    bg: 'rgba(251, 113, 133, 0.14)',
    border: '#fda4af',
  },
}

/** Glyph on primary-tinted surfaces (e.g. card icon pod); light / dark. */
export const lightIntentPrimaryIcon = '#059669'
export const darkIntentPrimaryIcon = '#34d399'

type SemanticColorEntry = { value: { base: string } }

/** Flat Chakra semantic color entries: `intentPrimaryFg`, `intentTertiaryBg`, … */
export function intentSemanticColors(
  palette: IntentPalette,
  primaryIconGlyph: string,
): Record<string, SemanticColorEntry> {
  const out: Record<string, SemanticColorEntry> = {}
  const tones: IntentTone[] = ['primary', 'tertiary', 'danger']
  for (const tone of tones) {
    const role = palette[tone]
    const suffix = tone.charAt(0).toUpperCase() + tone.slice(1)
    out[`intent${suffix}Fg`] = { value: { base: role.fg } }
    out[`intent${suffix}Bg`] = { value: { base: role.bg } }
    out[`intent${suffix}Border`] = { value: { base: role.border } }
  }
  out.intentPrimaryIcon = { value: { base: primaryIconGlyph } }
  return out
}
