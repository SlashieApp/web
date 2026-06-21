'use client'

import { Box, Container, HStack, Stack, Text } from '@chakra-ui/react'

import { Link, Logo } from '@ui'

const navLinks = [
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Log in', href: '/login' },
  { label: 'Register', href: '/register' },
] as const

const legalLinks = [
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
] as const

export function Footer() {
  return (
    <Box
      as="footer"
      borderTopWidth="1px"
      borderColor="cardBorder"
      bg="bg"
      py={10}
    >
      <Container maxW="6xl" px={{ base: 4, md: 6 }}>
        <Stack gap={8}>
          <HStack
            justify="space-between"
            align="flex-start"
            flexWrap="wrap"
            gap={6}
          >
            <Stack gap={2}>
              <Logo />
              <Text fontSize="sm" color="formLabelMuted">
                Map-first local task marketplace.
              </Text>
            </Stack>
            <HStack gap={5} flexWrap="wrap">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  tone="muted"
                  fontWeight={600}
                  fontSize="sm"
                  color="cardFg"
                >
                  {link.label}
                </Link>
              ))}
            </HStack>
          </HStack>
          <HStack
            justify="space-between"
            flexWrap="wrap"
            gap={4}
            fontSize="sm"
            color="formLabelMuted"
          >
            <Text>© Slashie 2026</Text>
            <HStack gap={4}>
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  tone="muted"
                  fontSize="sm"
                  color="inherit"
                >
                  {link.label}
                </Link>
              ))}
            </HStack>
          </HStack>
        </Stack>
      </Container>
    </Box>
  )
}
