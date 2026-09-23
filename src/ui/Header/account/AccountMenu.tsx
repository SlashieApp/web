'use client'

import { useI11n } from '@/i18n/useI11n'
import { Box } from '@chakra-ui/react'
import { useCallback, useState } from 'react'
import bag from '../i11n.json'

import { useMe, useUserStore } from '@/app/(auth)/store/user'
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher'
import { Dropdown } from '../../Dropdown'
import { IconButton } from '../../IconButton'

import { AccountMenuAvatar, AccountMenuContent } from './AccountMenuContent'
import { MobileNavDrawer } from './MobileNavDrawer'

export type AccountMenuProps = {
  /** Storybook: start with desktop panel open. */
  initialOpen?: boolean
}

export function AccountMenu({ initialOpen = false }: AccountMenuProps) {
  const me = useMe()
  const user = useUserStore((state) => state.user)
  const t = useI11n(bag)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)
  const openLanguage = useCallback(() => {
    setMobileOpen(false)
    setLanguageOpen(true)
  }, [])

  if (!user) return null

  const email = user.email ?? me?.email ?? ''
  const avatar = (
    <AccountMenuAvatar
      name={me?.profile?.name}
      avatarUrl={me?.profile?.avatarUrl}
      email={email}
    />
  )

  return (
    <>
      <IconButton
        type="button"
        variant="ghost"
        aria-label={t.accountMenu}
        display={{ base: 'inline-flex', lg: 'none' }}
        onClick={() => setMobileOpen(true)}
      >
        {avatar}
      </IconButton>
      <MobileNavDrawer
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        onOpenLanguage={openLanguage}
      />

      <Box display={{ base: 'none', lg: 'block' }}>
        <Dropdown
          contentLabel={t.accountMenu}
          defaultOpen={initialOpen}
          align="end"
          width="300px"
          trigger={
            <IconButton
              type="button"
              variant="ghost"
              aria-label={t.accountMenu}
            >
              {avatar}
            </IconButton>
          }
        >
          <AccountMenuContent onOpenLanguage={openLanguage} />
        </Dropdown>
      </Box>
      <LanguageSwitcher open={languageOpen} onOpenChange={setLanguageOpen} />
    </>
  )
}
