'use client'

import { HStack, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

const footerLinks = [
  { label: 'Home', href: '/' },
  { label: 'Tasks', href: '/tasks' },
  { label: 'Register', href: '/register' },
  { label: 'Log in', href: '/login' },
  { label: 'Dashboard', href: '/dashboard' },
]

export function LandingFooter() {
  return (
    <Stack
      gap={4}
      pt={6}
      borderTopWidth="1px"
      borderColor="border"
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
            _hover={{ textDecoration: 'none', color: 'linkBlue.700' }}
          >
            {link.label}
          </Link>
        ))}
      </HStack>
    </Stack>
  )
}
