'use client'

import { Box, HStack, Link, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'

import { Container } from '../Container'
import { Text } from '../Typography'

const links = [
  { label: 'Support', href: '/tasks' },
  { label: 'Privacy Policy', href: '/register' },
  { label: 'Terms of Service', href: '/login' },
  { label: 'Help Center', href: '/forgot-password' },
  { label: 'Safety', href: '/dashboard' },
] as const

export function SiteFooter() {
  return (
    <Box
      as="footer"
      borderTopWidth="1px"
      borderColor="border"
      bg="surfaceContainerLowest"
    >
      <Container py={{ base: 8, md: 10 }}>
        <Stack
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'flex-start', md: 'center' }}
          justify="space-between"
          gap={5}
        >
          <Stack gap={1}>
            <Text fontWeight={700}>HandyBox</Text>
            <Text fontSize="sm" color="muted">
              Connecting master craftsmen with homeowners who value quality
              workmanship.
            </Text>
            <Text fontSize="sm" color="muted">
              © 2024 HandyBox. Built for Master Craftsmen.
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
