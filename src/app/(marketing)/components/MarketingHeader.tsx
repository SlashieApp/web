'use client'

import {
  Box,
  type BoxProps,
  HStack,
  IconButton,
  Image,
  Stack,
  Text,
} from '@chakra-ui/react'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { HeaderToolbarSeparator } from '@/ui/Header/GuestHeaderAuth'
import { HEADER_MIN_HEIGHT, HEADER_PADDING_X } from '@/ui/Header/headerShell'
import { GET_APP_HREF, MARKETING_HOME } from '@/utils/appRoutes'
import { Button, Drawer, Link, Logo } from '@ui'

const MARKETING_NAV_LINKS = [
  { key: 'pricing', label: 'Pricing', href: '/pricing' },
  { key: 'about', label: 'About', href: '/about' },
] as const

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

function GetAppButton({ overlay }: { overlay: boolean }) {
  return (
    <Link
      href={GET_APP_HREF}
      target="_blank"
      rel="noopener noreferrer"
      display="inline-flex"
      _hover={{ textDecoration: 'none' }}
      flexShrink={0}
    >
      <Button
        size="sm"
        variant="outline"
        {...(overlay
          ? {
              bg: 'transparent',
              boxShadow: 'none',
              color: 'text.onInverted',
              borderColor: 'border.glass',
              _hover: { bg: 'bg.glass', color: 'text.onInverted' },
            }
          : null)}
      >
        Get app
      </Button>
    </Link>
  )
}

/**
 * Marketing auth actions: Log in + the green Get started CTA. Over the dark
 * landing hero the CTA renders as an inverted outline (keeping the hero's
 * primary CTA the single green action in the first viewport); once the header
 * solidifies it becomes the standard green primary with dark ink.
 */
function MarketingAuthButtons({ overlay }: { overlay: boolean }) {
  return (
    <HStack
      gap={2}
      align="center"
      flexShrink={0}
      display={{ base: 'none', sm: 'flex' }}
    >
      <Link href="/login" _hover={{ textDecoration: 'none' }} flexShrink={0}>
        <Button
          size="sm"
          variant="ghost"
          px={2}
          {...(overlay
            ? {
                color: 'text.onInverted',
                _hover: { bg: 'bg.glass', color: 'text.onInverted' },
              }
            : null)}
        >
          Log in
        </Button>
      </Link>
      <Link href="/register" _hover={{ textDecoration: 'none' }} flexShrink={0}>
        <Button
          size="sm"
          variant={overlay ? 'ghost' : 'primary'}
          {...(overlay
            ? {
                bg: 'transparent',
                color: 'text.onInverted',
                borderWidth: '1px',
                borderColor: 'border.glass',
                _hover: { bg: 'bg.glass', color: 'text.onInverted' },
              }
            : null)}
        >
          Get started
        </Button>
      </Link>
    </HStack>
  )
}

function isNavActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false
  return pathname === href || pathname.startsWith(`${href}/`)
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

function MarketingNavigation({ overlay }: { overlay: boolean }) {
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
    fontWeight: 600,
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
          {overlay ? (
            <Image
              src="/images/slashie-logo-dark.png"
              alt="Slashie"
              h={{ base: '24px', md: '32px' }}
              w="auto"
              objectFit="contain"
            />
          ) : (
            <Logo />
          )}
        </Link>

        <GetAppButton overlay={overlay} />

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
          {MARKETING_NAV_LINKS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              {...navLinkProps}
              color={
                isNavActive(routePathname, link.href)
                  ? overlay
                    ? 'text.onInvertedLink'
                    : 'text.link'
                  : overlay
                    ? 'text.onInverted'
                    : 'text.default'
              }
            >
              {link.label}
            </Link>
          ))}
        </HStack>
      </HStack>

      <HStack gap={{ base: 2, md: 4 }} align="center" flexShrink={0}>
        <HeaderToolbarSeparator
          color={overlay ? 'border.glass' : 'border.default'}
        />
        <MarketingAuthButtons overlay={overlay} />

        <IconButton
          aria-label="Open menu"
          variant="ghost"
          display={{ base: 'inline-flex', md: 'none' }}
          color={overlay ? 'text.onInverted' : undefined}
          _hover={overlay ? { bg: 'bg.glass' } : undefined}
          onClick={() => setMobileMenuOpen(true)}
        >
          <IconMenu />
        </IconButton>
      </HStack>

      <Drawer
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        title="Menu"
        placement="end"
        size="xs"
      >
        <Stack as="nav" align="stretch" gap={0} flex={1}>
          {MARKETING_NAV_LINKS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              {...drawerLinkProps}
              color={
                isNavActive(routePathname, link.href)
                  ? 'text.link'
                  : 'text.default'
              }
              fontWeight={isNavActive(routePathname, link.href) ? 700 : 600}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
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
              Log in
            </Link>
            <Link
              href="/register"
              {...drawerLinkProps}
              onClick={() => setMobileMenuOpen(false)}
            >
              Get started
            </Link>
          </Stack>
        </Stack>
      </Drawer>
    </HStack>
  )
}

export type MarketingHeaderProps = Omit<BoxProps, 'children'>

/**
 * Sticky marketing header. On the landing (`/`) it starts transparent over the
 * dark WebGL hero with inverted text, then solidifies to the standard light
 * surface once scrolled. Other marketing routes (and no-JS visitors — the
 * overlay only engages after hydration) always get the solid header.
 */
export function MarketingHeader(props: MarketingHeaderProps) {
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
      backdropFilter={overlay ? 'none' : 'blur(20px)'}
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
      <Box w="full" minH={HEADER_MIN_HEIGHT} display="flex" alignItems="center">
        <MarketingNavigation overlay={overlay} />
      </Box>
    </Box>
  )
}
