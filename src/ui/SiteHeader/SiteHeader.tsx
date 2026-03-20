'use client'

import { Box, HStack, Link, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'

import { Button } from '../Button'
import { Heading } from '../Typography'

export type SiteHeaderActiveItem = 'my-jobs' | 'post-job' | 'profile' | 'none'

type SiteNavItem = {
  label: string
  href: string
  key: Exclude<SiteHeaderActiveItem, 'none'>
}

const navItems: readonly SiteNavItem[] = [
  { key: 'my-jobs', label: 'My Jobs', href: '/dashboard' },
  { key: 'post-job', label: 'Post a Job', href: '/tasks/create' },
  { key: 'profile', label: 'Profile', href: '/dashboard' },
]

export type SiteHeaderProps = {
  activeItem?: SiteHeaderActiveItem
}

export function SiteHeader({ activeItem = 'none' }: SiteHeaderProps) {
  return (
    <Stack
      direction={{ base: 'column', md: 'row' }}
      justify="space-between"
      align={{ base: 'flex-start', md: 'center' }}
      gap={{ base: 4, md: 6 }}
      py={2}
    >
      <Heading size="md">
        <Link as={NextLink} href="/" _hover={{ textDecoration: 'none' }}>
          HandyBox
        </Link>
      </Heading>

      <HStack gap={5} display={{ base: 'none', md: 'flex' }}>
        {navItems.map((item) => {
          const isActive = item.key === activeItem
          return (
            <Link
              key={`${item.href}-${item.label}`}
              as={NextLink}
              href={item.href}
              fontSize="sm"
              fontWeight={isActive ? 800 : 600}
              color={isActive ? 'primary.700' : 'muted'}
              borderBottomWidth={isActive ? '2px' : '0'}
              borderColor="primary.700"
              pb={1}
              _hover={{ textDecoration: 'none', color: 'primary.700' }}
            >
              {item.label}
            </Link>
          )
        })}
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
  )
}
