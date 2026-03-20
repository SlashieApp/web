'use client'

import { HStack, Link, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'
import { Text } from '@ui'

const footerLinks = [
  { label: 'Home', href: '/' },
  { label: 'Tasks', href: '/tasks' },
  { label: 'Register', href: '/register' },
  { label: 'Log in', href: '/login' },
  { label: 'Forgot password', href: '/forgot-password' },
  { label: 'Dashboard', href: '/dashboard' },
]

export function LandingFooter() {
  return (
    <Stack
      gap={4}
      pt={6}
      px={4}
      pb={4}
      borderRadius="lg"
      bg="surfaceContainerLow"
      fontSize="sm"
    >
      <Text color="muted">
        We are building the MVP right now. Check back soon for new releases and
        more local trades.
      </Text>
      <HStack gap={4} flexWrap="wrap">
        {footerLinks.map((link) => (
          <Link
            key={link.href}
            as={NextLink}
            href={link.href}
            fontWeight={600}
            _hover={{ textDecoration: 'none', color: 'primary.600' }}
          >
            {link.label}
          </Link>
        ))}
      </HStack>
    </Stack>
  )
}
