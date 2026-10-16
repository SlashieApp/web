'use client'

import { useI11n } from '@/i18n/useI11n'
import { isPrimaryNavHrefActive } from '@/utils/appRoutes'
import { Box } from '@chakra-ui/react'
import { usePathname } from 'next/navigation'
import { useCallback } from 'react'
import bag from '../i11n.json'

import { Button } from '../../Button'
import { Link } from '../../Link'

import { useOpenFeedbackDialog } from '../../FeedbackDialog/FeedbackDialogProvider'
import type { AccountNavItem } from './accountNav.config'
import { accountNavLabel, groupAccountNavItems } from './accountNav.config'
import {
  accountNavLinkRowProps,
  accountNavLogoutRowProps,
} from './accountNavLinkProps'

export type AccountNavPanelProps = {
  items: AccountNavItem[]
  onNavigate?: () => void
  onLogout: () => void
  onOpenLanguage?: () => void
  showDividers?: boolean
}

function AccountNavRow({
  item,
  onNavigate,
  onLogout,
  onOpenLanguage,
}: {
  item: AccountNavItem
  onNavigate?: () => void
  onLogout: () => void
  onOpenLanguage?: () => void
}) {
  const t = useI11n(bag)
  const pathname = usePathname() ?? ''
  const label = accountNavLabel(t, item.id, item.label)
  const openFeedback = useOpenFeedbackDialog()
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
    if (item.action === 'feedback') {
      return (
        <Button
          type="button"
          variant="ghost"
          {...accountNavLinkRowProps}
          justifyContent="flex-start"
          h="auto"
          minH="44px"
          onClick={() => {
            openFeedback()
            close()
          }}
        >
          {label}
        </Button>
      )
    }
    if (item.action === 'language') {
      return (
        <Button
          type="button"
          variant="ghost"
          {...accountNavLinkRowProps}
          justifyContent="flex-start"
          h="auto"
          minH="44px"
          onClick={() => {
            onOpenLanguage?.()
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
    <Link
      href={item.href}
      {...accountNavLinkRowProps}
      aria-current={
        isPrimaryNavHrefActive(pathname, item.href) ? 'page' : undefined
      }
      onClick={close}
    >
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
  onOpenLanguage,
  showDividers = true,
}: AccountNavPanelProps) {
  const groups = groupAccountNavItems(items)

  return (
    <Box>
      {groups.map((group, index) => (
        <Box key={group[0].section}>
          {showDividers && index > 0 ? <NavDivider /> : null}
          {group.map((item) => (
            <AccountNavRow
              key={item.id}
              item={item}
              onNavigate={onNavigate}
              onLogout={onLogout}
              onOpenLanguage={onOpenLanguage}
            />
          ))}
        </Box>
      ))}
    </Box>
  )
}
