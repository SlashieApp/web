'use client'

import {
  Badge,
  Box,
  HStack,
  type SystemStyleObject,
  Text,
  chakra,
} from '@chakra-ui/react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import { useMessagesOptional } from '@/app/(messages)/messages/context/MessagesProvider'
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import {
  sdlElevation,
  sdlFocusRing,
  sdlMotion,
  sdlPressActiveCss,
  sdlTransitionWithPress,
} from '@/theme/styles'
import {
  APP_HOME,
  MY_TASKS_HREF,
  isAccountTabActive,
  isPrimaryNavHrefActive,
} from '@/utils/appRoutes'
import { useCreateTaskHref } from '@/utils/taskHandoff'

import { MobileNavDrawer } from '../Header/account/MobileNavDrawer'
import { Link } from '../Link'

import bag from './i11n.json'
import { MESSAGES_HREF, MOBILE_BOTTOM_NAV_MAX_W } from './mobileBottomNavLayout'

/** Full-bleed dissolve behind the pill (taller than the bar itself). */
const MOBILE_BOTTOM_NAV_FADE_HEIGHT =
  'calc(64px + env(safe-area-inset-bottom, 0px))' as const

const canvasVar = 'var(--chakra-colors-bg-canvas, #F7F9F8)'
const surfaceVar = 'var(--chakra-colors-bg-surface, #FFFFFF)'

const reducedTransparencyQuery =
  '@media (prefers-reduced-transparency: reduce), (prefers-reduced-motion: reduce)' as const

/** Frosted pill: semantic surface at ~72% + blur. More opaque without blur when reduced. */
const glassPillCss = {
  background: `color-mix(in srgb, ${surfaceVar} 72%, transparent)`,
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  [reducedTransparencyQuery]: {
    background: `color-mix(in srgb, ${surfaceVar} 94%, transparent)`,
    backdropFilter: 'none',
    WebkitBackdropFilter: 'none',
  },
} as SystemStyleObject

/** Blur that softens toward the top — no hard rectangular frost edge. */
const fadeBlurCss = {
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  maskImage: 'linear-gradient(to top, #000 0%, #000 28%, transparent 100%)',
  WebkitMaskImage:
    'linear-gradient(to top, #000 0%, #000 28%, transparent 100%)',
  [reducedTransparencyQuery]: {
    backdropFilter: 'none',
    WebkitBackdropFilter: 'none',
    maskImage: 'none',
    WebkitMaskImage: 'none',
  },
} as SystemStyleObject

/** Transparent → canvas wash behind the pill. Stops short of 100% so glass still reads. */
const fadeTintCss: SystemStyleObject = {
  background: `linear-gradient(to top, color-mix(in srgb, ${canvasVar} 62%, transparent) 0%, color-mix(in srgb, ${canvasVar} 38%, transparent) 42%, transparent 100%)`,
  [reducedTransparencyQuery]: {
    background: `linear-gradient(to top, color-mix(in srgb, ${canvasVar} 48%, transparent) 0%, color-mix(in srgb, ${canvasVar} 28%, transparent) 50%, transparent 100%)`,
  },
}

/** Non-interactive dissolve so scrolling content fades out instead of clipping. */
function MobileBottomNavFade() {
  return (
    <Box
      aria-hidden
      position="absolute"
      insetX={0}
      bottom={0}
      h={MOBILE_BOTTOM_NAV_FADE_HEIGHT}
      pointerEvents="none"
    >
      <Box position="absolute" inset={0} css={fadeBlurCss} />
      <Box position="absolute" inset={0} css={fadeTintCss} />
    </Box>
  )
}

type NavKey = 'search' | 'myTasks' | 'createTask' | 'messages' | 'account'

type NavItem = {
  key: NavKey
  href: string
  label: string
  icon: React.ReactNode
  emphasize?: boolean
  /** Unread count badge (Messages). */
  badge?: number
  /** Opens the account drawer instead of navigating (signed in). */
  onPress?: () => void
}

function MessagesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Messages</title>
      <path
        d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8.5A1.5 1.5 0 0 1 19 17H10l-4.5 3.5V17H5a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 5 5.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Search</title>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M16.5 16.5 20 20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MyTasksIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>My tasks</title>
      <rect
        x="4"
        y="5"
        width="16"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 3.5v3M16 3.5v3M4 10h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Post task</title>
      <path
        d="M12 6v12M6 12h12"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Profile</title>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5 20c0-3.5 3.2-5.5 7-5.5s7 2 7 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * Mobile-only floating primary nav (lg+ uses Header links instead).
 * Five items (Mobile-Navigation-IA): Search · My tasks · Post task ·
 * Messages (unread badge) · Account. Account opens the full-page account
 * drawer when signed in, and goes to log in for guests.
 */
export function MobileBottomNav() {
  const t = useI11n(bag)
  const pathname = usePathname() ?? ''
  const createTaskHref = useCreateTaskHref()
  const signedIn = Boolean(useUserStore((s) => s.user))
  const unread = useMessagesOptional()?.unreadCount ?? 0
  const [accountOpen, setAccountOpen] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)

  const items: NavItem[] = [
    {
      key: 'search',
      href: APP_HOME,
      label: t.search,
      icon: <SearchIcon />,
    },
    {
      key: 'myTasks',
      href: MY_TASKS_HREF,
      label: t.myTasks,
      icon: <MyTasksIcon />,
    },
    {
      key: 'createTask',
      href: createTaskHref,
      label: t.createTask,
      icon: <PlusIcon />,
      emphasize: true,
    },
    {
      key: 'messages',
      href: MESSAGES_HREF,
      label: t.messages,
      icon: <MessagesIcon />,
      badge: unread,
    },
    {
      key: 'account',
      href: signedIn
        ? '/profile'
        : `/login?next=${encodeURIComponent(pathname || '/')}`,
      label: t.account,
      icon: <ProfileIcon />,
      onPress: signedIn ? () => setAccountOpen(true) : undefined,
    },
  ]

  return (
    <Box
      as="nav"
      aria-label={t.ariaLabel}
      display={{ base: 'block', lg: 'none' }}
      position="fixed"
      left={0}
      right={0}
      bottom={0}
      zIndex={10}
      pointerEvents="none"
      overflowX="clip"
    >
      <MobileBottomNavFade />
      <Box px={2} minW={0} overflow="visible">
        <HStack
          pointerEvents="auto"
          position="relative"
          mb="calc(env(safe-area-inset-bottom, 0px) + 10px)"
          borderWidth="1px"
          borderColor="border.default"
          borderRadius="lg"
          w="full"
          maxW={MOBILE_BOTTOM_NAV_MAX_W}
          minW={0}
          mx="auto"
          boxShadow={sdlElevation.e3}
          px={2}
          py={1.5}
          gap={0}
          justify="space-between"
          align="center"
          overflow="visible"
          css={glassPillCss}
        >
          {items.map((item) => {
            const active =
              item.key === 'account'
                ? isAccountTabActive(pathname)
                : isPrimaryNavHrefActive(pathname, item.href)

            if (item.emphasize) {
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  flex={1}
                  minW={0}
                  gap={0.5}
                  textDecoration="none"
                  _hover={{ textDecoration: 'none' }}
                  _focus={{ outline: 'none' }}
                  _focusVisible={{
                    outline: 'none',
                    '& [data-create-fab]': sdlFocusRing,
                  }}
                  {...sdlTransitionWithPress('transform')}
                  css={sdlPressActiveCss()}
                >
                  <Box
                    data-create-fab
                    w="48px"
                    h="48px"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bg="action.primary"
                    color="text.onGreen"
                    mt={-5}
                    boxShadow={sdlElevation.e2}
                    transitionProperty="transform, box-shadow"
                    transitionDuration={sdlMotion.duration.moderate}
                    transitionTimingFunction={sdlMotion.easing.standard}
                    _hover={{ transform: 'translateY(-1px)' }}
                  >
                    {item.icon}
                  </Box>
                  <Text
                    fontSize="10px"
                    fontWeight={700}
                    color={active ? 'status.success.fg' : 'text.muted'}
                    lineHeight="short"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    maxW="100%"
                  >
                    {item.label}
                  </Text>
                </Link>
              )
            }

            const badge = item.badge ?? 0
            const label =
              badge > 0
                ? formatMessage(t.messagesUnread, { count: badge })
                : item.label
            const itemProps = {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              minW: 0,
              minH: '44px',
              gap: 0.5,
              py: 1,
              px: 0.5,
              borderRadius: 'lg',
              color: active ? 'status.success.fg' : 'text.muted',
              textDecoration: 'none',
              ...sdlTransitionWithPress('color, background-color'),
              css: sdlPressActiveCss(),
              _hover: {
                textDecoration: 'none',
                color: 'status.success.fg',
                bg: 'status.success.soft',
              },
              _focus: { outline: 'none' },
              _focusVisible: sdlFocusRing,
            } as const
            const content = (
              <>
                <Box position="relative" display="inline-flex">
                  {item.icon}
                  {badge > 0 ? (
                    <Badge
                      position="absolute"
                      top="-6px"
                      right="-10px"
                      minW="16px"
                      h="16px"
                      px={1}
                      borderRadius="full"
                      justifyContent="center"
                      bg="status.success.solid"
                      color="text.onGreen"
                      fontSize="9px"
                      fontWeight={800}
                      aria-hidden
                    >
                      {badge > 99 ? '99+' : badge}
                    </Badge>
                  ) : null}
                </Box>
                <Text
                  fontSize="10px"
                  fontWeight={700}
                  lineHeight="short"
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  maxW="100%"
                  color="inherit"
                >
                  {item.label}
                </Text>
              </>
            )

            if (item.onPress) {
              return (
                <chakra.button
                  key={item.key}
                  type="button"
                  aria-label={label}
                  aria-haspopup="dialog"
                  aria-current={active ? 'page' : undefined}
                  bg="transparent"
                  cursor="pointer"
                  onClick={item.onPress}
                  {...itemProps}
                >
                  {content}
                </chakra.button>
              )
            }

            return (
              <Link
                key={item.key}
                href={item.href}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                {...itemProps}
              >
                {content}
              </Link>
            )
          })}
        </HStack>
      </Box>
      {signedIn ? (
        <>
          <MobileNavDrawer
            open={accountOpen}
            onOpenChange={setAccountOpen}
            onOpenLanguage={() => setLanguageOpen(true)}
          />
          <LanguageSwitcher
            open={languageOpen}
            onOpenChange={setLanguageOpen}
          />
        </>
      ) : null}
    </Box>
  )
}
