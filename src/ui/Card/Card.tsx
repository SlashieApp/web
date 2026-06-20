'use client'

import {
  Box,
  type BoxProps,
  Heading,
  Stack,
  type StackProps,
  Text,
} from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { dsCardInteractive, dsCardSurface } from '../designSystemStyles'

export type CardProps = BoxProps & {
  children?: ReactNode
  /** Highlights the card border for selected/active states. */
  isActive?: boolean
  activeBorderColor?: BoxProps['borderColor']
  /** Clickable card — adds hover surface per Design-System/cards.md. */
  interactive?: boolean
  /**
   * `section` — dashboard / task-detail block with optional eyebrow + heading
   * and stacked body (`bodyGap`). Default card is a plain wrapper.
   */
  layout?: 'default' | 'section'
  /** Small uppercase label above the heading (`layout="section"`). */
  eyebrow?: string
  heading?: string
  /** Full header row; when set, `eyebrow` and `heading` are ignored. */
  header?: ReactNode
  bodyGap?: StackProps['gap']
}

function CardTitleBlock({
  eyebrow,
  heading,
  header,
}: Pick<CardProps, 'eyebrow' | 'heading' | 'header'>) {
  if (header) return header
  if (!eyebrow && !heading) return null

  return (
    <Stack gap={1}>
      {eyebrow ? (
        <Text
          fontSize="xs"
          fontWeight={500}
          color="formLabelMuted"
          letterSpacing="0.06em"
          textTransform="uppercase"
        >
          {eyebrow}
        </Text>
      ) : null}
      {heading ? (
        <Heading
          as="h3"
          fontSize={{ base: '16px', md: '20px' }}
          fontWeight={500}
          color="cardFg"
          lineHeight="short"
        >
          {heading}
        </Heading>
      ) : null}
    </Stack>
  )
}

/** Generic card wrapper; use `layout="section"` for titled dashboard blocks. */
export function Card({
  children,
  isActive = false,
  activeBorderColor = 'primary',
  interactive = false,
  layout = 'default',
  eyebrow,
  heading,
  header,
  bodyGap = 4,
  p,
  maxW,
  borderRadius,
  ...rest
}: CardProps) {
  const isSection = layout === 'section'
  const surface = interactive ? dsCardInteractive : dsCardSurface

  return (
    <Box
      borderRadius={borderRadius ?? 'md'}
      p={p ?? (isSection ? { base: 5, md: 6 } : 6)}
      maxW={maxW ?? (isSection ? 'full' : 'md')}
      w="full"
      {...surface}
      borderColor={isActive ? activeBorderColor : 'cardBorder'}
      {...rest}
    >
      {isSection ? (
        <Stack gap={bodyGap}>
          <CardTitleBlock eyebrow={eyebrow} heading={heading} header={header} />
          {children}
        </Stack>
      ) : (
        children
      )}
    </Box>
  )
}
