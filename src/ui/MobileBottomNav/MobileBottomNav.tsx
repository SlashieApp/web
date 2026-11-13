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
import {
  IoAdd,
  IoChatbubble,
  IoChatbubbleOutline,
  IoClipboard,
  IoClipboardOutline,
  IoPersonCircle,
  IoPersonCircleOutline,
  IoSearch,
  IoSearchOutline,
} from 'react-icons/io5'

import { useUserStore } from '@/app/(auth)/store/user'
import { useMessagesOptional } from '@/app/(messages)/messages/context/MessagesProvider'
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import {
  sdlElevation,
  sdlFigure,
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

const canvasVar = 'var(--chakra-colors-bg-canvas, #FAFAFA)'

const reducedTransparencyQuery =
  '@media (prefers-reduced-transparency: reduce), (prefers-reduced-motion: reduce)' as const

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
  /** The dock icon; the raised Post a task button draws its own plus. */
  icon?: keyof typeof NAV_ICONS
  emphasize?: boolean
  /** Unread count badge (Messages). */
  badge?: number
  /** Opens the account drawer instead of navigating (signed in). */
  onPress?: () => void
}

/** The bar's label size: 12px, scaling with the reader's text size up to about 1.3 times. */
const NAV_LABEL_FONT_SIZE = 'min(0.75rem, 15.6px)'

/**
 * The app's dock icons (Ionicons): outline, filled on the current tab
 * (FE-541, Ryan 13 Nov). The darker ink stays; the fill is the second cue.
 */
const NAV_ICONS = {
  search: { idle: IoSearchOutline, active: IoSearch },
  myTasks: { idle: IoClipboardOutline, active: IoClipboard },
  messages: { idle: IoChatbubbleOutline, active: IoChatbubble },
  account: { idle: IoPersonCircleOutline, active: IoPersonCircle },
} as const

function NavIcon({
  name,
  active,
}: {
  name: keyof typeof NAV_ICONS
  active: boolean
}) {
  const Glyph = active ? NAV_ICONS[name].active : NAV_ICONS[name].idle
  return (
    <Glyph
      size={20}
      aria-hidden
      data-nav-icon={active ? 'filled' : 'outline'}
    />
  )
}

/**
 * Mobile-only floating primary nav (lg+ uses Header links instead).
 * Five items (Mobile-Navigation-IA): Search · My tasks · Post a task ·
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
      icon: 'search',
    },
    {
      key: 'myTasks',
      href: MY_TASKS_HREF,
      label: t.myTasks,
      icon: 'myTasks',
    },
    {
      key: 'createTask',
      href: createTaskHref,
      label: t.createTask,
      emphasize: true,
    },
    {
      key: 'messages',
      href: MESSAGES_HREF,
      label: t.messages,
      icon: 'messages',
      badge: unread,
    },
    {
      key: 'account',
      href: signedIn
        ? '/profile'
        : `/login?next=${encodeURIComponent(pathname || '/')}`,
      label: t.account,
      icon: 'account',
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
          borderRadius="lg"
          w="full"
          maxW={MOBILE_BOTTOM_NAV_MAX_W}
          minW={0}
          mx="auto"
          boxShadow={sdlElevation.e3}
          px={1}
          py={1.5}
          gap={0}
          justify="space-between"
          // Top-aligned: the labels share one line even when one wraps.
          align="flex-start"
          overflow="visible"
          // Solid (FE-541): list rows no longer show through the bar. e3's
          // ring is the hairline.
          bg="bg.surface"
        >
          {items.map((item) => {
            const active =
              item.key === 'account'
                ? isAccountTabActive(pathname)
                : isPrimaryNavHrefActive(pathname, item.href)

            const itemProps = {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              flex: 1,
              minW: 0,
              minH: '44px',
              gap: 0.5,
              py: 1,
              px: 0,
              borderRadius: 'lg',
              color: active ? 'text.default' : 'text.subtle',
              textDecoration: 'none',
              ...sdlTransitionWithPress('color, background-color'),
              css: sdlPressActiveCss(),
              _hover: {
                textDecoration: 'none',
                color: 'text.default',
                bg: 'bg.subtle',
              },
              _focus: { outline: 'none' },
              _focusVisible: sdlFocusRing,
            } as const
            const labelText = (
              <Text
                data-nav-label=""
                fontSize={NAV_LABEL_FONT_SIZE}
                fontWeight={500}
                lineHeight="1.25"
                textAlign="center"
                lineClamp={2}
                // Wrap between words, never inside one ("Messag-es").
                wordBreak="normal"
                overflowWrap="normal"
                maxW="100%"
                color="inherit"
              >
                {item.label}
              </Text>
            )

            if (item.emphasize) {
              // The label sits on its neighbours' line (FE-541); only the
              // green circle is lifted, out of a 20px slot like theirs.
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  {...itemProps}
                  _hover={{ textDecoration: 'none', color: 'text.default' }}
                  _focusVisible={{
                    outline: 'none',
                    '& [data-create-fab]': sdlFocusRing,
                  }}
                  {...sdlTransitionWithPress('transform')}
                >
                  <Box position="relative" w="20px" h="20px" flexShrink={0}>
                    <Box
                      data-create-fab
                      position="absolute"
                      left="50%"
                      bottom={0}
                      ml="-24px"
                      w="48px"
                      h="48px"
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      bg="action.primary"
                      color="text.onGreen"
                      boxShadow={sdlElevation.e2}
                      transitionProperty="transform, box-shadow"
                      transitionDuration={sdlMotion.duration.moderate}
                      transitionTimingFunction={sdlMotion.easing.standard}
                      _hover={{ transform: 'translateY(-1px)' }}
                    >
                      <IoAdd size={24} aria-hidden />
                    </Box>
                  </Box>
                  {labelText}
                </Link>
              )
            }

            const badge = item.badge ?? 0
            const label =
              badge > 0
                ? formatMessage(t.messagesUnread, { count: badge })
                : item.label
            const content = (
              <>
                <Box position="relative" display="inline-flex">
                  {item.icon ? (
                    <NavIcon name={item.icon} active={active} />
                  ) : null}
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
                      {...sdlFigure}
                      aria-hidden
                    >
                      {badge > 99 ? '99+' : badge}
                    </Badge>
                  ) : null}
                </Box>
                {labelText}
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
