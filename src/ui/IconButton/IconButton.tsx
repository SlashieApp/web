'use client'

import { Box, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

export type IconButtonProps = {
  href: string
  icon: React.ReactNode
  caption?: string
  active?: boolean
}

export function IconButton({
  href,
  icon,
  caption,
  active = false,
}: IconButtonProps) {
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
        w={{ base: 'auto', md: '60px' }}
        h={{ base: 'auto', md: '60px' }}
        borderRadius="xl"
        bg={{
          base: active ? 'primary.50' : 'transparent',
          md: active ? 'intentPrimaryBg' : 'transparent',
        }}
        color={{
          base: active ? 'primary.600' : 'secondary.700',
          md: active ? 'intentPrimaryFg' : 'formLabelMuted',
        }}
        py={1.5}
        px={1}
        _hover={{
          bg: {
            base: active ? 'primary.100' : 'secondary.100',
            md: active ? 'intentPrimaryBg' : 'badgeBg',
          },
          color: {
            base: active ? 'primary.600' : 'secondary.800',
            md: active ? 'intentPrimaryFg' : 'cardFg',
          },
        }}
      >
        <Stack
          align="center"
          justify="center"
          gap={caption ? 1 : 0}
          position="relative"
        >
          <Box position="relative" display="inline-flex" minH="20px">
            {icon}
          </Box>
          {caption ? (
            <Text
              fontSize="xs"
              fontWeight={700}
              color={{
                base: active ? 'primary.600' : 'secondary.700',
                md: active ? 'intentPrimaryFg' : 'formLabelMuted',
              }}
              textAlign="center"
              lineHeight="short"
            >
              {caption}
            </Text>
          ) : null}
        </Stack>
      </Box>
    </Link>
  )
}
