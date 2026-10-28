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

import { AppStatusBanners } from '@/app/(auth)/components/ui/AppStatusBanners'
import { useUserStore } from '@/app/(auth)/store/user'
import { useMessagesOptional } from '@/app/(messages)/messages/context/MessagesProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { PAGE_CONTAINER_MAX_W, PAGE_GUTTER_X } from '@/theme/pageContainer'
import {
  APP_HOME,
  WORKER_SEARCH_HREF,
  isPrimaryNavHrefActive,
} from '@/utils/appRoutes'
import { getAuthToken } from '@/utils/auth'
import { requestSearchRefresh } from '@/utils/searchRefresh'
import { useCreateTaskHref } from '@/utils/taskHandoff'

import { Button } from '../Button'
import { Drawer } from '../Drawer'
import { FeedbackTrigger } from '../FeedbackDialog/FeedbackTrigger'
import { GetAppButton } from '../GetApp/GetAppButton'
import { IconButton } from '../IconButton'
import { Link } from '../Link'
import { Logo } from '../Logo'
import { MESSAGES_HREF } from '../MobileBottomNav/mobileBottomNavLayout'

import { AccountMenu } from './account/AccountMenu'
import { accountNavLinkRowProps } from './account/accountNavLinkProps'
import bag from './i11n.json'
import {
  HeaderGuestAuthButtons,
  HeaderToolbarSeparator,
} from './shell/GuestHeaderAuth'
import { HEADER_MIN_HEIGHT } from './shell/headerShell'

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

function PostTaskButton() {
  const t = useI11n(bag)
  const createTaskHref = useCreateTaskHref()

  return (
    <Button
      asChild
      size="sm"
      variant="primary"
      flexShrink={0}
      display={{ base: 'none', lg: 'inline-flex' }}
    >
      <Link href={createTaskHref} _hover={{ textDecoration: 'none' }}>
        {t.postTask}
      </Link>
    </Button>
  )
}

/**
 * Desktop links. My Tasks, Messages and Post task need an account (FE-216):
 * they show only once a signed-in user has loaded, so guests never see them
 * flash while the session resolves.
 */
function DesktopPrimaryNav({ signedIn }: { signedIn: boolean }) {
  const t = useI11n(bag)
  const pathname = usePathname() ?? ''
  const unread = useMessagesOptional()?.unreadCount ?? 0

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
    ...(signedIn
      ? [
          { href: '/tasks', label: t.myTasks },
          { href: MESSAGES_HREF, label: t.messages },
        ]
      : []),
  ]

  return (
    <HStack
      display={{ base: 'none', lg: 'flex' }}
      gap={1}
      align="center"
      flexShrink={0}
    >
      {items.map((item) => {
        const active = isPrimaryNavHrefActive(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            color={active ? 'status.success.fg' : 'text.default'}
            aria-current={active ? 'page' : undefined}
            aria-label={
              item.href === MESSAGES_HREF && unread > 0
                ? formatMessage(t.messagesUnread, { count: unread })
                : undefined
            }
            display="inline-flex"
            alignItems="center"
            gap={1.5}
            {...linkProps}
          >
            {item.label}
            {item.href === MESSAGES_HREF && unread > 0 ? (
              <Badge
                minW="18px"
                h="18px"
                px={1}
                borderRadius="full"
                fontSize="10px"
                fontWeight={700}
                bg="status.success.solid"
                color="text.onGreen"
                justifyContent="center"
                aria-hidden
              >
                {unread > 99 ? '99+' : unread}
              </Badge>
            ) : null}
          </Link>
        )
      })}
      {signedIn ? <PostTaskButton /> : null}
    </HStack>
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
          onClick={(event) => {
            // Already on search: refresh the results, don't navigate.
            if (
              !routePathname ||
              !isPrimaryNavHrefActive(routePathname, APP_HOME)
            ) {
              return
            }
            event.preventDefault()
            requestSearchRefresh()
          }}
        >
          <Box lineHeight={0}>
            <Logo />
          </Box>
        </Link>

        <GetAppButton display={{ base: 'none', lg: 'inline-flex' }} />
      </HStack>

      <HStack align="center" flexShrink={0} overflow="visible">
        <DesktopPrimaryNav signedIn={isLoggedIn} />
        {showAuthSkeleton ? (
          <HeaderAuthSkeleton />
        ) : isLoggedIn ? (
          <>
            <HeaderToolbarSeparator display="block" ml={2} />
            <HStack gap={1} align="center" flexShrink={0} overflow="visible">
              <AccountMenu />
            </HStack>
          </>
        ) : (
          <>
            <HeaderToolbarSeparator />
            <Box display={{ base: 'none', lg: 'inline-flex' }}>
              <FeedbackTrigger variant="button" />
            </Box>
            <HeaderGuestAuthButtons
              loginHref={loginHref}
              signupHref={signupHref}
            />
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
  return (
    <>
      <AppStatusBanners />
      <Box
        as="header"
        isolation="isolate"
        zIndex={30}
        overflow="visible"
        bg="bg.canvas"
        color="text.default"
        boxShadow="none"
        borderWidth="1px"
        borderColor="border.default"
        minH={HEADER_MIN_HEIGHT}
        // No mobile header in the app (Mobile-Navigation-IA): the bottom bar
        // carries navigation below lg. Status banners above still show.
        display={{ base: 'none', lg: 'flex' }}
        alignItems="center"
        position="sticky"
        top={0}
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
