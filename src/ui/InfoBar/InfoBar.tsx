'use client'

import {
  Box,
  type BoxProps,
  HStack,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react'
import type { ReactNode } from 'react'
import {
  LuCircleAlert,
  LuCircleCheck,
  LuInfo,
  LuTriangleAlert,
} from 'react-icons/lu'

import { sdlMotion } from '@/theme/styles'
import { Badge } from '../Badge/Badge'
import { Card } from '../Card/Card'
import { Link } from '../Link/Link'

/**
 * SDL Foundations organism: InfoBar — a calm trust / advisory panel.
 *
 * Canonical use is the payment-trust notice ("You pay the worker directly —
 * Slashie never handles job payment"). Composes @ui atoms only (Card surface,
 * Badge for the dot + label, Link for the optional CTA) and references SDL
 * semantic roles exclusively.
 *
 * Tone maps 1:1 to the SDL status families. Status is never signalled by colour
 * alone: a Lucide icon in a neutral pod plus the Badge (dot + label) carry the
 * meaning. The pod is one calm, consistent treatment across every tone — a
 * `bg.surface` chip lifted with `e1`, holding a `status.<tone>.fg` icon — so no
 * solid status fills are used and the green-ink rule does not come into play.
 */
export type UiInfoBarTone = 'info' | 'success' | 'warning' | 'danger'

/** Default short label rendered inside the status Badge per tone. */
const toneBadgeLabel: Record<UiInfoBarTone, string> = {
  info: 'Good to know',
  success: 'All clear',
  warning: 'Heads up',
  danger: 'Action needed',
}

/** Default Lucide icon per tone. Override with the `icon` prop. */
const defaultToneIcon: Record<UiInfoBarTone, ReactNode> = {
  info: <LuInfo size={20} />,
  success: <LuCircleCheck size={20} />,
  warning: <LuTriangleAlert size={20} />,
  danger: <LuCircleAlert size={20} />,
}

export type UiInfoBarProps = Omit<BoxProps, 'title'> & {
  /** SDL status family for the panel. Default `info`. */
  tone?: UiInfoBarTone
  /** Leading icon shown in the pod. Defaults to a Lucide icon per tone. */
  icon?: ReactNode
  /** Short status label rendered in the Badge (dot + label). */
  badgeLabel?: string
  /** Panel heading. */
  heading: string
  /** Supporting body copy. */
  children?: ReactNode
  /** Optional inline call-to-action link. */
  linkLabel?: string
  /** Destination for the optional link. */
  linkHref?: string
  /** Hide the status Badge (the pod still carries the tone). */
  hideBadge?: boolean
}

export function InfoBar({
  tone = 'info',
  icon,
  badgeLabel,
  heading,
  children,
  linkLabel,
  linkHref,
  hideBadge = false,
  ...rest
}: UiInfoBarProps) {
  return (
    <Card
      layout="default"
      maxW="full"
      p={{ base: 4, md: 5 }}
      bg={`status.${tone}.soft`}
      borderColor={`status.${tone}.soft`}
      transitionProperty="background-color, border-color, box-shadow"
      transitionDuration={sdlMotion.duration.base}
      transitionTimingFunction={sdlMotion.easing.standard}
      {...rest}
    >
      <HStack gap={{ base: 3, md: 4 }} alignItems="flex-start">
        <Box
          aria-hidden
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
          boxSize="40px"
          borderRadius="lg"
          bg="bg.surface"
          color={`status.${tone}.fg`}
          boxShadow="e1"
          fontSize="20px"
          lineHeight="1"
        >
          {icon ?? defaultToneIcon[tone]}
        </Box>

        <Stack gap={2} flex="1" minW={0}>
          <HStack gap={3} flexWrap="wrap" alignItems="center">
            <Heading
              as="h3"
              fontSize={{ base: 'md', md: 'lg' }}
              fontWeight={600}
              color="text.default"
              lineHeight="short"
            >
              {heading}
            </Heading>
            {hideBadge ? null : (
              <Badge variant={tone} dot shape="pill" size="sm">
                {badgeLabel ?? toneBadgeLabel[tone]}
              </Badge>
            )}
          </HStack>

          {children ? (
            <Text fontSize={{ base: 'sm', md: 'md' }} color="text.muted">
              {children}
            </Text>
          ) : null}

          {linkLabel && linkHref ? (
            <Box>
              <Link
                href={linkHref}
                tone="emphasis"
                fontSize="sm"
                fontWeight={600}
              >
                {linkLabel}
              </Link>
            </Box>
          ) : null}
        </Stack>
      </HStack>
    </Card>
  )
}
