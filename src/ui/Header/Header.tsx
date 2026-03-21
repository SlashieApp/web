'use client'

import { Box, type BoxProps, HStack, Link, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'

import { getAuthToken } from '@/utils/auth'
import { Button } from '../Button'
import { Container } from '../Container'
import { Heading } from '../Typography'

export type HeaderActiveItem =
  | 'home'
  | 'tasks'
  | 'my-jobs'
  | 'post-job'
  | 'profile'
  | 'none'

type NavItem = {
  label: string
  href: string
  key: Exclude<HeaderActiveItem, 'none'>
}

const navItems: readonly NavItem[] = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'tasks', label: 'Tasks', href: '/tasks' },
  { key: 'my-jobs', label: 'My Jobs', href: '/dashboard/jobs' },
  { key: 'post-job', label: 'Post a Job', href: '/tasks/create' },
  { key: 'profile', label: 'Profile', href: '/dashboard/profile' },
]

export type HeaderProps = {
  /** When omitted and `children` is omitted, renders the default site navigation. */
  activeItem?: HeaderActiveItem
  children?: React.ReactNode
} & Omit<BoxProps, 'children'>

function SiteNavigation({ activeItem }: { activeItem: HeaderActiveItem }) {
  const isLoggedIn = Boolean(getAuthToken())
  const visibleNavItems = isLoggedIn
    ? navItems
    : navItems.filter((item) => item.key !== 'profile')

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
        {visibleNavItems.map((item) => {
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

export function Header({
  activeItem = 'none',
  children,
  ...props
}: HeaderProps) {
  return (
    <Box
      as="header"
      bg="surfaceBright"
      borderRadius="xl"
      backdropFilter="blur(20px)"
      boxShadow="ambient"
      px={{ base: 2, md: 0 }}
      py={1}
      {...props}
    >
      <Container>
        {children ?? <SiteNavigation activeItem={activeItem} />}
      </Container>
    </Box>
  )
}
