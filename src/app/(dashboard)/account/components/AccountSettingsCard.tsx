'use client'

import { useMutation } from '@apollo/client/react'
import { HStack, Heading, Stack, Switch, Text } from '@chakra-ui/react'
import type { UpdateMySettingsMutation } from '@codegen/schema'
import { useState } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import UpdateMySettings from '@/app/(dashboard)/account/graphql/UpdateMySettings.gql'
import { captureApiError } from '@/utils/analytics'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { SectionCard } from '@ui'

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
        <Text fontSize="xs" color="formLabelMuted">
          {description}
        </Text>
      </Stack>
      <Switch.Root
        checked={checked}
        disabled={disabled}
        onCheckedChange={(details) => onChange(details.checked)}
      >
        <Switch.HiddenInput />
        <Switch.Control _checked={{ bg: 'primary.500' }}>
          <Switch.Thumb />
        </Switch.Control>
      </Switch.Root>
    </HStack>
  )
}

export function AccountSettingsCard() {
  const me = useUserStore((s) => s.me)
  const patchMe = useUserStore((s) => s.patchMe)
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
      setError(getFriendlyErrorMessage(e, 'Could not update your settings.'))
    } finally {
      setPending(null)
    }
  }

  return (
    <SectionCard p={{ base: 5, md: 6 }}>
      <Stack gap={4}>
        <Heading size="md">Settings</Heading>
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
        {error ? (
          <Text color="red.500" fontSize="sm">
            {error}
          </Text>
        ) : null}
      </Stack>
    </SectionCard>
  )
}
