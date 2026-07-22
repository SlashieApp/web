'use client'

import { useI11n } from '@/i18n/useI11n'
import { Box, Stack, Text } from '@chakra-ui/react'
import { useCallback } from 'react'
import bag from '../../../app/(dashboard)/i11n.json'

import { focusVisibleMatchesHover } from '@/theme/system'
import { ACCOUNT_NAV, type AccountNavKey } from '@/utils/accountNav'

import { Drawer } from '../../Drawer'
import { IconButton } from '../../IconButton'
import { Link } from '../../Link'
import { MenuIcon } from '../shell/icons'

function dashboardNavRowInteraction(active: boolean) {
  const hover = {
    textDecoration: 'none',
    bg: active ? 'status.success.soft' : 'bg.subtle',
  }
  return {
    _hover: hover,
    ...focusVisibleMatchesHover(hover),
  }
}

function NavIcon({ type, title }: { type: AccountNavKey; title: string }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
  } as const

  if (type === 'overview') {
    return (
      <svg {...common} aria-hidden>
        <title>{title}</title>
        <path
          d="M4 13.5L12 5l8 8.5M7 11.5V19h10v-7.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (type === 'requests') {
    return (
      <svg {...common} aria-hidden>
        <title>{title}</title>
        <path
          d="M7 4h10l3 3v13H4V4h3Zm10 0v3h3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (type === 'quotes') {
    return (
      <svg {...common} aria-hidden>
        <title>{title}</title>
        <path
          d="M4 8h16v11H4V8Zm4-3h8v3H8V5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (type === 'earnings') {
    return (
      <svg {...common} aria-hidden>
        <title>{title}</title>
        <path
          d="M12 3a9 9 0 1 0 9 9"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M12 7v6l4 2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (type === 'billing') {
    return (
      <svg {...common} aria-hidden>
        <title>{title}</title>
        <rect
          x="3"
          y="6"
          width="18"
          height="12"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    )
  }

  if (type === 'account') {
    return (
      <svg {...common} aria-hidden>
        <title>{title}</title>
        <circle
          cx="12"
          cy="12"
          r="8.5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M12 9.3a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
    )
  }

  return (
    <svg {...common} aria-hidden>
      <title>{title}</title>
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5.5 19c.8-2.6 3.1-4.2 6.5-4.2s5.7 1.6 6.5 4.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export type DashboardSectionNavProps = {
  active: AccountNavKey
  onNavigate?: () => void
  variant?: 'sidebar' | 'drawer'
}

export function DashboardSectionNav({
  active,
  onNavigate,
  variant = 'sidebar',
}: DashboardSectionNavProps) {
  const t = useI11n(bag).sectionNav

  return (
    <Stack as="nav" aria-label={t.ariaLabel} gap={1} w="full">
      {ACCOUNT_NAV.map((item) => {
        const isActive = item.key === active
        const copy = t[item.key]
        return (
          <Link
            key={item.key}
            href={item.href}
            display="flex"
            alignItems="center"
            gap={3}
            px={3}
            py={variant === 'drawer' ? 3 : 2.5}
            minH={variant === 'drawer' ? '44px' : undefined}
            borderRadius="lg"
            bg={isActive ? 'status.success.soft' : 'transparent'}
            color={isActive ? 'status.success.fg' : 'text.default'}
            fontWeight={isActive ? 700 : 600}
            fontSize="sm"
            {...dashboardNavRowInteraction(isActive)}
            onClick={onNavigate}
          >
            <Box
              display="flex"
              color={isActive ? 'status.success.fg' : 'text.muted'}
              flexShrink={0}
            >
              <NavIcon type={item.key} title={copy.label} />
            </Box>
            <Stack gap={0} minW={0}>
              <Text>{copy.label}</Text>
              {variant === 'drawer' ? (
                <Text fontSize="xs" color="text.muted" lineClamp={2}>
                  {copy.description}
                </Text>
              ) : null}
            </Stack>
          </Link>
        )
      })}
    </Stack>
  )
}

export function DashboardContextLabel({ active }: { active: AccountNavKey }) {
  const t = useI11n(bag).sectionNav
  const activeCopy = t[active]

  return (
    <Stack gap={0} minW={0} flex={1}>
      <Text fontSize="xs" color="text.muted" fontWeight={600} lineHeight={1.2}>
        {t.contextLabel}
      </Text>
      <Text
        fontSize="sm"
        fontWeight={700}
        color="text.default"
        truncate
        lineHeight={1.3}
      >
        {activeCopy.label}
      </Text>
    </Stack>
  )
}

export function DashboardSectionMenuButton({
  onClick,
}: {
  onClick: () => void
}) {
  const t = useI11n(bag).sectionNav

  return (
    <IconButton
      aria-label={t.openSections}
      variant="ghost"
      display={{ base: 'inline-flex', lg: 'none' }}
      flexShrink={0}
      onClick={onClick}
    >
      <MenuIcon title={t.openSections} />
    </IconButton>
  )
}

export type DashboardSectionDrawerProps = {
  active: AccountNavKey
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Dashboard section drawer — trigger is rendered separately in the app header. */
export function DashboardSectionDrawer({
  active,
  open,
  onOpenChange,
}: DashboardSectionDrawerProps) {
  const t = useI11n(bag).sectionNav
  const close = useCallback(() => onOpenChange(false), [onOpenChange])

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={t.drawerTitle}
      description={t.drawerDescription}
      placement="start"
      size="sm"
    >
      <DashboardSectionNav
        active={active}
        variant="drawer"
        onNavigate={close}
      />
    </Drawer>
  )
}
