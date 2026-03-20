'use client'

import { Box, HStack, Link as ChakraLink, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'

import { Button, Header, Heading } from '@ui'

const navItems = [
  { label: 'My Jobs', href: '/dashboard' },
  { label: 'Post a Job', href: '/tasks/create', active: true },
  { label: 'Profile', href: '/dashboard' },
] as const

export function HomePageHeader() {
  return (
    <Header>
      <Stack
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'flex-start', md: 'center' }}
        gap={{ base: 4, md: 6 }}
        py={2}
      >
        <Heading size="md">HandyBox</Heading>

        <HStack gap={5} display={{ base: 'none', md: 'flex' }}>
          {navItems.map((item) => (
            <ChakraLink
              key={item.href}
              as={NextLink}
              href={item.href}
              fontSize="sm"
              fontWeight={item.active ? 800 : 600}
              color={item.active ? 'primary.700' : 'muted'}
              borderBottomWidth={item.active ? '2px' : '0'}
              borderColor="primary.700"
              pb={1}
              _hover={{ textDecoration: 'none', color: 'primary.700' }}
            >
              {item.label}
            </ChakraLink>
          ))}
        </HStack>

        <HStack gap={2}>
          <Box
            px={2.5}
            py={1.5}
            borderRadius="md"
            bg="surfaceContainerLow"
            fontSize="sm"
          >
            🔔
          </Box>
          <Box
            px={2.5}
            py={1.5}
            borderRadius="md"
            bg="surfaceContainerLow"
            fontSize="sm"
          >
            💬
          </Box>
          <Button as={NextLink} href="/tasks/create" size="sm">
            Post a Job
          </Button>
        </HStack>
      </Stack>
    </Header>
  )
}
