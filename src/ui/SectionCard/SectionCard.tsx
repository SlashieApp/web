'use client'

import { Heading, Stack, type StackProps, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { Card, type CardProps } from '../Card/Card'

export type SectionCardProps = Omit<CardProps, 'children'> & {
  /** Small uppercase label above the heading. */
  eyebrow?: string
  heading?: string
  /** Full header row; when set, `eyebrow` and `heading` are ignored. */
  header?: ReactNode
  bodyGap?: StackProps['gap']
  children?: ReactNode
}

/**
 * Task detail / dashboard style block: shared card chrome plus consistent
 * section title treatment.
 */
export function SectionCard({
  eyebrow,
  heading,
  header,
  bodyGap = 4,
  children,
  p = { base: 5, md: 6 },
  maxW = 'full',
  w = 'full',
  borderRadius = 'xl',
  ...rest
}: SectionCardProps) {
  const titleBlock =
    header ??
    (eyebrow || heading ? (
      <Stack gap={1}>
        {eyebrow ? (
          <Text
            fontSize="xs"
            fontWeight={700}
            color="formLabelMuted"
            letterSpacing="0.06em"
            textTransform="uppercase"
          >
            {eyebrow}
          </Text>
        ) : null}
        {heading ? <Heading size="md">{heading}</Heading> : null}
      </Stack>
    ) : null)

  return (
    <Card p={p} maxW={maxW} w={w} borderRadius={borderRadius} {...rest}>
      <Stack gap={bodyGap}>
        {titleBlock}
        {children}
      </Stack>
    </Card>
  )
}
