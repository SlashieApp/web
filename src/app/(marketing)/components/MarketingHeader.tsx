'use client'

import { useMutation } from '@apollo/client/react'
import {
  Box,
  type BoxProps,
  HStack,
  IconButton,
  Image,
  Stack,
  Text,
  VisuallyHidden,
  chakra,
} from '@chakra-ui/react'
import type { UpdateMySettingsMutation } from '@codegen/schema'
import NextLink from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import UpdateMySettings from '@/app/(dashboard)/account/graphql/UpdateMySettings.gql'
import { HeaderToolbarSeparator } from '@/components/Header/GuestHeaderAuth'
import {
  HEADER_MIN_HEIGHT,
  HEADER_PADDING_X,
} from '@/components/Header/headerShell'
import type { Messages } from '@/i18n/getDictionary'
import { writeBrowserLocaleCookie } from '@/i18n/localeCookie'
import {
  type AppLocale,
  appLocaleToGraphqlLanguage,
  graphqlLanguageToAppLocale,
} from '@/i18n/locales'
import { enMessages } from '@/i18n/messages/en'
import { captureApiError } from '@/utils/analytics'
import { MARKETING_HOME } from '@/utils/appRoutes'
import { Button, Drawer, Link } from '@ui'

const MARKETING_NAV_LINKS = [
  { key: 'pricing', href: '/pricing' },
  { key: 'about', href: '/about' },
] as const

const SkipLinkAnchor = chakra('a')

/** Keyboard skip link — visually hidden until focused (first tab stop). */
function SkipLink({ label }: { label: string }) {
  return (
    <SkipLinkAnchor
      href="#main-content"
      position="absolute"
      top={2}
      left={2}
      zIndex={100}
      px={4}
      py={2}
      bg="bg.surface"
      color="text.default"
      fontSize="sm"
      fontWeight={600}
      borderRadius="md"
      boxShadow="e3"
      transform="translateY(-300%)"
      _focusVisible={{
        transform: 'none',
        outline: '2px solid',
        outlineColor: 'border.focus',
        outlineOffset: '2px',
      }}
    >
      {label}
    </SkipLinkAnchor>
  )
}

const drawerLinkProps = {
  display: 'block',
  px: 3,
  py: 2,
  borderRadius: 'md',
  fontSize: 'sm',
  fontWeight: 600,
  color: 'text.default',
  _hover: { bg: 'status.success.soft', textDecoration: 'none' },
} as const

/**
 * Marketing auth actions: Log in + the green Get started CTA, rendered as
 * single <a> elements via Button asChild (a <button> inside an <a> is invalid
 * HTML and double-focuses). Over the dark landing hero the CTA is an inverted
 * outline — the hero's own CTA stays the one green primary in the first
 * viewport — and becomes the standard green primary once the header solidifies.
 */
function MarketingAuthButtons({
  ctas,
  overlay,
}: {
  ctas: Messages['common']['ctas']
  overlay: boolean
}) {
  const onDarkGhost = {
    bg: 'transparent',
    color: 'text.onInverted',
    _hover: { bg: 'bg.glass', color: 'text.onInverted' },
    _active: { bg: 'bg.glass', color: 'text.onInverted' },
  } as const

  return (
    <HStack
      gap={2}
      align="center"
      flexShrink={0}
      display={{ base: 'none', sm: 'flex' }}
    >
      <Button
        asChild
        size="sm"
        variant="ghost"
        px={2}
        {...(overlay ? onDarkGhost : null)}
      >
        <NextLink href="/login">{ctas.logIn}</NextLink>
      </Button>
      <Button
        asChild
        size="sm"
        variant={overlay ? 'ghost' : 'primary'}
        {...(overlay
          ? {
              ...onDarkGhost,
              borderWidth: '1px',
              borderColor: 'border.glass',
            }
          : null)}
      >
        <NextLink href="/register">{ctas.getStarted}</NextLink>
      </Button>
    </HStack>
  )
}

function isNavActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false
  return pathname === href || pathname.startsWith(`${href}/`)
}

function IconMenu({ title }: { title: string }) {
  return (
    <Box as="span" display="flex" color="currentColor" aria-hidden>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <title>{title}</title>
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

function LanguageSwitcher({
  initialLocale,
  messages,
  overlay,
}: {
  initialLocale: AppLocale
  messages: Messages['header']
  overlay: boolean
}) {
  const router = useRouter()
  const me = useUserStore((state) => state.me)
  const patchMe = useUserStore((state) => state.patchMe)
  const [pendingLocale, setPendingLocale] = useState<AppLocale | null>(null)
  const [updateSettings] =
    useMutation<UpdateMySettingsMutation>(UpdateMySettings)

  const selectedLocale =
    pendingLocale ??
    graphqlLanguageToAppLocale(me?.settings?.language ?? initialLocale)

  const persistLocale = useCallback(
    async (nextLocale: AppLocale) => {
      if (nextLocale === selectedLocale) return

      setPendingLocale(nextLocale)
      writeBrowserLocaleCookie(nextLocale)

      if (me?.settings) {
        const previousSettings = me.settings
        const language = appLocaleToGraphqlLanguage(nextLocale)
        patchMe({
          settings: {
            ...previousSettings,
            language,
          } as typeof previousSettings,
        })

        try {
          const result = await updateSettings({
            variables: { input: { language } },
          })
          const updated = result.data?.updateMySettings?.settings
          if (updated) patchMe({ settings: updated })
        } catch (error) {
          captureApiError(error, {
            flow: 'language_preference',
            action: 'updateMySettings',
            source: 'graphql',
            url_or_operation: 'UpdateMySettings',
            route: '/marketing',
            report_global: false,
          })
          patchMe({ settings: previousSettings })
        }
      }

      router.refresh()
      setPendingLocale(null)
    },
    [me?.settings, patchMe, router, selectedLocale, updateSettings],
  )

  const buttonBase = {
    minW: '42px',
    h: '34px',
    px: 2.5,
    fontSize: 'xs',
    fontWeight: 800,
    borderRadius: 'full',
  } as const

  return (
    <HStack
      as="fieldset"
      gap={1}
      p={0.5}
      borderWidth="1px"
      borderColor={overlay ? 'border.glass' : 'border.default'}
      borderRadius="full"
      bg={overlay ? 'bg.glass' : 'bg.surface'}
    >
      <VisuallyHidden as="legend">{messages.languageLabel}</VisuallyHidden>
      {(['en', 'zh-TW'] as const).map((locale) => {
        const selected = selectedLocale === locale
        return (
          <Button
            key={locale}
            type="button"
            variant={selected ? 'primary' : 'ghost'}
            aria-pressed={selected}
            disabled={pendingLocale !== null}
            onClick={() => void persistLocale(locale)}
            {...buttonBase}
            {...(!selected && overlay
              ? {
                  color: 'text.onInverted',
                  _hover: { bg: 'bg.glass', color: 'text.onInverted' },
                  _active: { bg: 'bg.glass', color: 'text.onInverted' },
                }
              : null)}
          >
            {locale === 'en' ? messages.languages.en : messages.languages.zhTW}
          </Button>
        )
      })}
    </HStack>
  )
}

function MarketingNavigation({
  ctas,
  initialLocale,
  messages,
  overlay,
}: {
  ctas: Messages['common']['ctas']
  initialLocale: AppLocale
  messages: Messages['header']
  overlay: boolean
}) {
  const pathname = usePathname()
  const [hasMounted, setHasMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const onMountNavigation = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || hasMounted) return
      setHasMounted(true)
    },
    [hasMounted],
  )

  const routePathname = hasMounted ? pathname : null

  const navLinkProps = {
    fontSize: 'sm',
    whiteSpace: 'nowrap',
    transition: 'color 0.2s ease',
    _hover: {
      textDecoration: 'none',
      color: overlay ? 'text.onInvertedLink' : 'text.link',
    },
  } as const

  return (
    <HStack
      ref={onMountNavigation}
      justify="space-between"
      align="center"
      gap={{ base: 3, md: 6 }}
      w="full"
    >
      <HStack flex={1} minW={0} align="center" gap={{ base: 3, md: 4 }}>
        <Link
          href={MARKETING_HOME}
          _hover={{ textDecoration: 'none' }}
          flexShrink={0}
        >
          {/* Fixed-size slot: reserving the box prevents CLS from the logo
              image loading or the light/dark artwork swap over the hero. */}
          <Box
            w={{ base: '96px', md: '126px' }}
            h={{ base: '24px', md: '32px' }}
            display="flex"
            alignItems="center"
          >
            <Image
              src={
                overlay
                  ? '/images/slashie-logo-dark.png'
                  : '/images/slashie-logo-light.png'
              }
              alt="Slashie"
              h="full"
              w="auto"
              objectFit="contain"
            />
          </Box>
        </Link>

        <Text
          display={{ base: 'none', md: 'block' }}
          color={overlay ? 'border.glass' : 'border.default'}
          fontSize="sm"
          lineHeight={1}
          aria-hidden
        >
          |
        </Text>

        <HStack
          as="nav"
          gap={{ base: 4, md: 6 }}
          display={{ base: 'none', md: 'flex' }}
          align="center"
          minW={0}
        >
          {MARKETING_NAV_LINKS.map((link) => {
            const active = isNavActive(routePathname, link.href)
            return (
              <Link
                key={link.key}
                href={link.href}
                {...navLinkProps}
                aria-current={active ? 'page' : undefined}
                // Weight + color: the active page is never colour-alone.
                fontWeight={active ? 700 : 600}
                color={
                  active
                    ? overlay
                      ? 'text.onInvertedLink'
                      : 'text.link'
                    : overlay
                      ? 'text.onInverted'
                      : 'text.default'
                }
              >
                {messages.nav[link.key]}
              </Link>
            )
          })}
        </HStack>
      </HStack>

      <HStack gap={{ base: 2, md: 4 }} align="center" flexShrink={0}>
        <LanguageSwitcher
          initialLocale={initialLocale}
          messages={messages}
          overlay={overlay}
        />
        <HeaderToolbarSeparator
          color={overlay ? 'border.glass' : 'border.default'}
        />
        <MarketingAuthButtons ctas={ctas} overlay={overlay} />

        <IconButton
          aria-label={messages.openMenu}
          variant="ghost"
          display={{ base: 'inline-flex', md: 'none' }}
          minW="44px"
          minH="44px"
          color={overlay ? 'text.onInverted' : undefined}
          _hover={overlay ? { bg: 'bg.glass' } : undefined}
          onClick={() => setMobileMenuOpen(true)}
        >
          <IconMenu title={messages.menuIconTitle} />
        </IconButton>
      </HStack>

      <Drawer
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        title={messages.menuTitle}
        placement="end"
        size="xs"
      >
        <Stack as="nav" align="stretch" gap={0} flex={1}>
          {MARKETING_NAV_LINKS.map((link) => {
            const active = isNavActive(routePathname, link.href)
            return (
              <Link
                key={link.key}
                href={link.href}
                {...drawerLinkProps}
                aria-current={active ? 'page' : undefined}
                color={active ? 'text.link' : 'text.default'}
                fontWeight={active ? 700 : 600}
                onClick={() => setMobileMenuOpen(false)}
              >
                {messages.nav[link.key]}
              </Link>
            )
          })}
          <Stack
            gap={0}
            align="stretch"
            mt="auto"
            pt={3}
            borderTopWidth="1px"
            borderColor="border.default"
          >
            <Link
              href="/login"
              {...drawerLinkProps}
              onClick={() => setMobileMenuOpen(false)}
            >
              {ctas.logIn}
            </Link>
            <Link
              href="/register"
              {...drawerLinkProps}
              onClick={() => setMobileMenuOpen(false)}
            >
              {ctas.getStarted}
            </Link>
          </Stack>
        </Stack>
      </Drawer>
    </HStack>
  )
}

export type MarketingHeaderProps = Omit<BoxProps, 'children'> & {
  initialLocale?: AppLocale
  messages?: Messages['header']
  ctas?: Messages['common']['ctas']
}

/**
 * Sticky marketing header. On the landing (`/`) it starts transparent over the
 * dark WebGL hero with inverted text, then solidifies to the standard light
 * surface once scrolled. Other marketing routes (and no-JS visitors — the
 * overlay only engages after hydration) always get the solid header.
 */
export function MarketingHeader({
  ctas = enMessages.common.ctas,
  initialLocale = 'en',
  messages = enMessages.header,
  ...props
}: MarketingHeaderProps) {
  const pathname = usePathname()
  const isLanding = pathname === MARKETING_HOME
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isLanding) return
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isLanding])

  const overlay = isLanding && mounted && !scrolled

  return (
    <Box
      as="header"
      zIndex={30}
      bg={overlay ? 'transparent' : 'bg.canvas'}
      color={overlay ? 'text.onInverted' : 'text.default'}
      borderWidth="1px"
      borderColor={overlay ? 'transparent' : 'border.default'}
      transition="background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease"
      px={HEADER_PADDING_X}
      minH={HEADER_MIN_HEIGHT}
      display="flex"
      alignItems="center"
      position="sticky"
      top={0}
      {...props}
    >
      <SkipLink label={messages.skipToContent} />
      <Box w="full" minH={HEADER_MIN_HEIGHT} display="flex" alignItems="center">
        <MarketingNavigation
          ctas={ctas}
          initialLocale={initialLocale}
          messages={messages}
          overlay={overlay}
        />
      </Box>
    </Box>
  )
}
