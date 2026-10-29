'use client'

import {
  Box,
  type BoxProps,
  Container,
  HStack,
  Image,
  Stack,
  Text,
  chakra,
} from '@chakra-ui/react'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { AccountSuspendedBanner } from '@/app/(auth)/components/ui/AccountSuspendedBanner'
import { useLocale } from '@/i18n/LocaleProvider'
import { loadPageI11n } from '@/i18n/loadPageI11n'
import { stripLocalePrefix } from '@/i18n/navigation'
import { PAGE_CONTAINER_MAX_W, PAGE_GUTTER_X } from '@/theme/pageContainer'
import { useOpenFeedbackDialog } from '@/ui/FeedbackDialog/FeedbackDialogProvider'
import { HEADER_MIN_HEIGHT, HeaderToolbarSeparator } from '@/ui/Header'
import { APP_HOME, MARKETING_HOME } from '@/utils/appRoutes'
import { openAppOnAndroid } from '@/utils/nativeApp'
import { Button, Drawer, IconButton, Link } from '@ui'

import chromeMessages from '../../i11n.chrome.json'

const MARKETING_NAV_LINKS = [
  { key: 'pricing', href: '/pricing' },
  { key: 'about', href: '/about' },
] as const

type MarketingChromeCopy = (typeof chromeMessages)['en']

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
      fontWeight={500}
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

/**
 * One row of the phone menu. Links and the Feedback button share these, so
 * they have the same height and the same left edge: a flex row (a block
 * button centres its label), and no border (a Button's 1px one pushes it in).
 */
const drawerLinkProps = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  minH: '44px',
  px: 3,
  py: 2,
  borderWidth: 0,
  borderRadius: 'md',
  fontSize: 'sm',
  fontWeight: 500,
  color: 'text.default',
  _hover: { bg: 'bg.subtle', textDecoration: 'none' },
} as const

/**
 * Marketing auth actions: Log in + Get started, rendered as single <a>
 * elements via Button asChild (a <button> inside an <a> is invalid HTML and
 * double-focuses). Over the landing hero (`quiet`) Get started is secondary
 * so the hero's search stays the one green primary in the first viewport; it
 * becomes the green primary once the header solidifies.
 */
function MarketingAuthButtons({
  quiet,
  copy,
}: {
  quiet: boolean
  copy: Pick<MarketingChromeCopy, 'logIn' | 'getStarted'>
}) {
  return (
    <HStack
      gap={2}
      align="center"
      flexShrink={0}
      display={{ base: 'none', md: 'flex' }}
    >
      <Button asChild size="sm" variant="ghost" px={2}>
        <Link href="/login" _hover={{ textDecoration: 'none' }}>
          {copy.logIn}
        </Link>
      </Button>
      <Button asChild size="sm" variant={quiet ? 'secondary' : 'primary'}>
        <Link href="/register" _hover={{ textDecoration: 'none' }}>
          {copy.getStarted}
        </Link>
      </Button>
    </HStack>
  )
}

function isNavActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false
  const barePathname = stripLocalePrefix(pathname)
  return barePathname === href || barePathname.startsWith(`${href}/`)
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

function MarketingNavigation({
  quiet,
  isLanding,
  copy,
}: {
  /** Over the landing hero: no second green primary next to the hero's. */
  quiet: boolean
  isLanding: boolean
  copy: MarketingChromeCopy
}) {
  const pathname = usePathname()
  const [hasMounted, setHasMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const openFeedback = useOpenFeedbackDialog()

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
      color: 'text.link',
    },
  } as const

  return (
    <HStack
      ref={onMountNavigation}
      justify="space-between"
      align="center"
      gap={{ base: 3, md: 6 }}
      w="full"
      overflow="visible"
      flexWrap="wrap"
    >
      <HStack flex={1} minW={0} align="center" gap={{ base: 3, md: 4 }}>
        <Link
          href={MARKETING_HOME}
          _hover={{ textDecoration: 'none' }}
          flexShrink={0}
        >
          {/* Fixed-size slot: reserving the box prevents CLS while the logo
              image loads. */}
          <Box
            w={{ base: '96px', md: '126px' }}
            h={{ base: '24px', md: '32px' }}
            display="flex"
            alignItems="center"
          >
            <Image
              src="/images/slashie-logo-light.svg"
              alt="Slashie"
              h="full"
              w="auto"
              objectFit="contain"
            />
          </Box>
        </Link>

        <Text
          display={{ base: 'none', md: 'block' }}
          color="border.default"
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
                fontWeight={active ? 600 : 500}
                color={active ? 'text.link' : 'text.default'}
              >
                {copy[link.key]}
              </Link>
            )
          })}
        </HStack>
      </HStack>

      <HStack
        gap={{ base: 2, md: 4 }}
        align="center"
        flexShrink={0}
        overflow="visible"
      >
        <HeaderToolbarSeparator color="border.default" />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          px={2}
          display={{ base: 'none', md: 'inline-flex' }}
          onClick={() => openFeedback()}
        >
          {copy.feedback}
        </Button>
        <MarketingAuthButtons quiet={quiet} copy={copy} />
        {/* Mobile-Navigation-IA: on phones the header is the logo plus one
            way into the app. Android tries the Slashie app first. */}
        <Button
          asChild
          size="sm"
          variant={quiet ? 'secondary' : 'primary'}
          display={{ base: 'inline-flex', md: 'none' }}
        >
          <Link
            href={APP_HOME}
            onClick={openAppOnAndroid}
            _hover={{ textDecoration: 'none' }}
          >
            {copy.openInApp}
          </Link>
        </Button>

        {/* Pricing and About still need a way in on other marketing pages. */}
        <IconButton
          aria-label={copy.menu}
          variant="ghost"
          display={{ base: isLanding ? 'none' : 'inline-flex', md: 'none' }}
          minW="44px"
          minH="44px"
          onClick={() => setMobileMenuOpen(true)}
        >
          <IconMenu title={copy.menu} />
        </IconButton>
      </HStack>

      <Drawer
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        title={copy.menu}
        placement="end"
        size="xs"
      >
        {/* The rows pad their own text 12px in: pull them out to the gutter so
            the labels line up with the title. */}
        <Stack as="nav" align="stretch" gap={0} flex={1} mx={-3}>
          {MARKETING_NAV_LINKS.map((link) => {
            const active = isNavActive(routePathname, link.href)
            return (
              <Link
                key={link.key}
                href={link.href}
                {...drawerLinkProps}
                aria-current={active ? 'page' : undefined}
                color={active ? 'text.link' : 'text.default'}
                fontWeight={active ? 600 : 500}
                onClick={() => setMobileMenuOpen(false)}
              >
                {copy[link.key]}
              </Link>
            )
          })}
          <Button
            type="button"
            variant="ghost"
            w="full"
            h="auto"
            {...drawerLinkProps}
            onClick={() => {
              openFeedback()
              setMobileMenuOpen(false)
            }}
          >
            {copy.feedback}
          </Button>
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
              {copy.logIn}
            </Link>
            <Link
              href="/register"
              {...drawerLinkProps}
              onClick={() => setMobileMenuOpen(false)}
            >
              {copy.getStarted}
            </Link>
          </Stack>
        </Stack>
      </Drawer>
    </HStack>
  )
}

export type MarketingHeaderProps = Omit<BoxProps, 'children'>

/**
 * The routes that have taken the marketing frame (FE-471): their page is white
 * (`bg.surface`), so their header is too. Add a route here when its page sits
 * in `MarketingFrame`; the others keep the canvas colour until then.
 */
const FRAMED_ROUTES: readonly string[] = [MARKETING_HOME, '/pricing', '/about']

/**
 * Sticky marketing header. On the landing (`/home`) it starts transparent
 * over the white page and solidifies to white once scrolled. Text colours are
 * the same either way, so this is safe from the first server paint. The other
 * framed routes (`FRAMED_ROUTES`, such as `/pricing` and `/about`) always get
 * the solid header, in white. Marketing routes that have not taken the
 * marketing frame yet get it on the canvas colour their pages still use.
 */
export function MarketingHeader(props: MarketingHeaderProps) {
  const pathname = usePathname()
  const locale = useLocale()
  const copy = loadPageI11n(chromeMessages, locale)
  const barePathname = stripLocalePrefix(pathname ?? '/')
  const isLanding = barePathname === MARKETING_HOME
  const isFramed = FRAMED_ROUTES.includes(barePathname)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (!isLanding) return
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isLanding])

  const transparent = isLanding && !scrolled

  return (
    <>
      <AccountSuspendedBanner />
      <Box
        as="header"
        zIndex={30}
        overflow="visible"
        bg={transparent ? 'transparent' : isFramed ? 'bg.surface' : 'bg.canvas'}
        color="text.default"
        borderWidth="1px"
        borderColor={transparent ? 'transparent' : 'border.default'}
        transition="background-color 0.25s ease, border-color 0.25s ease"
        minH={HEADER_MIN_HEIGHT}
        display="flex"
        alignItems="center"
        position="sticky"
        top={0}
        {...props}
      >
        <SkipLink label={copy.skipToContent} />
        <Container
          maxW={PAGE_CONTAINER_MAX_W}
          px={PAGE_GUTTER_X}
          w="full"
          minH={HEADER_MIN_HEIGHT}
          overflow="visible"
          display="flex"
          alignItems="center"
        >
          <MarketingNavigation
            quiet={transparent}
            isLanding={isLanding}
            copy={copy}
          />
        </Container>
      </Box>
    </>
  )
}
