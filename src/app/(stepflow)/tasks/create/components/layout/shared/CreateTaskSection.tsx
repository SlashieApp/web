'use client'

import { Heading, Stack } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { Card, FormStack } from '@ui'

export type CreateTaskSectionProps = {
  /**
   * Bare mode (create flow): only the fields, since the step panel already
   * has the title. Default (edit page) wraps them in a titled section Card.
   */
  bare?: boolean
  /** Section heading (card mode only; ignored when `bare`). */
  heading: string
  /** Optional supporting copy under the heading (card mode only). */
  headingSubtext?: ReactNode
  children: ReactNode
}

/**
 * Wrapper shared by every task section so the fields render either bare in a
 * create step or inside a titled section Card, with the same spacing: the
 * fields are `fieldGap` (20) apart, the form stack (FE-481).
 */
export function CreateTaskSection({
  bare = false,
  heading,
  headingSubtext,
  children,
}: CreateTaskSectionProps) {
  if (bare) {
    return <FormStack>{children}</FormStack>
  }

  return (
    <Card
      layout="section"
      bodyGap="form.fieldGap"
      header={
        headingSubtext ? (
          <Stack gap={1}>
            <Heading size="lg" color="text.link">
              {heading}
            </Heading>
            {headingSubtext}
          </Stack>
        ) : (
          <Heading size="lg" color="text.link">
            {heading}
          </Heading>
        )
      }
    >
      {children}
    </Card>
  )
}
