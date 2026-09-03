'use client'

import { Box, HStack, type SystemStyleObject, Text } from '@chakra-ui/react'
import { usePathname } from 'next/navigation'

import { stripLocalePrefix } from '@/i18n/navigation'
import { useI11n } from '@/i18n/useI11n'
import { sdlElevation, sdlFocusRing, sdlMotion } from '@/theme/styles'
import { APP_HOME } from '@/utils/appRoutes'

import { Link } from '../Link'

import bag from './i11n.json'

/**
 * Space under scrollable content so the last row stays reachable above the
 * fade + floating pill. Taller than the pill alone so the dissolve has runway.
 */
export const MOBILE_BOTTOM_NAV_CLEARANCE =
  'calc(96px + env(safe-area-inset-bottom, 0px))' as const

/** Full-bleed dissolve behind the pill (taller than the bar itself). */
const MOBILE_BOTTOM_NAV_FADE_HEIGHT =
  'calc(128px + env(safe-area-inset-bottom, 0px))' as const

const canvasVar = 'var(--chakra-colors-bg-canvas, #F7F9F8)'
const surfaceVar = 'var(--chakra-colors-bg-surface, #FFFFFF)'

const reducedTransparencyQuery =
  '@media (prefers-reduced-transparency: reduce), (prefers-reduced-motion: reduce)' as const

/** Frosted pill: semantic surface at ~80% + blur. More opaque without blur when reduced. */
const glassPillCss = {
  background: `color-mix(in srgb, ${surfaceVar} 80%, transparent)`,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
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

/** Transparent → canvas wash sitting behind the glass pill. */
const fadeTintCss: SystemStyleObject = {
  background: `linear-gradient(to top, ${canvasVar} 0%, color-mix(in srgb, ${canvasVar} 72%, transparent) 40%, transparent 100%)`,
  [reducedTransparencyQuery]: {
    background: `linear-gradient(to top, ${canvasVar} 0%, color-mix(in srgb, ${canvasVar} 50%, transparent) 52%, transparent 100%)`,
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

export const MESSAGES_HREF = '/dashboard/messages' as const

type NavKey = 'search' | 'myTasks' | 'createTask' | 'messages' | 'profile'

type NavItem = {
  key: NavKey
  href: string
  label: string
  icon: React.ReactNode
  emphasize?: boolean
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

function MessagesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Messages</title>
      <path
        d="M5 6.5h14a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5H9l-4 3v-3H5A1.5 1.5 0 0 1 3.5 15V8A1.5 1.5 0 0 1 5 6.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
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

function isHrefActive(pathname: string, href: string): boolean {
  const bare = stripLocalePrefix(pathname)
  if (href === APP_HOME) {
    return bare === APP_HOME || bare.startsWith(`${APP_HOME}/`)
  }
  return bare === href || bare.startsWith(`${href}/`)
}

/**
 * Mobile-only floating primary nav (md+ uses Header links instead).
 * Items: Search · My tasks · Post task · Messages · Profile.
 */
export function MobileBottomNav() {
  const t = useI11n(bag)
  const pathname = usePathname() ?? ''

  const items: NavItem[] = [
    {
      key: 'search',
      href: APP_HOME,
      label: t.search,
      icon: <SearchIcon />,
    },
    {
      key: 'myTasks',
      href: '/requests',
      label: t.myTasks,
      icon: <MyTasksIcon />,
    },
    {
      key: 'createTask',
      href: '/tasks/create',
      label: t.createTask,
      icon: <PlusIcon />,
      emphasize: true,
    },
    {
      key: 'messages',
      href: MESSAGES_HREF,
      label: t.messages,
      icon: <MessagesIcon />,
    },
    {
      key: 'profile',
      href: '/profile',
      label: t.profile,
      icon: <ProfileIcon />,
    },
  ]

  return (
    <Box
      as="nav"
      aria-label={t.ariaLabel}
      display={{ base: 'block', md: 'none' }}
      position="fixed"
      left={0}
      right={0}
      bottom={0}
      zIndex={40}
      pointerEvents="none"
    >
      <MobileBottomNavFade />
      <HStack
        pointerEvents="auto"
        position="relative"
        mx={3}
        mb="calc(env(safe-area-inset-bottom, 0px) + 10px)"
        borderWidth="1px"
        borderColor="border.default"
        borderRadius="2xl"
        boxShadow={sdlElevation.e3}
        px={2}
        py={1.5}
        gap={0}
        justify="space-between"
        align="center"
        css={glassPillCss}
      >
        {items.map((item) => {
          const active = isHrefActive(pathname, item.href)

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
                >
                  {item.label}
                </Text>
              </Link>
            )
          }

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
              minH="44px"
              gap={0.5}
              py={1}
              px={0.5}
              borderRadius="lg"
              color={active ? 'status.success.fg' : 'text.muted'}
              textDecoration="none"
              transitionProperty="color, background-color"
              transitionDuration={sdlMotion.duration.moderate}
              transitionTimingFunction={sdlMotion.easing.standard}
              _hover={{
                textDecoration: 'none',
                color: 'status.success.fg',
                bg: 'status.success.soft',
              }}
              _focus={{ outline: 'none' }}
              _focusVisible={sdlFocusRing}
            >
              {item.icon}
              <Text
                fontSize="10px"
                fontWeight={700}
                lineHeight="short"
                whiteSpace="nowrap"
                color="inherit"
              >
                {item.label}
              </Text>
            </Link>
          )
        })}
      </HStack>
    </Box>
  )
}
