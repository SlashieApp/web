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
  formControlPlaceholder: string
  formControlIcon: string
  formControlFocusBorder: string
  formHelperMuted: string
}

export const lightFormField: FormFieldPalette = {
  formLabelMuted: '#64748b',
  formControlBg: '#ffffff',
  formControlFg: '#1f2623',
  formControlBorder: 'rgba(0, 0, 0, 0.14)',
  formControlPlaceholder: '#6b7280',
  formControlIcon: '#64748b',
  formControlFocusBorder: '#00A572',
  formHelperMuted: '#5f6665',
}

export const darkFormField: FormFieldPalette = {
  formLabelMuted: '#94a3b8',
  formControlBg: '#333333',
  formControlFg: '#ffffff',
  formControlBorder: '#333333',
  formControlPlaceholder: '#94a3b8',
  formControlIcon: '#94a3b8',
  formControlFocusBorder: '#94a3b8',
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
