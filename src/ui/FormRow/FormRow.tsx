'use client'

import { Grid, type GridProps } from '@chakra-ui/react'

export type FormRowProps = GridProps

/**
 * SDL form row: fields side by side, `formSpace.inlineGap` (12) apart and of
 * equal width (Min and Max, From and To, First and Last name). Rows align to
 * the top, so an error under one field does not stretch the other.
 */
export function FormRow(props: FormRowProps) {
  return (
    <Grid
      w="full"
      gridAutoFlow="column"
      gridAutoColumns="minmax(0, 1fr)"
      gap="form.inlineGap"
      alignItems="start"
      {...props}
    />
  )
}
