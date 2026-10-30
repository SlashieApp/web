'use client'

import { Box } from '@chakra-ui/react'
import { useCallback } from 'react'

import { useI11n } from '@/i18n/useI11n'

import { Drawer, useCloseFromItem } from '../../Drawer'

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
  // Rows like Language and Send feedback open a dialog as the drawer closes.
  const close = useCloseFromItem(
    useCallback(() => onOpenChange(false), [onOpenChange]),
  )

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={t.accountMenu}
      placement="end"
      size="full"
    >
      {/* The rows pad their own text 12px in (the desktop popover frames them
          with 4px): pull them out to the gutter so the labels line up with the
          title. */}
      <Box mx={-3}>
        <AccountMenuContent
          presentation="drawer"
          onClose={close}
          onOpenLanguage={onOpenLanguage}
        />
      </Box>
    </Drawer>
  )
}
