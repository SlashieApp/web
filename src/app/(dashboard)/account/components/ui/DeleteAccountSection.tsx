'use client'

import { Box, Stack, Text } from '@chakra-ui/react'
import type { LoginMethod } from '@codegen/schema'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LuTrash2 } from 'react-icons/lu'

import { DashboardSectionCard } from '@/app/(dashboard)/components/layout/DashboardSectionCard'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { useI11n } from '@/i18n/useI11n'
import { Button } from '@ui'

import bag from '../../i11n.json'
import { DeleteAccountDialog } from './DeleteAccountDialog'

/**
 * "Delete account" at the end of Account (FE-198). Coming back from the
 * Google / Apple re-auth (`?delete=confirm`) reopens the dialog ready to
 * confirm, then drops the query so a refresh doesn't reopen it.
 */
export function DeleteAccountSection({
  enabledLoginMethods,
}: {
  enabledLoginMethods: readonly LoginMethod[]
}) {
  const t = useI11n(bag)
  const router = useRouter()
  const href = useLocalizedHref()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [reauthed, setReauthed] = useState(false)
  const returnedFromReauth = searchParams.get('delete') === 'confirm'

  useEffect(() => {
    if (!returnedFromReauth) return
    setReauthed(true)
    setOpen(true)
    router.replace(href('/account#delete'), { scroll: false })
  }, [returnedFromReauth, router, href])

  return (
    <DashboardSectionCard
      id="delete"
      tone="danger"
      title={t.deleteTitle}
      description={t.deleteDescription}
      icon={<LuTrash2 size={18} aria-hidden />}
    >
      <Stack gap={3} align="flex-start">
        <Text fontSize="sm" color="text.muted">
          {t.deletePoints[2]}
        </Text>
        <Box>
          <Button
            size="sm"
            minH="44px"
            variant="danger"
            onClick={() => setOpen(true)}
          >
            {t.deleteButton}
          </Button>
        </Box>
      </Stack>
      <DeleteAccountDialog
        open={open}
        onOpenChange={setOpen}
        enabledLoginMethods={enabledLoginMethods}
        reauthed={reauthed}
      />
    </DashboardSectionCard>
  )
}
