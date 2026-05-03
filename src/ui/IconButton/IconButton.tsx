'use client'

import {
  Box,
  IconButton as ChakraIconButton,
  type IconButtonProps as ChakraIconButtonProps,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import * as React from 'react'

/** Dock / nav: icon (and optional caption) inside a route link. */
export type NavIconButtonProps = {
  href: string
  icon: React.ReactNode
  caption?: string
  active?: boolean
}

export type IconButtonProps = NavIconButtonProps | ChakraIconButtonProps

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
      return (
        <Link
          as={NextLink}
          href={href}
          style={{
            textDecoration: 'none',
            flex: '0 0 auto',
          }}
        >
          <Box
            w={{ base: '56px', md: '60px' }}
            h={{ base: '56px', md: '60px' }}
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="xl"
            bg={active ? 'intentPrimaryBg' : 'transparent'}
            color={active ? 'intentPrimaryFg' : 'formLabelMuted'}
            py={1.5}
            px={1}
            _hover={{
              bg: active ? 'intentPrimaryBg' : 'badgeBg',
              color: active ? 'intentPrimaryFg' : 'cardFg',
            }}
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
              <Box position="relative" display="inline-flex" minH="20px">
                {icon}
              </Box>
              {caption ? (
                <Text
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

    return <ChakraIconButton ref={ref} {...props} />
  },
)
