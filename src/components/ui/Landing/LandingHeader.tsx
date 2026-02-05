'use client'

import { Box, HStack, Heading, Link, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'

import { UiButton } from '../Button/Button'

const navLinks = [
  { label: 'Tasks', href: '/tasks' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Register', href: '/register' },
]

export function LandingHeader() {
  return (
    <Stack
      direction={{ base: 'column', md: 'row' }}
      justify="space-between"
      align={{ base: 'flex-start', md: 'center' }}
      gap={{ base: 4, md: 8 }}
    >
      <HStack gap={3}>
        <Box w="36px" h="36px" borderRadius="12px" bg="mustard.400" />
        <Heading size="md">
          <Link as={NextLink} href="/" _hover={{ textDecoration: 'none' }}>
            HandyBox
          </Link>
        </Heading>
      </HStack>

      <HStack gap={3} flexWrap="wrap">
        {navLinks.map((link) => (
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
        <UiButton as={NextLink} href="/login" variant="ghost">
          Log in
        </UiButton>
        <UiButton
          as={NextLink}
          href="/#post-task"
          background="linkBlue.600"
          color="white"
        >
          Post a job
        </UiButton>
      </HStack>
    </Stack>
  )
}
