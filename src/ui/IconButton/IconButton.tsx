'use client'

import {
  Box,
  IconButton as ChakraIconButton,
  type IconButtonProps as ChakraIconButtonProps,
  Stack,
  type SystemStyleObject,
  Text,
} from '@chakra-ui/react'
import * as React from 'react'

import {
  focusVisibleMatchesHover,
  sdlFocusRing,
  sdlMotion,
} from '@/theme/styles'

import { Link } from '../Link'

/**
 * SDL IconButton.
 *
 * Two shapes, one public API (unchanged):
 * - **Nav** (`href` + `icon`, optional `caption`): dock-style route link with an
 *   active surface. Surfaces use `status.success.*` (the SDL green-tint family).
 * - **Default**: Chakra `IconButton` for ghost actions / `asChild` / drawer close.
 *   Every default IconButton keeps its `aria-label` and meets the 44px touch target.
 *
 * SDL guarantees:
 * - Visible focus ring on both shapes via `sdlFocusRing` (nav also keeps its
 *   hover surface tint on keyboard focus).
 * - >=44px hit area (nav tiles are 56/60px; default enforces a 44px minimum).
 * - Transitions via `sdlMotion` (color/background only — no layout animation).
 */

/** Dock / nav: icon (and optional caption) inside a route link. */
export type NavIconButtonProps = {
  href: string
  icon: React.ReactNode
  caption?: string
  active?: boolean
}

export type IconButtonProps = NavIconButtonProps | ChakraIconButtonProps

/** Ghost action hover surface (default shape). */
const ghostSurfaceHover = {
  bg: 'status.success.soft',
  color: 'text.default',
} satisfies SystemStyleObject

function navIconSurfaceInteraction(active: boolean) {
  const surface = {
    bg: 'status.success.soft',
    color: active ? 'status.success.fg' : 'text.default',
  } satisfies SystemStyleObject
  return {
    _hover: surface,
    ...focusVisibleMatchesHover(surface),
  }
}

function isNavIconButtonProps(
  props: IconButtonProps,
): props is NavIconButtonProps {
  return (
    typeof props === 'object' &&
    props !== null &&
    'href' in props &&
    typeof (props as NavIconButtonProps).href === 'string' &&
    'icon' in props
  )
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(props, ref) {
    if (isNavIconButtonProps(props)) {
      const { href, icon, caption, active = false } = props
      const surfaceInteraction = navIconSurfaceInteraction(active)

      return (
        <Link
          href={href}
          display="flex"
          w={{ base: 'full', md: 'auto' }}
          justifyContent={{ base: 'center', md: 'flex-start' }}
          alignItems="center"
          textDecoration="none"
          borderRadius="lg"
          _focus={{ outline: 'none' }}
          _focusVisible={{
            outline: 'none',
            '& [data-nav-icon]': {
              ...surfaceInteraction._focusVisible,
              ...sdlFocusRing,
            },
          }}
        >
          <Box
            data-nav-icon
            w={{ base: '56px', md: '60px' }}
            h={{ base: '56px', md: '60px' }}
            borderRadius="lg"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg={active ? 'status.success.soft' : 'transparent'}
            color={active ? 'status.success.fg' : 'text.muted'}
            py={1.5}
            px={1}
            flexShrink={0}
            transitionProperty="color, background-color"
            transitionDuration={sdlMotion.duration.moderate}
            transitionTimingFunction={sdlMotion.easing.standard}
            {...surfaceInteraction}
          >
            <Stack
              align="center"
              justify="center"
              w="full"
              h="full"
              gap={caption ? 1 : 0}
              position="relative"
              textAlign="center"
            >
              <Box
                position="relative"
                display="flex"
                alignItems="center"
                justifyContent="center"
                w="full"
                minH="20px"
              >
                {icon}
              </Box>
              {caption ? (
                <Text
                  w="full"
                  fontSize="xs"
                  fontWeight={700}
                  color={active ? 'status.success.fg' : 'text.muted'}
                  textAlign="center"
                  lineHeight="short"
                  whiteSpace="nowrap"
                >
                  {caption}
                </Text>
              ) : null}
            </Stack>
          </Box>
        </Link>
      )
    }

    const { borderRadius = 'full', variant = 'ghost', _hover, ...rest } = props
    const hoverStyles = _hover ?? (variant === 'ghost' ? ghostSurfaceHover : {})

    return (
      <ChakraIconButton
        ref={ref}
        borderRadius={borderRadius}
        variant={variant}
        minW="44px"
        minH="44px"
        color="text.default"
        transitionProperty="color, background-color, border-color, box-shadow"
        transitionDuration={sdlMotion.duration.moderate}
        transitionTimingFunction={sdlMotion.easing.standard}
        _hover={hoverStyles}
        _focusVisible={sdlFocusRing}
        _disabled={{ color: 'text.subtle', cursor: 'not-allowed' }}
        {...rest}
      />
    )
  },
)
