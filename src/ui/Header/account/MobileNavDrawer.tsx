'use client'

import { useCallback } from 'react'

import { useI11n } from '@/i18n/useI11n'

import { Drawer } from '../../Drawer'

import bag from '../i11n.json'
import { AccountMenuContent } from './AccountMenuContent'

export type MobileNavDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenLanguage: () => void
}

/** Phone account menu. Post a task lives in the bottom nav, not here (FE-269). */
export function MobileNavDrawer({
  open,
  onOpenChange,
  onOpenLanguage,
}: MobileNavDrawerProps) {
  const t = useI11n(bag)
  const close = useCallback(() => onOpenChange(false), [onOpenChange])

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={t.accountMenu}
      placement="end"
      size="full"
    >
      <AccountMenuContent onClose={close} onOpenLanguage={onOpenLanguage} />
    </Drawer>
  )
}
