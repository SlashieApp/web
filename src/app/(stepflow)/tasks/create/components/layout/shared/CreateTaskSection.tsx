'use client'

import { Heading, Stack, type StackProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { Card } from '@ui'

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
  bodyGap?: StackProps['gap']
  children: ReactNode
}

/**
 * Wrapper shared by every task section so the fields render either bare in a
 * create step or inside a titled section Card on edit, with the same spacing.
 */
export function CreateTaskSection({
  bare = false,
  heading,
  headingSubtext,
  bodyGap = 4,
  children,
}: CreateTaskSectionProps) {
  if (bare) {
    return <Stack gap={bodyGap}>{children}</Stack>
  }

  return (
    <Card
      layout="section"
      bodyGap={bodyGap}
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
