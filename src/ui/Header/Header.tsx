'use client'

import { Box, type BoxProps, HStack, IconButton, Link } from '@chakra-ui/react'
import NextLink from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { clearAuthToken, getAuthToken } from '@/utils/auth'
import { AppDrawer } from '../AppDrawer/AppDrawer'
import { Button } from '../Button'
import { Container } from '../Container'
import { Heading } from '../Typography'

const navLinkProps = {
  fontSize: 'sm',
  fontWeight: 600,
  color: 'muted',
  _hover: { textDecoration: 'none', color: 'primary.700' },
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
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setIsLoggedIn(Boolean(getAuthToken()))
  }, [])

  const resolvedActive: HeaderActiveItem =
    activeItem !== 'none'
      ? activeItem
      : pathname?.startsWith('/tasks/create')
        ? 'post-task'
        : pathname === '/' || pathname?.startsWith('/tasks')
          ? 'home'
          : 'none'

  const browseTasksLinkProps =
    resolvedActive === 'home' || resolvedActive === 'tasks'
      ? { ...navLinkProps, color: 'primary.700' as const, fontWeight: 700 }
      : navLinkProps

  const workerHref = isLoggedIn
    ? '/dashboard'
    : `/login?next=${encodeURIComponent('/dashboard')}`

  return (
    <HStack
      justify="space-between"
      align="center"
      gap={4}
      py={2}
      flexWrap={{ base: 'nowrap', md: 'wrap' }}
      w="full"
    >
      <HStack
        gap={{ base: 2, md: 4 }}
        flexWrap="wrap"
        align="center"
        flex="1"
        minW={0}
      >
        <Heading size="md" flexShrink={0}>
          <Link as={NextLink} href="/" _hover={{ textDecoration: 'none' }}>
            Slashie
          </Link>
        </Heading>

        <HStack
          gap={{ base: 2, md: 3 }}
          flexWrap="wrap"
          display={{ base: 'none', md: 'flex' }}
        >
          <Link as={NextLink} href="/" {...browseTasksLinkProps}>
            Browse tasks
          </Link>

          {isLoggedIn ? (
            <>
              <Link as={NextLink} href="/quotes" {...navLinkProps}>
                Quotes
              </Link>
              <Link as={NextLink} href="/requests" {...navLinkProps}>
                Requests
              </Link>
            </>
          ) : null}
        </HStack>
      </HStack>

      <HStack
        gap={{ base: 2, md: 3 }}
        flexWrap="wrap"
        align="center"
        justify="flex-end"
        flexShrink={0}
      >
        <Button
          as={NextLink}
          href="/tasks/create"
          size="sm"
          variant={resolvedActive === 'post-task' ? 'solid' : 'outline'}
          display={{ base: 'none', md: 'inline-flex' }}
        >
          Post a task
        </Button>
        <Button
          as={NextLink}
          href={workerHref}
          size="sm"
          display={{ base: 'none', md: 'inline-flex' }}
        >
          Become a worker
        </Button>
        {isLoggedIn ? (
          <>
            <Box
              display={{ base: 'none', sm: 'block' }}
              alignSelf="stretch"
              w="1px"
              minH={6}
              bg="border"
              my="auto"
              aria-hidden
            />
            <IconButton
              asChild
              variant="ghost"
              size="sm"
              display={{ base: 'none', md: 'inline-flex' }}
              colorPalette="blue"
              color="primary.600"
              _hover={{ bg: 'rgba(0, 63, 177, 0.06)' }}
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
              colorPalette="blue"
              color="primary.600"
              _hover={{ bg: 'rgba(0, 63, 177, 0.06)' }}
            >
              <NextLink href="/profile" aria-label="Profile">
                <IconUser />
              </NextLink>
            </IconButton>
            <Button
              size="sm"
              variant="subtle"
              display={{ base: 'none', md: 'inline-flex' }}
              onClick={() => {
                clearAuthToken()
                router.push('/')
              }}
            >
              Log out
            </Button>
          </>
        ) : null}
        <IconButton
          aria-label="Open menu"
          variant="ghost"
          size="sm"
          display={{ base: 'inline-flex', md: 'none' }}
          colorPalette="blue"
          color="primary.600"
          _hover={{ bg: 'rgba(0, 63, 177, 0.06)' }}
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
            href={workerHref}
            {...navLinkProps}
            onClick={() => setMobileMenuOpen(false)}
          >
            Become a worker
          </Link>
          {isLoggedIn ? (
            <>
              <Link
                as={NextLink}
                href="/quotes"
                {...navLinkProps}
                onClick={() => setMobileMenuOpen(false)}
              >
                Quotes
              </Link>
              <Link
                as={NextLink}
                href="/requests"
                {...navLinkProps}
                onClick={() => setMobileMenuOpen(false)}
              >
                Requests
              </Link>
              <Button
                size="sm"
                variant="subtle"
                alignSelf="flex-start"
                onClick={() => {
                  clearAuthToken()
                  setMobileMenuOpen(false)
                  router.push('/')
                }}
              >
                Log out
              </Button>
            </>
          ) : null}
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
      top={2}
      left={2}
      right={24}
      zIndex={30}
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
