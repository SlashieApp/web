'use client'

import {
  Box,
  type BoxProps,
  Container,
  HStack,
  IconButton,
  Link,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { useCallback, useState } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import { getAuthToken } from '@/utils/auth'
import { AppDrawer } from '../AppDrawer/AppDrawer'
import { Button } from '../Button'
import { Logo } from '../Logo/Logo'
import { ColorModeButton } from '../color-mode'

const navLinkProps = {
  fontSize: '14px',
  fontWeight: 600,
  color: 'formLabelMuted',
  h: '44px',
  px: 2,
  borderBottomWidth: '2px',
  borderBottomColor: 'transparent',
  borderRadius: 0,
  _hover: { textDecoration: 'none', color: 'cardFg' },
} as const

function IconBell() {
  return (
    <Box as="span" display="flex" color="currentColor" aria-hidden>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <title>Notifications</title>
        <path
          d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  )
}

function IconUser() {
  return (
    <Box as="span" display="flex" color="currentColor" aria-hidden>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <title>Profile</title>
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
        <path
          d="M4 20c0-4 4-6 8-6s8 2 8 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </Box>
  )
}

function IconMenu() {
  return (
    <Box as="span" display="flex" color="currentColor" aria-hidden>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <title>Menu</title>
        <path
          d="M4 7h16M4 12h16M4 17h16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </Box>
  )
}

export type HeaderActiveItem =
  | 'home'
  | 'tasks'
  | 'my-tasks'
  | 'post-task'
  | 'profile'
  | 'none'

export type HeaderProps = {
  /** When omitted and `children` is omitted, renders the default site navigation. */
  activeItem?: HeaderActiveItem
  children?: React.ReactNode
} & Omit<BoxProps, 'children'>

function SiteNavigation({ activeItem }: { activeItem: HeaderActiveItem }) {
  const user = useUserStore((state) => state.user)
  const getUser = useUserStore((state) => state.getUser)
  const logout = useUserStore((state) => state.logout)
  const [hasMounted, setHasMounted] = useState(false)
  const [currentPathname, setCurrentPathname] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isLoggedIn = Boolean(user)
  const onMountNavigation = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || hasMounted) return
      setHasMounted(true)
      setCurrentPathname(window.location.pathname)
      if (!getAuthToken()) return
      void getUser()
    },
    [getUser, hasMounted],
  )

  // Pathname from `usePathname()` can disagree between SSR and the first client
  // paint (e.g. null vs real path). Defer route-derived highlighting until after
  // mount so server and client render the same tree for hydration.
  const resolvedActive: HeaderActiveItem =
    activeItem !== 'none'
      ? activeItem
      : !hasMounted
        ? 'none'
        : currentPathname?.startsWith('/tasks/create')
          ? 'post-task'
          : currentPathname === '/' || currentPathname?.startsWith('/tasks')
            ? 'home'
            : 'none'

  const browseTasksLinkProps =
    resolvedActive === 'home' || resolvedActive === 'tasks'
      ? { ...navLinkProps, color: 'primary.700' as const, fontWeight: 700 }
      : navLinkProps

  const workerHref = isLoggedIn
    ? '/dashboard'
    : `/login?next=${encodeURIComponent('/dashboard')}`

  const navigateTo = useCallback((href: string) => {
    if (typeof window === 'undefined') return
    window.location.assign(href)
  }, [])
  return (
    <HStack
      ref={onMountNavigation}
      justify="space-between"
      align="center"
      gap={4}
      py={2}
      flexWrap={{ base: 'nowrap', md: 'wrap' }}
      w="full"
    >
      <HStack
        gap={{ base: 3, md: 6 }}
        flexWrap="wrap"
        align="center"
        flex="1"
        minW={0}
      >
        <Link
          as={NextLink}
          href="/"
          _hover={{ textDecoration: 'none' }}
          flexShrink={0}
        >
          <Logo />
        </Link>

        <HStack
          gap={{ base: 3, md: 6 }}
          flexWrap="wrap"
          display={{ base: 'none', md: 'flex' }}
        >
          <Link
            as={NextLink}
            href="/"
            {...browseTasksLinkProps}
            borderBottomColor={
              resolvedActive === 'home' || resolvedActive === 'tasks'
                ? 'primary.500'
                : 'transparent'
            }
          >
            Browse tasks
          </Link>
          <Link as={NextLink} href="/tasks" {...navLinkProps}>
            How it Works
          </Link>

          {isLoggedIn ? (
            <Link as={NextLink} href="/requests" {...navLinkProps}>
              Requests
            </Link>
          ) : null}
        </HStack>
      </HStack>

      <HStack
        gap={{ base: 2, md: 2.5 }}
        flexWrap="wrap"
        align="center"
        justify="flex-end"
        flexShrink={0}
      >
        <Link
          as={NextLink}
          href="/tasks/create"
          _hover={{ textDecoration: 'none' }}
        >
          <Button
            size="sm"
            variant={resolvedActive === 'post-task' ? 'primary' : 'secondary'}
            display={{ base: 'none', md: 'inline-flex' }}
          >
            Post a task
          </Button>
        </Link>
        <Link
          as={NextLink}
          href={workerHref}
          _hover={{ textDecoration: 'none' }}
        >
          <Button size="sm" display={{ base: 'none', md: 'inline-flex' }}>
            Become a worker
          </Button>
        </Link>
        <ColorModeButton
          color="formLabelMuted"
          bg="badgeBg"
          borderRadius="full"
          display={{ base: 'none', md: 'inline-flex' }}
          _hover={{ bg: 'cardBg', color: 'cardFg' }}
        />
        {isLoggedIn ? (
          <>
            <Box
              display={{ base: 'none', sm: 'block' }}
              alignSelf="stretch"
              w="1px"
              minH={6}
              bg="secondary.200"
              my="auto"
              aria-hidden
            />
            <IconButton
              asChild
              variant="ghost"
              size="sm"
              display={{ base: 'none', md: 'inline-flex' }}
              color="formLabelMuted"
              bg="badgeBg"
              borderRadius="full"
              _hover={{ bg: 'cardBg', color: 'cardFg' }}
            >
              <NextLink href="/dashboard" aria-label="Notifications">
                <IconBell />
              </NextLink>
            </IconButton>
            <IconButton
              asChild
              variant="ghost"
              size="sm"
              display={{ base: 'none', md: 'inline-flex' }}
              color="formLabelMuted"
              bg="badgeBg"
              borderRadius="full"
              _hover={{ bg: 'cardBg', color: 'cardFg' }}
            >
              <NextLink href="/profile" aria-label="Profile">
                <IconUser />
              </NextLink>
            </IconButton>
          </>
        ) : null}
        <Button
          auth
          size="sm"
          variant="secondary"
          display={{ base: 'none', md: 'inline-flex' }}
          onClick={() => {
            logout()
            navigateTo('/')
          }}
        >
          Log out
        </Button>
        <Link as={NextLink} href="/login" _hover={{ textDecoration: 'none' }}>
          <Button
            hidden={isLoggedIn}
            size="sm"
            variant="secondary"
            display={{ base: 'none', md: 'inline-flex' }}
          >
            Login
          </Button>
        </Link>
        <IconButton
          aria-label="Open menu"
          variant="ghost"
          size="sm"
          display={{ base: 'inline-flex', md: 'none' }}
          color="formLabelMuted"
          bg="badgeBg"
          borderRadius="full"
          _hover={{ bg: 'cardBg', color: 'cardFg' }}
          onClick={() => setMobileMenuOpen(true)}
        >
          <IconMenu />
        </IconButton>
      </HStack>
      <AppDrawer
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        title="Menu"
        placement="end"
        size="xs"
      >
        <HStack as="nav" align="stretch" gap={2} flexDirection="column">
          <Link
            as={NextLink}
            href="/"
            {...browseTasksLinkProps}
            onClick={() => setMobileMenuOpen(false)}
          >
            Browse tasks
          </Link>
          <Link
            as={NextLink}
            href="/tasks/create"
            {...(resolvedActive === 'post-task'
              ? {
                  ...navLinkProps,
                  color: 'primary.700' as const,
                  fontWeight: 700,
                }
              : navLinkProps)}
            onClick={() => setMobileMenuOpen(false)}
          >
            Post a task
          </Link>
          <Link
            as={NextLink}
            href="/tasks"
            {...navLinkProps}
            onClick={() => setMobileMenuOpen(false)}
          >
            How it Works
          </Link>
          <Link
            as={NextLink}
            href={workerHref}
            {...navLinkProps}
            onClick={() => setMobileMenuOpen(false)}
          >
            Become a worker
          </Link>
          {isLoggedIn ? (
            <Link
              as={NextLink}
              href="/requests"
              {...navLinkProps}
              onClick={() => setMobileMenuOpen(false)}
            >
              Requests
            </Link>
          ) : null}
          <Button
            auth
            size="sm"
            variant="secondary"
            alignSelf="flex-start"
            onClick={() => {
              logout()
              setMobileMenuOpen(false)
              navigateTo('/')
            }}
          >
            Log out
          </Button>
        </HStack>
      </AppDrawer>
    </HStack>
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
      zIndex={30}
      bg="bg"
      color="cardFg"
      backdropFilter="blur(20px)"
      boxShadow="none"
      borderWidth="1px"
      borderColor="cardBorder"
      px={{ base: 2, md: 3 }}
      py={1}
      {...props}
    >
      <Container>
        {children ?? <SiteNavigation activeItem={activeItem} />}
      </Container>
    </Box>
  )
}
