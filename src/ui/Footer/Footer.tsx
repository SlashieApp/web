'use client'

import { Box, Container, HStack, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

const links = [
  { label: 'Support', href: '/' },
  { label: 'Privacy Policy', href: '/register' },
  { label: 'Terms of Service', href: '/login' },
  { label: 'Help Center', href: '/forgot-password' },
  { label: 'Safety', href: '/dashboard' },
] as const

export function Footer() {
  return (
    <Box as="footer" borderTopWidth="1px" borderColor="secondary.200" bg="bg">
      <Container>
        <Stack
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'flex-start', md: 'center' }}
          justify="space-between"
          gap={3}
        >
          <Stack gap={1}>
            <Text fontWeight={700}>Slashie</Text>
            <Text fontSize="sm" color="secondary.700">
              Connecting skilled tradespeople with homeowners who value quality
              workmanship.
            </Text>
            <Text fontSize="sm" color="secondary.700">
              © 2024 Slashie. Built for trusted local work.
            </Text>
          </Stack>

          <HStack gap={4} flexWrap="wrap">
            {links.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                as={NextLink}
                href={link.href}
                fontWeight={600}
                fontSize="sm"
                _hover={{ textDecoration: 'none', color: 'primary.600' }}
              >
                {link.label}
              </Link>
            ))}
          </HStack>
        </Stack>
      </Container>
    </Box>
  )
}
