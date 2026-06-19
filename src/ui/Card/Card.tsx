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

export type CardProps = BoxProps & {
  children?: ReactNode
  /** Highlights the card border for selected/active states. */
  isActive?: boolean
  activeBorderColor?: BoxProps['borderColor']
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
  )
}

/** Generic card wrapper; use `layout="section"` for titled dashboard blocks. */
export function Card({
  children,
  isActive = false,
  activeBorderColor = 'secondary',
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

  return (
    <Box
      borderRadius={borderRadius ?? (isSection ? 'xl' : '24px')}
      bg="cardBg"
      borderWidth="1px"
      borderColor={isActive ? activeBorderColor : 'cardBorder'}
      p={p ?? (isSection ? { base: 5, md: 6 } : 6)}
      maxW={maxW ?? (isSection ? 'full' : 'md')}
      w="full"
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
