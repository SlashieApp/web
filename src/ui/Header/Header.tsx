'use client'

import {
  Box,
  type BoxProps,
  HStack,
  IconButton,
  Link,
  Stack,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { useState, useSyncExternalStore } from 'react'

import {
  AUTH_COOKIE_CHANGE_EVENT,
  clearAuthToken,
  getAuthToken,
} from '@/utils/auth'
import { Button } from '../Button'
import { Container } from '../Container'
import { NavDrawer, type NavDrawerLink } from '../NavDrawer/NavDrawer'
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

function subscribeAuthCookie(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {}
  const handler = () => onStoreChange()
  window.addEventListener(AUTH_COOKIE_CHANGE_EVENT, handler)
  return () => window.removeEventListener(AUTH_COOKIE_CHANGE_EVENT, handler)
}

function getAuthCookieSnapshot() {
  return getAuthToken() ? '1' : '0'
}

export type HeaderProps = {
  /** When omitted and `children` is omitted, renders the default site navigation. */
  activeItem?: HeaderActiveItem
  children?: React.ReactNode
} & Omit<BoxProps, 'children'>

function SiteNavigation({ activeItem }: { activeItem: HeaderActiveItem }) {
  const isLoggedIn =
    useSyncExternalStore(
      subscribeAuthCookie,
      getAuthCookieSnapshot,
      () => '0',
    ) === '1'

  const [menuOpen, setMenuOpen] = useState(false)

  const visibleNavItems: readonly NavItem[] = isLoggedIn
    ? navItems
    : navItems.filter((item) => item.key !== 'profile')

  const drawerLinks: readonly NavDrawerLink[] = visibleNavItems.map(
    ({ label, href }) => ({ label, href }),
  )

  const handleLogout = () => {
    clearAuthToken()
    if (typeof window !== 'undefined') {
      window.location.assign('/login')
    }
  }

  const desktopAuth = isLoggedIn ? (
    <>
      <Button as={NextLink} href="/dashboard" size="sm" variant="outline">
        Dashboard
      </Button>
      <Button
        as={NextLink}
        href="/dashboard/profile"
        size="sm"
        variant="subtle"
      >
        Account
      </Button>
      <Button as={NextLink} href="/tasks/create" size="sm">
        Post a Job
      </Button>
      <Button size="sm" variant="subtle" onClick={handleLogout}>
        Log out
      </Button>
    </>
  ) : (
    <>
      <Button as={NextLink} href="/login" size="sm" variant="outline">
        Log in
      </Button>
      <Button as={NextLink} href="/register" size="sm" variant="subtle">
        Register
      </Button>
      <Button as={NextLink} href="/tasks/create" size="sm">
        Post a Job
      </Button>
    </>
  )

  const drawerFooter = isLoggedIn ? (
    <Stack gap={2} w="full">
      <Button
        as={NextLink}
        href="/dashboard"
        size="sm"
        variant="outline"
        onClick={() => setMenuOpen(false)}
      >
        Dashboard
      </Button>
      <Button
        as={NextLink}
        href="/dashboard/profile"
        size="sm"
        variant="subtle"
        onClick={() => setMenuOpen(false)}
      >
        Account
      </Button>
      <Button
        as={NextLink}
        href="/tasks/create"
        size="sm"
        onClick={() => setMenuOpen(false)}
      >
        Post a Job
      </Button>
      <Button
        size="sm"
        variant="subtle"
        onClick={() => {
          setMenuOpen(false)
          handleLogout()
        }}
      >
        Log out
      </Button>
    </Stack>
  ) : (
    <Stack gap={2} w="full">
      <Button
        as={NextLink}
        href="/login"
        size="sm"
        variant="outline"
        onClick={() => setMenuOpen(false)}
      >
        Log in
      </Button>
      <Button
        as={NextLink}
        href="/register"
        size="sm"
        variant="subtle"
        onClick={() => setMenuOpen(false)}
      >
        Register
      </Button>
      <Button
        as={NextLink}
        href="/tasks/create"
        size="sm"
        onClick={() => setMenuOpen(false)}
      >
        Post a Job
      </Button>
    </Stack>
  )

  return (
    <>
      <NavDrawer
        open={menuOpen}
        onOpenChange={setMenuOpen}
        title="Menu"
        links={drawerLinks}
        footer={drawerFooter}
      />

      <Stack
        direction="row"
        justify="space-between"
        align="center"
        gap={3}
        py={2}
        flexWrap="wrap"
      >
        <Heading size="md" mb={0}>
          <Link as={NextLink} href="/" _hover={{ textDecoration: 'none' }}>
            HandyBox
          </Link>
        </Heading>

        <HStack
          gap={5}
          display={{ base: 'none', md: 'flex' }}
          flex="1"
          justify="center"
        >
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

        <HStack gap={2} display={{ base: 'none', md: 'flex' }} flexShrink={0}>
          <Box
            px={2.5}
            py={1.5}
            borderRadius="md"
            bg="surfaceContainerLow"
            fontSize="sm"
            aria-hidden
          >
            🔔
          </Box>
          <Box
            px={2.5}
            py={1.5}
            borderRadius="md"
            bg="surfaceContainerLow"
            fontSize="sm"
            aria-hidden
          >
            💬
          </Box>
          {desktopAuth}
        </HStack>

        <HStack gap={2} display={{ base: 'flex', md: 'none' }} flexShrink={0}>
          <IconButton
            type="button"
            variant="ghost"
            size="md"
            aria-label="Open menu"
            minW="44px"
            minH="44px"
            onClick={() => setMenuOpen(true)}
          >
            ☰
          </IconButton>
        </HStack>
      </Stack>
    </>
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
