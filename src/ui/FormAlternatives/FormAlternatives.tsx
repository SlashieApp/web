'use client'

import { Stack, type StackProps } from '@chakra-ui/react'

export type FormAlternativesProps = StackProps

/**
 * SDL alternatives group: stacked alternative or secondary buttons
 * `formSpace.alternativesGap` (8) apart. Google and Apple under the "Or continue
 * with" divider; Continue and Resend on a status page. Give each button
 * `size="form"` so they are 48 tall.
 */
export function FormAlternatives(props: FormAlternativesProps) {
  return <Stack gap="form.alternativesGap" w="full" {...props} />
}
