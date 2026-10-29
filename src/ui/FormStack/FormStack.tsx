'use client'

import { Stack, type StackProps } from '@chakra-ui/react'

export type FormStackProps = Omit<StackProps, 'gap'> & {
  /**
   * `field` (default): `formSpace.fieldGap` (20) between fields, checkbox rows,
   * the security check, a form-level note or error and the main button.
   * `section`: `formSpace.sectionGap` (32) between the sections of a long form.
   */
  gap?: 'field' | 'section'
}

const GAP = {
  field: 'form.fieldGap',
  section: 'form.sectionGap',
} as const

/**
 * SDL form stack: the vertical rhythm of a form. Fields sit 20 apart and the
 * main button is one more child, so the last field is 20 above it. Wrap
 * {@link FormSection}s in `<FormStack gap="section">` for a long form (32 apart,
 * no dividing lines).
 *
 * The gap is the `form.*` spacing token, so a screen never types a step or a
 * px for it. A `null` child adds no gap.
 */
export function FormStack({ gap = 'field', ...props }: FormStackProps) {
  return <Stack gap={GAP[gap]} w="full" {...props} />
}
