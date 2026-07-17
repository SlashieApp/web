'use client'

import { Badge, Box, type BoxProps, HStack, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'

import { EmailVerificationBanner } from '@/app/(auth)/components/EmailVerificationBanner'
import { useUserStore } from '@/app/(auth)/store/user'
import { useNotificationsOptional } from '@/app/(dashboard)/context/NotificationsProvider'
import { isAccountHubPath } from '@/utils/accountHub'
import { resolveAccountNavKey } from '@/utils/accountNav'
import { GET_APP_HREF, MARKETING_HOME } from '@/utils/appRoutes'
import { getAuthToken } from '@/utils/auth'
import { Button, Drawer, IconButton, Link, Logo } from '@ui'

import { AccountMenu } from './AccountMenu'
import { BellIcon } from './BellIcon'
import {
  DashboardContextLabel,
  DashboardSectionDrawer,
  DashboardSectionMenuButton,
} from './DashboardSectionNav'
import {
  HeaderGuestAuthButtons,
  HeaderToolbarSeparator,
} from './GuestHeaderAuth'
import { NotificationsDrawer } from './NotificationsDrawer'
import { accountNavLinkRowProps } from './accountNavLinkProps'
import { HEADER_MIN_HEIGHT, HEADER_PADDING_X } from './headerShell'

export { HEADER_MIN_HEIGHT } from './headerShell'

/**
 * Header actions match the marketing header: ghost secondary + green primary
 * CTA, rendered as single <a> elements via Button asChild (a <button> inside
 * an <a> is invalid HTML and double-focuses).
 */
function GetAppButton() {
  return (
    <Button
      asChild
      size="sm"
      variant="ghost"
      display={{ base: 'none', md: 'inline-flex' }}
      flexShrink={0}
    >
      <a href={GET_APP_HREF} target="_blank" rel="noopener noreferrer">
        Get app
      </a>
    </Button>
  )
}

function PostTaskHeaderButton() {
  return (
    <Button asChild size="sm" variant="primary" flexShrink={0}>
      <NextLink href="/tasks/create">Post a task</NextLink>
    </Button>
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
  const signupHref =
    hasMounted && routePathname
      ? `/register?next=${encodeURIComponent(routePathname)}`
      : '/register'

  return (
    <HStack
      ref={onMount}
      justify="space-between"
      align="center"
      gap={{ base: 3, md: 6 }}
      minH={HEADER_MIN_HEIGHT}
      w="full"
    >
      <HStack gap={{ base: 3, md: 4 }} flex={1} minW={0} align="center">
        {isLoggedIn && isDashboard ? (
          <DashboardSectionMenuButton
            onClick={() => setDashboardDrawerOpen(true)}
          />
        ) : null}

        <Link
          href={MARKETING_HOME}
          _hover={{ textDecoration: 'none' }}
          flexShrink={0}
        >
          <Box display={{ base: 'inline-block', md: 'none' }} lineHeight={0}>
            <Logo mobile h="32px" />
          </Box>
          <Box display={{ base: 'none', md: 'inline-block' }} lineHeight={0}>
            <Logo />
          </Box>
        </Link>

        {!isDashboard ? <GetAppButton /> : null}

        {isDashboard ? (
          <Box
            display={{ base: 'flex', lg: 'none' }}
            minW={0}
            flex={1}
            pl={2}
            borderLeftWidth="1px"
            borderColor="border.default"
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
            borderColor="border.default"
            minW={0}
          >
            <DashboardContextLabel active={dashboardActive} />
          </HStack>
        ) : null}
      </HStack>

      <HStack align="center" flexShrink={0}>
        {isLoggedIn ? (
          <>
            {!isDashboard ? (
              <>
                <PostTaskHeaderButton />
                <HeaderToolbarSeparator display="block" ml={2} />
              </>
            ) : null}
            <HStack gap={1} align="center" flexShrink={0}>
              {notifications ? (
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
                        bg="status.success.solid"
                        color="text.onGreen"
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
              <AccountMenu />
            </HStack>
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
            {!isDashboard ? <PostTaskHeaderButton /> : null}
            <HeaderToolbarSeparator />
            <HeaderGuestAuthButtons
              loginHref={loginHref}
              signupHref={signupHref}
            />
            <IconButton
              aria-label="Open menu"
              variant="ghost"
              display={{ base: 'inline-flex', sm: 'none' }}
              onClick={() => setGuestDrawerOpen(true)}
            >
              <IconMenu />
            </IconButton>
            <Drawer
              open={guestDrawerOpen}
              onOpenChange={setGuestDrawerOpen}
              title="Menu"
              placement="end"
              size="full"
            >
              <Stack as="nav" gap={0} align="stretch" flex={1}>
                <Link
                  href="/tasks/create"
                  {...accountNavLinkRowProps}
                  onClick={() => setGuestDrawerOpen(false)}
                >
                  Post a task
                </Link>
                <Stack
                  gap={0}
                  align="stretch"
                  mt="auto"
                  pt={3}
                  borderTopWidth="1px"
                  borderColor="border.default"
                >
                  <Link
                    href={loginHref}
                    {...accountNavLinkRowProps}
                    onClick={() => setGuestDrawerOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    href={signupHref}
                    {...accountNavLinkRowProps}
                    onClick={() => setGuestDrawerOpen(false)}
                  >
                    Sign up
                  </Link>
                </Stack>
              </Stack>
            </Drawer>
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
        bg="bg.canvas"
        color="text.default"
        backdropFilter="blur(20px)"
        boxShadow="none"
        borderWidth="1px"
        borderColor="border.default"
        px={HEADER_PADDING_X}
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
