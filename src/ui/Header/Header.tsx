'use client'

import {
  Badge,
  Box,
  type BoxProps,
  HStack,
  Link,
  Stack,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'

import { EmailVerificationBanner } from '@/app/(auth)/components/EmailVerificationBanner'
import { useUserStore } from '@/app/(auth)/store/user'
import { useNotificationsOptional } from '@/app/(dashboard)/context/NotificationsProvider'
import { isAccountHubPath } from '@/utils/accountHub'
import { resolveAccountNavKey } from '@/utils/accountNav'
import { APP_HOME, GET_APP_HREF } from '@/utils/appRoutes'
import { getAuthToken } from '@/utils/auth'
import { AppDrawer, Button, IconButton, Logo } from '@ui'

import { AccountMenu } from './AccountMenu'
import { BellIcon } from './BellIcon'
import {
  DashboardContextLabel,
  DashboardSectionDrawer,
  DashboardSectionMenuButton,
} from './DashboardSectionNav'
import { NotificationsDrawer } from './NotificationsDrawer'
import { accountNavLinkRowProps } from './accountNavLinkProps'

/** Stable app header height (logo + controls + padding). */
export const HEADER_MIN_HEIGHT = { base: '56px', md: '64px' } as const

function GetAppButton() {
  return (
    <Link
      href={GET_APP_HREF}
      target="_blank"
      rel="noopener noreferrer"
      display="inline-flex"
      _hover={{ textDecoration: 'none' }}
      flexShrink={0}
    >
      <Button size="sm" variant="outline">
        Get app
      </Button>
    </Link>
  )
}

function PostTaskHeaderButton() {
  return (
    <Link
      as={NextLink}
      href="/tasks/create"
      display={{ base: 'none', md: 'inline-flex' }}
      _hover={{ textDecoration: 'none' }}
      flexShrink={0}
    >
      <Button size="sm">Post a task</Button>
    </Link>
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

export type HeaderProps = {
  /** When omitted and `children` is omitted, renders the default app navigation. */
  children?: React.ReactNode
} & Omit<BoxProps, 'children'>

function AppHeaderNavigation() {
  const pathname = usePathname()
  const user = useUserStore((state) => state.user)
  const getUser = useUserStore((state) => state.getUser)
  const notifications = useNotificationsOptional()
  const [hasMounted, setHasMounted] = useState(false)
  const [guestDrawerOpen, setGuestDrawerOpen] = useState(false)
  const [dashboardDrawerOpen, setDashboardDrawerOpen] = useState(false)

  const onMount = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || hasMounted) return
      setHasMounted(true)
      if (!getAuthToken()) return
      void getUser()
    },
    [getUser, hasMounted],
  )

  const routePathname = hasMounted ? pathname : null
  const isLoggedIn = Boolean(user)
  const isDashboard = hasMounted && isAccountHubPath(routePathname)
  const dashboardActive = resolveAccountNavKey(routePathname)
  const loginHref =
    hasMounted && routePathname
      ? `/login?next=${encodeURIComponent(routePathname)}`
      : '/login'

  return (
    <HStack
      ref={onMount}
      justify="space-between"
      align="center"
      gap={{ base: 2, md: 4 }}
      minH={HEADER_MIN_HEIGHT}
      w="full"
    >
      <HStack
        gap={{ base: 2, md: 3 }}
        flex={1}
        minW={0}
        align="center"
        px={{ base: 0, md: 2, lg: 3 }}
      >
        {isLoggedIn && isDashboard ? (
          <DashboardSectionMenuButton
            onClick={() => setDashboardDrawerOpen(true)}
          />
        ) : null}

        <Link
          as={NextLink}
          href={APP_HOME}
          _hover={{ textDecoration: 'none' }}
          flexShrink={0}
        >
          <Box display={{ base: 'inline-block', md: 'none' }} lineHeight={0}>
            <Logo mobile={isDashboard} h={isDashboard ? '32px' : '24px'} />
          </Box>
          <Box display={{ base: 'none', md: 'inline-block' }} lineHeight={0}>
            <Logo />
          </Box>
        </Link>

        {isDashboard ? (
          <Box
            display={{ base: 'flex', lg: 'none' }}
            minW={0}
            flex={1}
            pl={2}
            borderLeftWidth="1px"
            borderColor="cardBorder"
          >
            <DashboardContextLabel active={dashboardActive} />
          </Box>
        ) : null}

        {isDashboard ? (
          <HStack
            display={{ base: 'none', lg: 'flex' }}
            gap={2}
            pl={3}
            borderLeftWidth="1px"
            borderColor="cardBorder"
            minW={0}
          >
            <DashboardContextLabel active={dashboardActive} />
          </HStack>
        ) : null}
      </HStack>

      <HStack align="center" flexShrink={0}>
        {!isDashboard ? (
          <>
            <PostTaskHeaderButton />
            <GetAppButton />
          </>
        ) : null}

        {isLoggedIn && notifications ? (
          <>
            <Box position="relative" display="inline-flex">
              <IconButton
                type="button"
                aria-label={
                  notifications.unreadCount > 0
                    ? `Notifications, ${notifications.unreadCount} unread`
                    : 'Notifications'
                }
                variant="ghost"
                onClick={notifications.openDrawer}
              >
                <BellIcon />
              </IconButton>
              {notifications.unreadCount > 0 ? (
                <Badge
                  position="absolute"
                  top="-2px"
                  right="-2px"
                  minW="18px"
                  h="18px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="full"
                  fontSize="10px"
                  fontWeight={700}
                  bg="primary.600"
                  color="white"
                  px={1}
                >
                  {notifications.unreadCount > 9
                    ? '9+'
                    : notifications.unreadCount}
                </Badge>
              ) : null}
            </Box>
            <NotificationsDrawer />
          </>
        ) : null}

        {isLoggedIn ? (
          <>
            <AccountMenu />
            {isDashboard ? (
              <DashboardSectionDrawer
                active={dashboardActive}
                open={dashboardDrawerOpen}
                onOpenChange={setDashboardDrawerOpen}
              />
            ) : null}
          </>
        ) : (
          <>
            <Link
              as={NextLink}
              href={loginHref}
              display={{ base: 'none', sm: 'inline-flex' }}
              fontSize="sm"
              fontWeight={600}
              color="cardFg"
              _hover={{ textDecoration: 'none', color: 'primary.700' }}
            >
              Log in
            </Link>
            <Link
              as={NextLink}
              href="/register"
              _hover={{ textDecoration: 'none' }}
              display={{ base: 'none', sm: 'inline-flex' }}
            >
              <Button size="sm">Get started</Button>
            </Link>
            <IconButton
              aria-label="Open menu"
              variant="ghost"
              display={{ base: 'inline-flex', sm: 'none' }}
              onClick={() => setGuestDrawerOpen(true)}
            >
              <IconMenu />
            </IconButton>
            <AppDrawer
              open={guestDrawerOpen}
              onOpenChange={setGuestDrawerOpen}
              title="Menu"
              placement="end"
              size="full"
            >
              <Stack as="nav" gap={0} align="stretch">
                <Link
                  as={NextLink}
                  href={loginHref}
                  {...accountNavLinkRowProps}
                  onClick={() => setGuestDrawerOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  as={NextLink}
                  href="/register"
                  {...accountNavLinkRowProps}
                  onClick={() => setGuestDrawerOpen(false)}
                >
                  Get started
                </Link>
              </Stack>
            </AppDrawer>
          </>
        )}
      </HStack>
    </HStack>
  )
}

export function Header({ children, ...props }: HeaderProps) {
  return (
    <>
      <EmailVerificationBanner />
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
        minH={HEADER_MIN_HEIGHT}
        display="flex"
        alignItems="center"
        position="sticky"
        top={0}
        {...props}
      >
        <Box
          w="full"
          minH={HEADER_MIN_HEIGHT}
          display="flex"
          alignItems="center"
        >
          {children ?? <AppHeaderNavigation />}
        </Box>
      </Box>
    </>
  )
}
