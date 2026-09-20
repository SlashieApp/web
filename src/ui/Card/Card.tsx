'use client'

import {
  Box,
  type BoxProps,
  HStack,
  Heading,
  Stack,
  type StackProps,
  type SystemStyleObject,
  Text,
} from '@chakra-ui/react'
import type { ReactNode } from 'react'

import {
  sdlCard,
  sdlCardSurface,
  sdlFocusRing,
  sdlMotion,
} from '@/theme/styles'

/**
 * SDL Card. Shared surface recipe (`sdlCard` / `sdlCardSurface`):
 * `bg.surface`, `border.default` hairline, `lg` radius, `e1` rest elevation.
 *
 * Interactive cards (clickable rows) are keyboard-focusable and show the SDL
 * focus ring; surface hover uses `bg.subtle`. Active/selected cards highlight
 * the border with `action.primary`.
 */
const cardSurface: SystemStyleObject = sdlCardSurface

const cardInteractive: SystemStyleObject = {
  ...cardSurface,
  cursor: 'pointer',
  transitionProperty: 'background-color, border-color, box-shadow',
  transitionDuration: sdlMotion.duration.base,
  transitionTimingFunction: sdlMotion.easing.standard,
  _hover: { bg: 'bg.subtle', boxShadow: sdlCard.raisedShadow },
  _focusVisible: sdlFocusRing,
}

export type CardProps = BoxProps & {
  children?: ReactNode
  /** Highlights the card border for selected/active states. */
  isActive?: boolean
  activeBorderColor?: BoxProps['borderColor']
  /** Clickable card — adds hover surface + keyboard focus per SDL cards. */
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
  /** Muted line under the heading (`layout="section"`). */
  description?: ReactNode
  /** Trailing control beside the heading (count pill, status, edit). */
  headingAccessory?: ReactNode
  /** Primary figure under the title (budget, analytics value). */
  metric?: ReactNode
  /** Leading title icon — rendered in a soft brand tile beside the heading. */
  icon?: ReactNode
  bodyGap?: StackProps['gap']
  /**
   * `compact` tightens padding for floating pins / dense rows.
   * Default keeps the section recipe used on task-detail and dashboard.
   */
  density?: 'default' | 'compact'
}

function CardTitleBlock({
  eyebrow,
  heading,
  header,
  icon,
  description,
  headingAccessory,
}: Pick<
  CardProps,
  'eyebrow' | 'heading' | 'header' | 'icon' | 'description' | 'headingAccessory'
>) {
  const title =
    header ??
    (eyebrow || heading || description ? (
      <Stack gap={1}>
        {eyebrow ? (
          <Text
            fontSize="xs"
            fontWeight={500}
            color="text.muted"
            letterSpacing="0.06em"
            textTransform="uppercase"
          >
            {eyebrow}
          </Text>
        ) : null}
        {heading || headingAccessory ? (
          <HStack gap={2} align="center" flexWrap="wrap">
            {heading ? (
              <Heading
                as="h3"
                fontSize={{ base: '16px', md: '20px' }}
                fontWeight={500}
                color="text.default"
                lineHeight="short"
              >
                {heading}
              </Heading>
            ) : null}
            {headingAccessory}
          </HStack>
        ) : null}
        {description ? (
          typeof description === 'string' ? (
            <Text fontSize="sm" color="text.muted" lineHeight="short">
              {description}
            </Text>
          ) : (
            description
          )
        ) : null}
      </Stack>
    ) : null)

  if (!title) return null
  if (!icon) return title

  return (
    <HStack gap={3} align="center" w="full">
      <Box
        aria-hidden
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
        boxSize="40px"
        borderRadius="lg"
        bg="status.success.soft"
        color="status.success.fg"
        fontSize="20px"
        lineHeight="1"
      >
        {icon}
      </Box>
      <Box flex="1" minW={0}>
        {title}
      </Box>
    </HStack>
  )
}

/** Generic card wrapper; use `layout="section"` for titled dashboard blocks. */
export function Card({
  children,
  isActive = false,
  activeBorderColor = 'action.primary',
  interactive = false,
  layout = 'default',
  eyebrow,
  heading,
  header,
  icon,
  description,
  headingAccessory,
  metric,
  bodyGap,
  density = 'default',
  p,
  maxW,
  borderRadius,
  ...rest
}: CardProps) {
  const isSection = layout === 'section'
  const compact = density === 'compact'
  const surface = interactive ? cardInteractive : cardSurface
  // Clickable cards must be reachable + operable by keyboard (WCAG 2.2 AA).
  const interactiveA11y = interactive
    ? { tabIndex: 0, role: 'button' as const }
    : {}

  return (
    <Box
      borderRadius={borderRadius ?? sdlCard.radius}
      p={p ?? (compact ? 3 : isSection ? { base: 5, md: 6 } : 6)}
      maxW={maxW ?? (isSection ? 'full' : 'md')}
      w="full"
      {...interactiveA11y}
      {...surface}
      borderColor={isActive ? activeBorderColor : 'border.default'}
      {...rest}
    >
      {isSection ? (
        <Stack gap={bodyGap ?? (compact ? 2 : 4)}>
          <CardTitleBlock
            eyebrow={eyebrow}
            heading={heading}
            header={header}
            icon={icon}
            description={description}
            headingAccessory={headingAccessory}
          />
          {metric ? (
            <Text
              fontSize="lg"
              fontWeight={600}
              color="text.default"
              lineHeight="short"
            >
              {metric}
            </Text>
          ) : null}
          {children}
        </Stack>
      ) : (
        children
      )}
    </Box>
  )
}
