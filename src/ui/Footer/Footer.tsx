'use client'

import { Box, Container, HStack, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

const links = [
  { label: 'Support', href: '/' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Help Center', href: 'https://slashie.app' },
  { label: 'Safety', href: 'https://slashie.app' },
] as const

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href)
}

export function Footer() {
  return (
    <Box
      as="footer"
      borderTopWidth="1px"
      borderColor="cardBorder"
      bg="bg"
      py={{ base: 8, md: 10 }}
    >
      <Container maxW="7xl" mx="auto" px={{ base: 4, md: 6 }}>
        <Stack
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'flex-start', md: 'center' }}
          justify="space-between"
          gap={6}
        >
          <Stack gap={2} maxW={{ md: 'md' }}>
            <Text fontWeight={700} color="cardFg">
              Slashie
            </Text>
            <Text fontSize="sm" color="formLabelMuted" lineHeight="short">
              A local marketplace for people who need tasks done and workers who
              quote, deliver, and build trust on the map.
            </Text>
            <Text fontSize="sm" color="formLabelMuted">
              © 2026 Slashie. Built for trusted local work.
            </Text>
          </Stack>

          <HStack gap={{ base: 3, md: 4 }} flexWrap="wrap">
            {links.map((link) =>
              isExternalHref(link.href) ? (
                <Link
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  fontWeight={600}
                  fontSize="sm"
                  color="cardFg"
                  _hover={{ textDecoration: 'none', color: 'primary.600' }}
                  _focusVisible={{
                    outline: '2px solid',
                    outlineColor: 'primary.500',
                    outlineOffset: '2px',
                  }}
                >
                  {link.label}
                </Link>
              ) : (
                <Link
                  key={link.label}
                  as={NextLink}
                  href={link.href}
                  fontWeight={600}
                  fontSize="sm"
                  color="cardFg"
                  _hover={{ textDecoration: 'none', color: 'primary.600' }}
                  _focusVisible={{
                    outline: '2px solid',
                    outlineColor: 'primary.500',
                    outlineOffset: '2px',
                  }}
                >
                  {link.label}
                </Link>
              ),
            )}
          </HStack>
        </Stack>
      </Container>
    </Box>
  )
}
