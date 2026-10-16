'use client'

import { useMutation } from '@apollo/client/react'
import type { UpdateMySettingsMutation } from '@codegen/schema'
import { useState } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import UpdateMySettings from '@/app/(dashboard)/account/graphql/UpdateMySettings.gql'
import { captureApiError, getCurrentRoute } from '@/utils/analytics'

export type MySettingKey = 'isProfilePrivate' | 'marketingEmails'

/**
 * Flips one of `me.settings` optimistically and rolls back if the API says
 * no. `errorText` is the page's own copy for a failed save.
 */
export function useMySettingToggle(errorText: string) {
  const me = useUserStore((s) => s.me)
  const patchMe = useUserStore((s) => s.patchMe)
  const [pending, setPending] = useState<MySettingKey | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [updateSettings] =
    useMutation<UpdateMySettingsMutation>(UpdateMySettings)

  const update = async (key: MySettingKey, next: boolean) => {
    const settings = me?.settings
    if (!settings) return
    setError(null)
    setPending(key)
    patchMe({ settings: { ...settings, [key]: next } })
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
        route: getCurrentRoute(),
        report_global: false,
      })
      patchMe({ settings })
      setError(errorText)
    } finally {
      setPending(null)
    }
  }

  return { update, pending, error }
}
