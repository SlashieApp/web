'use client'

import { Heading, Stack, type StackProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { Card } from '@ui'

export type CreateTaskSectionProps = {
  /**
   * Bare mode (stepped create flow): render only the field body, since
   * StepFlowLayout already supplies the raised panel card and the step title.
   * Default (edit page / long-form) wraps the body in a titled section Card.
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
 * Wrapper shared by every task-create section so the field body can render
 * either inside a titled SDL Card (long-form/edit) or bare inside the shared
 * StepFlowLayout panel — with identical body spacing in both.
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
