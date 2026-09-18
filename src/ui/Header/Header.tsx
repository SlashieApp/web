'use client'

import {
  Badge,
  Box,
  type BoxProps,
  Container,
  HStack,
  Skeleton,
  Stack,
} from '@chakra-ui/react'
import { usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'

import { AppStatusBanners } from '@/app/(auth)/components/AppStatusBanners'
import { useUserStore } from '@/app/(auth)/store/user'
import { useNotificationsOptional } from '@/app/(dashboard)/context/NotificationsProvider'
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher'
import { formatMessage } from '@/i18n/loadPageI11n'
import { stripLocalePrefix } from '@/i18n/navigation'
import { useI11n } from '@/i18n/useI11n'
import { PAGE_CONTAINER_MAX_W, PAGE_GUTTER_X } from '@/theme/pageContainer'
import { APP_HOME, GET_APP_HREF, WORKER_SEARCH_HREF } from '@/utils/appRoutes'
import { getAuthToken } from '@/utils/auth'

import { Button } from '../Button'
import { Drawer } from '../Drawer'
import { IconButton } from '../IconButton'
import { Link } from '../Link'
import { Logo } from '../Logo'
import { MESSAGES_HREF } from '../MobileBottomNav'

import { AccountMenu } from './account/AccountMenu'
import { accountNavLinkRowProps } from './account/accountNavLinkProps'
import bag from './i11n.json'
import { NotificationsDrawer } from './notifications/NotificationsDrawer'
import {
  HeaderGuestAuthButtons,
  HeaderToolbarSeparator,
} from './shell/GuestHeaderAuth'
import { HEADER_MIN_HEIGHT } from './shell/headerShell'
import { BellIcon, MenuIcon } from './shell/icons'

export { HEADER_MIN_HEIGHT } from './shell/headerShell'

export type HeaderProps = {
  /** When omitted and `children` is omitted, renders the default app navigation. */
  children?: React.ReactNode
  /**
   * True when the auth cookie is present on the server. SSRs account-slot
   * skeletons instead of Log in / Sign up until `me` hydrates.
   */
  hasSession?: boolean
} & Omit<BoxProps, 'children'>

function GetAppButton() {
  const t = useI11n(bag)
  const getAppHref = GET_APP_HREF === 'https://slashie.app' ? '/' : GET_APP_HREF
  const isExternal = getAppHref.startsWith('http')

  return (
    <Button
      asChild
      size="sm"
      variant="ghost"
      display={{ base: 'none', lg: 'inline-flex' }}
      flexShrink={0}
    >
      {isExternal ? (
        <a href={getAppHref} target="_blank" rel="noopener noreferrer">
          {t.getApp}
        </a>
      ) : (
        <Link href={getAppHref} _hover={{ textDecoration: 'none' }}>
          {t.getApp}
        </Link>
      )}
    </Button>
  )
}

function PostTaskButton() {
  const t = useI11n(bag)

  return (
    <Button
      asChild
      size="sm"
      variant="primary"
      flexShrink={0}
      display={{ base: 'none', lg: 'inline-flex' }}
    >
      <Link href="/tasks/create" _hover={{ textDecoration: 'none' }}>
        {t.postTask}
      </Link>
    </Button>
  )
}

function DesktopPrimaryNav() {
  const t = useI11n(bag)
  const pathname = usePathname()
  const bare = stripLocalePrefix(pathname ?? '')

  const linkProps = {
    fontSize: 'sm',
    fontWeight: 600,
    px: 2,
    py: 1,
    borderRadius: 'md',
    _hover: { textDecoration: 'none', bg: 'status.success.soft' },
  } as const

  const items = [
    { href: WORKER_SEARCH_HREF, label: t.nav.workers },
    { href: '/requests', label: t.myTasks },
    { href: MESSAGES_HREF, label: t.messages },
  ] as const

  return (
    <HStack
      display={{ base: 'none', lg: 'flex' }}
      gap={1}
      align="center"
      flexShrink={0}
    >
      {items.map((item) => {
        const active = bare === item.href || bare.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            color={active ? 'status.success.fg' : 'text.default'}
            aria-current={active ? 'page' : undefined}
            {...linkProps}
          >
            {item.label}
          </Link>
        )
      })}
      <PostTaskButton />
    </HStack>
  )
}

function NotificationsBell() {
  const notifications = useNotificationsOptional()
  const copy = useI11n(bag).notifications

  if (!notifications) return null

  return (
    <>
      <Box position="relative" display="inline-flex">
        <IconButton
          type="button"
          aria-label={
            notifications.unreadCount > 0
              ? formatMessage(copy.ariaLabelUnread, {
                  count: notifications.unreadCount,
                })
              : copy.ariaLabel
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
            {notifications.unreadCount > 9 ? '9+' : notifications.unreadCount}
          </Badge>
        ) : null}
      </Box>
      <NotificationsDrawer />
    </>
  )
}

function GuestMobileMenu({
  loginHref,
  signupHref,
}: {
  loginHref: string
  signupHref: string
}) {
  const t = useI11n(bag)
  const [open, setOpen] = useState(false)

  return (
    <>
      <IconButton
        aria-label={t.openMenu}
        variant="ghost"
        display={{ base: 'inline-flex', lg: 'none' }}
        onClick={() => setOpen(true)}
      >
        <MenuIcon />
      </IconButton>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        title={t.menu}
        placement="end"
        size="full"
      >
        <Stack as="nav" gap={0} align="stretch" flex={1}>
          <HStack justify="flex-end" align="center" mb={3} flexShrink={0}>
            <LanguageSwitcher />
          </HStack>
          <Link
            href={WORKER_SEARCH_HREF}
            {...accountNavLinkRowProps}
            onClick={() => setOpen(false)}
          >
            {t.nav.workers}
          </Link>
          <Link
            href="/tasks/create"
            {...accountNavLinkRowProps}
            onClick={() => setOpen(false)}
          >
            {t.postTask}
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
              onClick={() => setOpen(false)}
            >
              {t.logIn}
            </Link>
            <Link
              href={signupHref}
              {...accountNavLinkRowProps}
              onClick={() => setOpen(false)}
            >
              {t.signUp}
            </Link>
          </Stack>
        </Stack>
      </Drawer>
    </>
  )
}

function HeaderAuthSkeleton() {
  const t = useI11n(bag)

  return (
    <>
      <HeaderToolbarSeparator display="block" ml={2} />
      <HStack
        gap={1}
        align="center"
        flexShrink={0}
        overflow="visible"
        aria-busy="true"
        aria-label={t.authLoadingAria}
      >
        <Box display={{ base: 'none', lg: 'inline-flex' }}>
          <LanguageSwitcher />
        </Box>
        <Skeleton boxSize="44px" borderRadius="full" flexShrink={0} />
        <Skeleton boxSize="44px" borderRadius="full" flexShrink={0} />
      </HStack>
    </>
  )
}

/** Default Header body — guest vs signed-in from auth; same toolbar on every route. */
function AppHeaderNavigation({ hasSession }: { hasSession: boolean }) {
  const pathname = usePathname()
  const user = useUserStore((state) => state.user)
  const getUser = useUserStore((state) => state.getUser)
  const [hasMounted, setHasMounted] = useState(false)
  const [sessionResolved, setSessionResolved] = useState(!hasSession)

  const onMount = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || hasMounted) return
      setHasMounted(true)
      if (!getAuthToken()) {
        setSessionResolved(true)
        return
      }
      void getUser().finally(() => {
        setSessionResolved(true)
      })
    },
    [getUser, hasMounted],
  )

  const routePathname = hasMounted ? pathname : null
  const isLoggedIn = Boolean(user)
  const showAuthSkeleton = hasSession && !isLoggedIn && !sessionResolved
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
      overflow="visible"
      flexWrap="wrap"
    >
      <HStack gap={{ base: 3, md: 4 }} flex={1} minW={0} align="center">
        <Link
          href={APP_HOME}
          _hover={{ textDecoration: 'none' }}
          flexShrink={0}
        >
          <Box lineHeight={0}>
            <Logo />
          </Box>
        </Link>

        <GetAppButton />
      </HStack>

      <HStack align="center" flexShrink={0} overflow="visible">
        <DesktopPrimaryNav />
        {showAuthSkeleton ? (
          <HeaderAuthSkeleton />
        ) : isLoggedIn ? (
          <>
            <HeaderToolbarSeparator display="block" ml={2} />
            <HStack gap={1} align="center" flexShrink={0} overflow="visible">
              <Box display={{ base: 'none', lg: 'inline-flex' }}>
                <LanguageSwitcher />
              </Box>
              <NotificationsBell />
              <AccountMenu />
            </HStack>
          </>
        ) : (
          <>
            <HeaderToolbarSeparator />
            <Box display={{ base: 'none', lg: 'inline-flex' }}>
              <LanguageSwitcher />
            </Box>
            <HeaderGuestAuthButtons
              loginHref={loginHref}
              signupHref={signupHref}
            />
            <GuestMobileMenu loginHref={loginHref} signupHref={signupHref} />
          </>
        )}
      </HStack>
    </HStack>
  )
}

/**
 * Sticky app header chrome. Pass `children` to replace the default navigation
 * (e.g. marketing). Otherwise renders auth-aware browse toolbar.
 */
export function Header({
  children,
  hasSession = false,
  ...props
}: HeaderProps) {
  const pathname = usePathname()
  const bare = stripLocalePrefix(pathname ?? '')
  const overSearchMap = bare === APP_HOME || bare.startsWith(`${APP_HOME}/`)

  return (
    <>
      <AppStatusBanners />
      <Box
        as="header"
        isolation="isolate"
        zIndex={30}
        overflow="visible"
        bg={
          overSearchMap ? { base: 'transparent', lg: 'bg.canvas' } : 'bg.canvas'
        }
        color="text.default"
        boxShadow="none"
        borderWidth="1px"
        borderColor={
          overSearchMap
            ? { base: 'transparent', lg: 'border.default' }
            : 'border.default'
        }
        minH={HEADER_MIN_HEIGHT}
        display="flex"
        alignItems="center"
        position="sticky"
        top={0}
        _before={
          overSearchMap
            ? {
                content: '""',
                position: 'absolute',
                inset: 0,
                backdropFilter: 'blur(20px)',
                pointerEvents: 'none',
                zIndex: -1,
              }
            : undefined
        }
        {...props}
      >
        <Container
          maxW={PAGE_CONTAINER_MAX_W}
          px={PAGE_GUTTER_X}
          w="full"
          minH={HEADER_MIN_HEIGHT}
          overflow="visible"
          display="flex"
          alignItems="center"
        >
          {children ?? <AppHeaderNavigation hasSession={hasSession} />}
        </Container>
      </Box>
    </>
  )
}
