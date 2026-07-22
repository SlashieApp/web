'use client'

import { useMutation } from '@apollo/client/react'
import { HStack, Stack, Switch, Text } from '@chakra-ui/react'
import type { UpdateMySettingsMutation } from '@codegen/schema'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LuSlidersHorizontal } from 'react-icons/lu'

import { useUserStore } from '@/app/(auth)/store/user'
import UpdateMySettings from '@/app/(dashboard)/account/graphql/UpdateMySettings.gql'
import { DashboardSectionCard } from '@/app/(dashboard)/components/DashboardSectionCard'
import { writeBrowserLocaleCookie } from '@/i18n/localeCookie'
import {
  type AppLocale,
  type GraphqlUserLanguage,
  appLocaleToGraphqlLanguage,
  graphqlLanguageToAppLocale,
} from '@/i18n/locales'
import { captureApiError } from '@/utils/analytics'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { Select } from '@ui'

type ToggleKey = 'isProfilePrivate' | 'marketingEmails'
type SettingsPendingKey = ToggleKey | 'language'

type SettingsInput = {
  isProfilePrivate?: boolean
  marketingEmails?: boolean
  language?: GraphqlUserLanguage
}

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

function LanguageSetting({
  disabled,
  value,
  onChange,
}: {
  disabled: boolean
  value: AppLocale
  onChange: (locale: AppLocale) => void
}) {
  return (
    <HStack justify="space-between" align="flex-start" gap={4}>
      <Stack gap={0} flex="1" minW={0}>
        <Text fontSize="sm" fontWeight={700}>
          Language
        </Text>
        <Text fontSize="xs" color="text.muted">
          Choose the language used on marketing pages.
        </Text>
      </Stack>
      <Select
        aria-label="Language"
        value={value}
        disabled={disabled}
        rootProps={{ w: { base: '9rem', sm: '10rem' } }}
        onChange={(event) => onChange(event.currentTarget.value as AppLocale)}
      >
        <option value="en">English</option>
        <option value="zh-TW">繁中</option>
      </Select>
    </HStack>
  )
}

export function AccountSettingsCard() {
  const router = useRouter()
  const me = useUserStore((s) => s.me)
  const patchMe = useUserStore((s) => s.patchMe)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<SettingsPendingKey | null>(null)

  const [updateSettings] =
    useMutation<UpdateMySettingsMutation>(UpdateMySettings)

  if (!me) return null
  const settings = me.settings
  const selectedLocale = graphqlLanguageToAppLocale(settings?.language)

  const persistSettings = async (
    input: SettingsInput,
    optimisticSettings: NonNullable<typeof settings>,
    pendingKey: SettingsPendingKey,
  ): Promise<boolean> => {
    if (!settings) return false
    setError(null)
    setPending(pendingKey)
    patchMe({ settings: optimisticSettings })
    try {
      const result = await updateSettings({
        variables: { input },
      })
      const updated = result.data?.updateMySettings?.settings
      if (updated) patchMe({ settings: updated })
      return true
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
      setError(getFriendlyErrorMessage(e, 'Could not update your settings.'))
      return false
    } finally {
      setPending(null)
    }
  }

  const update = async (key: ToggleKey, next: boolean) => {
    if (!settings) return
    await persistSettings({ [key]: next }, { ...settings, [key]: next }, key)
  }

  const updateLanguage = async (nextLocale: AppLocale) => {
    if (!settings || nextLocale === selectedLocale) return
    const previousLocale = selectedLocale
    const language = appLocaleToGraphqlLanguage(nextLocale)
    writeBrowserLocaleCookie(nextLocale)
    const saved = await persistSettings(
      { language },
      { ...settings, language } as typeof settings,
      'language',
    )
    if (!saved) {
      writeBrowserLocaleCookie(previousLocale)
      return
    }
    router.refresh()
  }

  return (
    <DashboardSectionCard
      title="Settings"
      description="Control discovery and product email preferences."
      icon={<LuSlidersHorizontal size={18} aria-hidden />}
    >
      <Stack gap={4}>
        <SettingToggle
          label="Private profile"
          description="Hide your profile from public discovery and search."
          checked={Boolean(settings?.isProfilePrivate)}
          disabled={pending === 'isProfilePrivate'}
          onChange={(next) => void update('isProfilePrivate', next)}
        />
        <SettingToggle
          label="Marketing emails"
          description="Receive occasional product news and tips by email."
          checked={Boolean(settings?.marketingEmails)}
          disabled={pending === 'marketingEmails'}
          onChange={(next) => void update('marketingEmails', next)}
        />
        <LanguageSetting
          value={selectedLocale}
          disabled={pending === 'language'}
          onChange={(nextLocale) => void updateLanguage(nextLocale)}
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
