'use client'

import { Stack } from '@chakra-ui/react'
import { useState } from 'react'
import { LuBell } from 'react-icons/lu'

import { useUserStore } from '@/app/(auth)/store/user'
import { DashboardSectionCard } from '@/app/(dashboard)/components/layout/DashboardSectionCard'
import {
  SETTING_ROW_DIVIDERS,
  SettingRow,
} from '@/app/(dashboard)/components/ui/SettingRow'
import { SettingToggle } from '@/app/(dashboard)/components/ui/SettingToggle'
import { useMySettingToggle } from '@/app/(dashboard)/helpers/useMySettingToggle'
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher'
import { useLocale } from '@/i18n/LocaleProvider'
import { LOCALE_LABELS } from '@/i18n/locales'
import { useI11n } from '@/i18n/useI11n'
import { Button } from '@ui'

import bag from '../../i11n.json'
import { WebPushControl } from '../WebPushControl'

/** Notifications and language: browser notifications, product emails, language. */
export function AccountNotificationsCard({
  editable = true,
}: {
  /** Off while suspended: the API refuses changes. */
  editable?: boolean
}) {
  const t = useI11n(bag)
  const locale = useLocale()
  const marketingEmails = useUserStore((s) =>
    Boolean(s.me?.settings?.marketingEmails),
  )
  const { update, pending, error } = useMySettingToggle(t.settingsError)
  const [languageOpen, setLanguageOpen] = useState(false)

  return (
    <DashboardSectionCard
      id="notifications"
      title={t.notificationsTitle}
      description={t.notificationsDescription}
      icon={<LuBell size={18} aria-hidden />}
    >
      <Stack gap={0} css={SETTING_ROW_DIVIDERS}>
        <WebPushControl disabled={!editable} />
        <SettingToggle
          label={t.marketingEmails}
          description={error ?? t.marketingEmailsDescription}
          checked={marketingEmails}
          disabled={!editable || pending === 'marketingEmails'}
          onChange={(next) => void update('marketingEmails', next)}
        />
        <SettingRow
          label={t.languageLabel}
          description={LOCALE_LABELS[locale].native}
        >
          <Button
            size="sm"
            minH="44px"
            variant="secondary"
            onClick={() => setLanguageOpen(true)}
          >
            {t.languageChange}
          </Button>
        </SettingRow>
      </Stack>
      <LanguageSwitcher open={languageOpen} onOpenChange={setLanguageOpen} />
    </DashboardSectionCard>
  )
}
