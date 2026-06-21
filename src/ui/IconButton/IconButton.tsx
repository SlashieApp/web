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

import { focusVisibleMatchesHover } from '@/theme/system'

import { Link } from '../Link'

/** Dock / nav: icon (and optional caption) inside a route link. */
export type NavIconButtonProps = {
  href: string
  icon: React.ReactNode
  caption?: string
  active?: boolean
}

export type IconButtonProps = NavIconButtonProps | ChakraIconButtonProps

const ghostSurfaceHover = {
  bg: 'badgeBg',
  color: 'cardFg',
} satisfies SystemStyleObject

function navIconSurfaceInteraction(active: boolean) {
  const surface = {
    bg: active ? 'intentPrimaryBg' : 'badgeBg',
    color: active ? 'intentPrimaryFg' : 'cardFg',
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

/**
 * - **Nav** (`href` + `icon`, optional `caption`): dock-style link control.
 * - **Default**: Chakra `IconButton` (ghost actions, `asChild`, drawers, etc.).
 */
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
            '& [data-nav-icon]': surfaceInteraction._focusVisible,
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
            bg={active ? 'intentPrimaryBg' : 'transparent'}
            color={active ? 'intentPrimaryFg' : 'formLabelMuted'}
            py={1.5}
            px={1}
            flexShrink={0}
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
                  color={active ? 'intentPrimaryFg' : 'formLabelMuted'}
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
        _hover={hoverStyles}
        {...focusVisibleMatchesHover(hoverStyles)}
        {...rest}
      />
    )
  },
)
