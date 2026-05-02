'use client'

import {
  Box,
  type BoxProps,
  Button as ChakraButton,
  ClientOnly,
  Container,
  HStack,
  IconButton,
  Link,
  Skeleton,
  Stack,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { useCallback, useState } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import { getAuthToken } from '@/utils/auth'
import { AppDrawer } from '../AppDrawer/AppDrawer'
import { Button } from '../Button'
import { HoverDropdownMenu } from '../HoverDropdownMenu'
import { Logo } from '../Logo/Logo'
import { useColorMode } from '../color-mode'

const accountMenuLinkProps = {
  display: 'block',
  px: 3,
  py: 2,
  borderRadius: 'md',
  fontSize: 'sm',
  fontWeight: 600,
  color: 'cardFg',
  _hover: { bg: 'badgeBg', textDecoration: 'none' },
} as const

function HeaderThemeMenuButton() {
  const { colorMode, toggleColorMode } = useColorMode()
  const label = colorMode === 'dark' ? 'Light mode' : 'Dark mode'
  return (
    <Button
      variant="ghost"
      w="full"
      h="auto"
      minH={0}
      py={2}
      px={3}
      justifyContent="flex-start"
      fontSize="sm"
      fontWeight={600}
      borderRadius="md"
      color="cardFg"
      onClick={toggleColorMode}
    >
      {label}
    </Button>
  )
}

function ThemeToggleMenuRow() {
  return (
    <Box borderTopWidth="1px" borderColor="cardBorder" mt={1} pt={1}>
      <ClientOnly fallback={<Skeleton h="36px" w="full" borderRadius="md" />}>
        <HeaderThemeMenuButton />
      </ClientOnly>
    </Box>
  )
}

function HeaderLogOutMenuRow({
  onNavigate,
  onAfterLogout,
}: {
  onNavigate: (href: string) => void
  onAfterLogout?: () => void
}) {
  const logout = useUserStore((state) => state.logout)
  return (
    <Box borderTopWidth="1px" borderColor="cardBorder" mt={1} pt={1}>
      <ChakraButton
        type="button"
        variant="ghost"
        w="full"
        h="auto"
        minH={0}
        py={2}
        px={3}
        justifyContent="flex-start"
        fontSize="sm"
        fontWeight={600}
        color="red.600"
        borderRadius="md"
        _hover={{ bg: 'badgeBg' }}
        onClick={() => {
          logout()
          onAfterLogout?.()
          onNavigate('/')
        }}
      >
        Log out
      </ChakraButton>
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

/** Compact initials avatar for the signed-in header trigger (Airbnb-style account chip). */
function AccountTriggerGlyph({ email }: { email: string }) {
  const initial = email.trim().charAt(0).toUpperCase() || '?'
  return (
    <Box
      boxSize="22px"
      borderRadius="full"
      bg="primary.100"
      color="primary.700"
      fontSize="10px"
      fontWeight={700}
      display="flex"
      alignItems="center"
      justifyContent="center"
      lineHeight={1}
      flexShrink={0}
      aria-hidden
    >
      {initial}
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

  const workerHref = isLoggedIn
    ? '/dashboard'
    : `/login?next=${encodeURIComponent('/dashboard')}`

  const workerCtaLabel = isLoggedIn ? 'Switch to work mode' : 'Join Slashie'

  const navigateTo = useCallback((href: string) => {
    if (typeof window === 'undefined') return
    window.location.assign(href)
  }, [])

  const loginHref =
    hasMounted && currentPathname
      ? `/login?next=${encodeURIComponent(currentPathname)}`
      : '/login'

  return (
    <HStack
      ref={onMountNavigation}
      justify="space-between"
      align="center"
      gap={4}
      py={2}
      flexWrap={{ base: 'nowrap', lg: 'wrap' }}
      w="full"
    >
      <HStack
        gap={{ base: 3, lg: 6 }}
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
      </HStack>

      <HStack
        gap={{ base: 2, lg: 2.5 }}
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
            display={{ base: 'none', lg: 'inline-flex' }}
          >
            Post a task
          </Button>
        </Link>
        <Link
          as={NextLink}
          href={workerHref}
          display={{ base: 'none', lg: 'inline-flex' }}
          alignItems="center"
          flexShrink={0}
          fontSize="sm"
          fontWeight={600}
          color="cardFg"
          h="44px"
          px={3}
          borderRadius="md"
          _hover={{
            textDecoration: 'none',
            bg: 'badgeBg',
            color: 'cardFg',
          }}
        >
          {workerCtaLabel}
        </Link>
        <HoverDropdownMenu
          align="end"
          contentLabel={isLoggedIn ? 'Account menu' : 'Menu'}
          display={{ base: 'none', lg: 'inline-block' }}
          trigger={
            <IconButton
              type="button"
              variant="ghost"
              size="sm"
              color="formLabelMuted"
              bg="badgeBg"
              borderRadius="full"
              aria-label={isLoggedIn ? 'Account menu' : 'Menu'}
              _hover={{ bg: 'cardBg', color: 'cardFg' }}
            >
              {user ? <AccountTriggerGlyph email={user.email} /> : <IconMenu />}
            </IconButton>
          }
        >
          <Stack gap={0}>
            {isLoggedIn ? (
              <>
                <Link as={NextLink} href="/profile" {...accountMenuLinkProps}>
                  Profile
                </Link>
                <Link as={NextLink} href="/dashboard" {...accountMenuLinkProps}>
                  Dashboard
                </Link>
                <Link
                  as={NextLink}
                  href="/dashboard/messages"
                  {...accountMenuLinkProps}
                >
                  Messages
                </Link>
                <ThemeToggleMenuRow />
                <HeaderLogOutMenuRow onNavigate={navigateTo} />
              </>
            ) : (
              <>
                <Link as={NextLink} href={loginHref} {...accountMenuLinkProps}>
                  Log in
                </Link>
                <Link as={NextLink} href="/register" {...accountMenuLinkProps}>
                  Create account
                </Link>
                <ThemeToggleMenuRow />
              </>
            )}
          </Stack>
        </HoverDropdownMenu>
        <IconButton
          aria-label="Open menu"
          variant="ghost"
          size="sm"
          display={{ base: 'inline-flex', lg: 'none' }}
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
        <HStack as="nav" align="stretch" gap={0} flexDirection="column">
          <Link
            as={NextLink}
            href="/tasks/create"
            {...accountMenuLinkProps}
            color={resolvedActive === 'post-task' ? 'primary.700' : 'cardFg'}
            fontWeight={resolvedActive === 'post-task' ? 700 : 600}
            onClick={() => setMobileMenuOpen(false)}
          >
            Post a task
          </Link>
          <Link
            as={NextLink}
            href={workerHref}
            {...accountMenuLinkProps}
            onClick={() => setMobileMenuOpen(false)}
          >
            {workerCtaLabel}
          </Link>
          {isLoggedIn ? (
            <>
              <Link
                as={NextLink}
                href="/profile"
                {...accountMenuLinkProps}
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <Link
                as={NextLink}
                href="/dashboard"
                {...accountMenuLinkProps}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                as={NextLink}
                href="/dashboard/messages"
                {...accountMenuLinkProps}
                onClick={() => setMobileMenuOpen(false)}
              >
                Messages
              </Link>
            </>
          ) : (
            <>
              <Link
                as={NextLink}
                href={loginHref}
                {...accountMenuLinkProps}
                onClick={() => setMobileMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                as={NextLink}
                href="/register"
                {...accountMenuLinkProps}
                onClick={() => setMobileMenuOpen(false)}
              >
                Create account
              </Link>
            </>
          )}
          <ThemeToggleMenuRow />
          {isLoggedIn ? (
            <HeaderLogOutMenuRow
              onNavigate={navigateTo}
              onAfterLogout={() => setMobileMenuOpen(false)}
            />
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
      zIndex={30}
      bg="bg"
      color="cardFg"
      backdropFilter="blur(20px)"
      boxShadow="none"
      borderWidth="1px"
      borderColor="cardBorder"
      px={{ base: 2, lg: 3 }}
      py={1}
      {...props}
    >
      <Container>
        {children ?? <SiteNavigation activeItem={activeItem} />}
      </Container>
    </Box>
  )
}
