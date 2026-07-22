'use client'

import { useMutation } from '@apollo/client/react'
import { HStack, Stack, Switch, Text } from '@chakra-ui/react'
import type { UpdateMySettingsMutation } from '@codegen/schema'
import { useState } from 'react'
import { LuSlidersHorizontal } from 'react-icons/lu'

import { useUserStore } from '@/app/(auth)/store/user'
import UpdateMySettings from '@/app/(dashboard)/account/graphql/UpdateMySettings.gql'
import { DashboardSectionCard } from '@/app/(dashboard)/components/DashboardSectionCard'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useI11n } from '@/i18n/useI11n'
import { captureApiError } from '@/utils/analytics'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import bag from '../i11n.json'

type ToggleKey = 'isProfilePrivate' | 'marketingEmails'

function SettingToggle({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  disabled: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <HStack justify="space-between" align="flex-start" gap={4}>
      <Stack gap={0} flex="1" minW={0}>
        <Text fontSize="sm" fontWeight={700}>
          {label}
        </Text>
        <Text fontSize="xs" color="text.muted">
          {description}
        </Text>
      </Stack>
      <Switch.Root
        checked={checked}
        disabled={disabled}
        onCheckedChange={(details) => onChange(details.checked)}
      >
        <Switch.HiddenInput />
        <Switch.Control _checked={{ bg: 'action.primary' }}>
          <Switch.Thumb />
        </Switch.Control>
      </Switch.Root>
    </HStack>
  )
}

export function AccountSettingsCard() {
  const me = useUserStore((s) => s.me)
  const patchMe = useUserStore((s) => s.patchMe)
  const t = useI11n(bag)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<ToggleKey | null>(null)

  const [updateSettings] =
    useMutation<UpdateMySettingsMutation>(UpdateMySettings)

  if (!me) return null
  const settings = me.settings

  const update = async (key: ToggleKey, next: boolean) => {
    if (!settings) return
    setError(null)
    setPending(key)
    const optimistic = { ...settings, [key]: next }
    patchMe({ settings: optimistic })
    try {
      const result = await updateSettings({
        variables: { input: { [key]: next } },
      })
      const updated = result.data?.updateMySettings?.settings
      if (updated) patchMe({ settings: updated })
    } catch (e) {
      captureApiError(e, {
        flow: 'profile_update',
        action: 'updateMySettings',
        source: 'graphql',
        url_or_operation: 'UpdateMySettings',
        route: '/account',
        report_global: false,
      })
      patchMe({ settings })
      setError(getFriendlyErrorMessage(e, t.settingsError))
    } finally {
      setPending(null)
    }
  }

  return (
    <DashboardSectionCard
      title={t.settingsTitle}
      description={t.settingsDescription}
      icon={<LuSlidersHorizontal size={18} aria-hidden />}
    >
      <Stack gap={4}>
        <HStack justify="space-between" align="center" gap={4}>
          <Stack gap={0} flex="1" minW={0}>
            <Text fontSize="sm" fontWeight={700}>
              {t.languageTitle}
            </Text>
            <Text fontSize="xs" color="text.muted">
              {t.languageDescription}
            </Text>
          </Stack>
          <LanguageSwitcher label={t.languageTitle} />
        </HStack>
        <SettingToggle
          label={t.privateProfile}
          description={t.privateProfileDescription}
          checked={Boolean(settings?.isProfilePrivate)}
          disabled={pending === 'isProfilePrivate'}
          onChange={(next) => void update('isProfilePrivate', next)}
        />
        <SettingToggle
          label={t.marketingEmails}
          description={t.marketingEmailsDescription}
          checked={Boolean(settings?.marketingEmails)}
          disabled={pending === 'marketingEmails'}
          onChange={(next) => void update('marketingEmails', next)}
        />
        {error ? (
          <Text color="status.danger.fg" fontSize="sm">
            {error}
          </Text>
        ) : null}
      </Stack>
    </DashboardSectionCard>
  )
}
