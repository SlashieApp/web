'use client'

import { useMutation } from '@apollo/client/react'
import { usePathname, useRouter } from 'next/navigation'

import { useUserStore } from '@/app/(auth)/store/user'
import UpdateMySettings from '@/app/(dashboard)/account/graphql/UpdateMySettings.gql'
import { useLocale } from '@/i18n/LocaleProvider'
import { writeLocaleCookie } from '@/i18n/localeCookie'
import { type AppLocale, LOCALE_TO_API } from '@/i18n/locales'
import { localeFromPathname, swapLocaleInPath } from '@/i18n/navigation'
import {
  LanguageSwitcher as UiLanguageSwitcher,
  type LanguageSwitcherProps as UiLanguageSwitcherProps,
} from '@ui'

export type LanguageSwitcherProps = Omit<
  UiLanguageSwitcherProps,
  'locale' | 'onSelect'
>

/**
 * App-wired language switcher: URL slug, locale cookie, and optional
 * `settings.language` sync when signed in. UI lives in `@ui`.
 */
export function LanguageSwitcher(props: LanguageSwitcherProps) {
  const locale = useLocale()
  const pathname = usePathname() ?? '/'
  const router = useRouter()
  const user = useUserStore((s) => s.user)
  const [updateSettings] = useMutation(UpdateMySettings)

  const onSelect = (next: AppLocale) => {
    if (next === locale) return
    writeLocaleCookie(next)

    const search = typeof window !== 'undefined' ? window.location.search : ''
    const nextPath = swapLocaleInPath(pathname, next, search)

    if (user?.id) {
      void updateSettings({
        variables: {
          input: { language: LOCALE_TO_API[next] },
        },
      }).catch(() => {
        // Cookie + URL still update; API sync is best-effort.
      })
    }

    router.push(nextPath)
    router.refresh()
  }

  const active = localeFromPathname(pathname) || locale

  return <UiLanguageSwitcher locale={active} onSelect={onSelect} {...props} />
}
