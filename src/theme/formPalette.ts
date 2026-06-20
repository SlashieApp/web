/**
 * Reusable **form field** semantic colors (labels, inputs, helpers).
 * Feeds `form*` tokens in `system.ts` for light and dark Chakra systems.
 */
type SemanticColorEntry = { value: { base: string } }

export type FormFieldPalette = {
  formLabelMuted: string
  formControlBg: string
  formControlFg: string
  formControlBorder: string
  formControlBorderStrong: string
  formControlPlaceholder: string
  formControlIcon: string
  formControlFocusBorder: string
  formHelperMuted: string
}

export const lightFormField: FormFieldPalette = {
  formLabelMuted: '#6B7370',
  formControlBg: '#F9FAFB',
  formControlFg: '#0B1714',
  formControlBorder: '#E5E7EB',
  formControlBorderStrong: '#D1D5DB',
  formControlPlaceholder: '#6B7370',
  formControlIcon: '#6B7370',
  formControlFocusBorder: '#00DC82',
  formHelperMuted: '#6B7370',
}

export const darkFormField: FormFieldPalette = {
  formLabelMuted: '#94a3b8',
  formControlBg: '#333333',
  formControlFg: '#ffffff',
  formControlBorder: '#404040',
  formControlBorderStrong: '#525252',
  formControlPlaceholder: '#94a3b8',
  formControlIcon: '#94a3b8',
  formControlFocusBorder: '#00DC82',
  formHelperMuted: '#94a3b8',
}

export function formSemanticColors(
  palette: FormFieldPalette,
): Record<string, SemanticColorEntry> {
  const out: Record<string, SemanticColorEntry> = {}
  for (const [key, value] of Object.entries(palette)) {
    out[key] = { value: { base: value } }
  }
  return out
}
