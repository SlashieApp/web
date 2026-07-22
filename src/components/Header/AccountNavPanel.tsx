'use client'

import { useI11n } from '@/i18n/useI11n'
import { Box } from '@chakra-ui/react'
import { useCallback } from 'react'
import bag from './i11n.json'

import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { Button, Link } from '@ui'

import type { AccountNavItem } from './accountNav.config'
import { groupAccountNavItems } from './accountNav.config'
import { accountNavLabel } from './accountNavLabel'
import {
  accountNavLinkRowProps,
  accountNavLogoutRowProps,
} from './accountNavLinkProps'

export type AccountNavPanelProps = {
  items: AccountNavItem[]
  onNavigate?: () => void
  onLogout: () => void
  onOpenNotifications?: () => void
  showDividers?: boolean
}

function AccountNavRow({
  item,
  onNavigate,
  onLogout,
  onOpenNotifications,
}: {
  item: AccountNavItem
  onNavigate?: () => void
  onLogout: () => void
  onOpenNotifications?: () => void
}) {
  const href = useLocalizedHref()
  const t = useI11n(bag)
  const label = accountNavLabel(t, item.id, item.label)
  const close = useCallback(() => {
    onNavigate?.()
  }, [onNavigate])

  if (item.kind === 'action') {
    if (item.action === 'logout') {
      return (
        <Button
          type="button"
          variant="ghost"
          {...accountNavLogoutRowProps}
          justifyContent="flex-start"
          h="auto"
          minH="44px"
          onClick={() => {
            onLogout()
            close()
          }}
        >
          {label}
        </Button>
      )
    }
    if (item.action === 'notifications') {
      return (
        <Button
          type="button"
          variant="ghost"
          {...accountNavLinkRowProps}
          justifyContent="flex-start"
          h="auto"
          minH="44px"
          onClick={() => {
            onOpenNotifications?.()
            close()
          }}
        >
          {label}
        </Button>
      )
    }
    return null
  }

  if (!item.href) return null

  return (
    <Link href={href(item.href)} {...accountNavLinkRowProps} onClick={close}>
      {label}
    </Link>
  )
}

function NavDivider() {
  return <Box borderTopWidth="1px" borderColor="border.default" my={1} />
}

export function AccountNavPanel({
  items,
  onNavigate,
  onLogout,
  onOpenNotifications,
  showDividers = true,
}: AccountNavPanelProps) {
  const groups = groupAccountNavItems(items)

  return (
    <Box role="menu">
      {groups.main.map((item) => (
        <AccountNavRow
          key={item.id}
          item={item}
          onNavigate={onNavigate}
          onLogout={onLogout}
          onOpenNotifications={onOpenNotifications}
        />
      ))}

      {showDividers && groups.worker.length > 0 ? <NavDivider /> : null}
      {groups.worker.map((item) => (
        <AccountNavRow
          key={item.id}
          item={item}
          onNavigate={onNavigate}
          onLogout={onLogout}
          onOpenNotifications={onOpenNotifications}
        />
      ))}

      {showDividers && groups.account.length > 0 ? <NavDivider /> : null}
      {groups.account.map((item) => (
        <AccountNavRow
          key={item.id}
          item={item}
          onNavigate={onNavigate}
          onLogout={onLogout}
          onOpenNotifications={onOpenNotifications}
        />
      ))}
    </Box>
  )
}
