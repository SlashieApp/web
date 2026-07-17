'use client'

import { Box } from '@chakra-ui/react'
import { useState } from 'react'

import { useMe, useUserStore } from '@/app/(auth)/store/user'
import { Dropdown, IconButton } from '@ui'

import { AccountMenuAvatar, AccountMenuContent } from './AccountMenuContent'
import { MobileNavDrawer } from './MobileNavDrawer'

export type AccountMenuProps = {
  /** Storybook: start with desktop panel open. */
  initialOpen?: boolean
}

export function AccountMenu({ initialOpen = false }: AccountMenuProps) {
  const me = useMe()
  const user = useUserStore((state) => state.user)
  const [mobileOpen, setMobileOpen] = useState(false)

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
        aria-label="Account menu"
        display={{ base: 'inline-flex', md: 'none' }}
        onClick={() => setMobileOpen(true)}
      >
        {avatar}
      </IconButton>
      <MobileNavDrawer open={mobileOpen} onOpenChange={setMobileOpen} />

      <Box display={{ base: 'none', md: 'block' }}>
        <Dropdown
          contentLabel="Account menu"
          defaultOpen={initialOpen}
          align="end"
          width="300px"
          trigger={
            <IconButton type="button" variant="ghost" aria-label="Account menu">
              {avatar}
            </IconButton>
          }
        >
          <AccountMenuContent />
        </Dropdown>
      </Box>
    </>
  )
}
