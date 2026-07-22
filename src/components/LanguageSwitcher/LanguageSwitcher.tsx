'use client'

import { Box, HStack, Text } from '@chakra-ui/react'
import { useMutation } from '@apollo/client/react'
import { usePathname, useRouter } from 'next/navigation'
import { LuGlobe } from 'react-icons/lu'

import UpdateMySettings from '@/app/(dashboard)/account/graphql/UpdateMySettings.gql'
import { useUserStore } from '@/app/(auth)/store/user'
import {
  type AppLocale,
  LOCALES,
  LOCALE_LABELS,
  LOCALE_TO_API,
} from '@/i18n/locales'
import { writeLocaleCookie } from '@/i18n/localeCookie'
import { localeFromPathname, swapLocaleInPath } from '@/i18n/navigation'
import { useLocale } from '@/i18n/LocaleProvider'
import { Dropdown, IconButton } from '@ui'

type LanguageSwitcherProps = {
  /** Invert colors for dark marketing hero overlay. */
  overlay?: boolean
  /** Accessible label for the trigger. */
  label?: string
}

/**
 * Globe dropdown language switcher. Swaps the `/en` ↔ `/zh-hk` URL slug,
 * writes the locale cookie, and persists `settings.language` when signed in.
 */
export function LanguageSwitcher({
  overlay = false,
  label = 'Language',
}: LanguageSwitcherProps) {
  const locale = useLocale()
  const pathname = usePathname() ?? '/'
  const router = useRouter()
  const user = useUserStore((s) => s.user)
  const [updateSettings] = useMutation(UpdateMySettings)

  const onSelect = (next: AppLocale) => {
    if (next === locale) return
    writeLocaleCookie(next)

    const search =
      typeof window !== 'undefined' ? window.location.search : ''
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

  return (
    <Dropdown
      align="end"
      width="180px"
      contentLabel={label}
      trigger={
        <IconButton
          aria-label={label}
          size="sm"
          variant="ghost"
          color={overlay ? 'text.onInverted' : 'text.default'}
          _hover={
            overlay
              ? { bg: 'bg.glass', color: 'text.onInverted' }
              : { bg: 'bg.subtle' }
          }
        >
          <LuGlobe size={18} aria-hidden />
        </IconButton>
      }
    >
      {({ close }) => (
        <Box py={1}>
          {LOCALES.map((code) => {
            const selected = code === active
            const meta = LOCALE_LABELS[code]
            return (
              <Box
                key={code}
                as="button"
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                w="full"
                textAlign="left"
                px={3}
                py={2}
                cursor="pointer"
                bg={selected ? 'bg.subtle' : 'transparent'}
                _hover={{ bg: 'bg.subtle' }}
                onClick={() => {
                  onSelect(code)
                  close()
                }}
              >
                <HStack justify="space-between" gap={3}>
                  <Text fontSize="sm" fontWeight={selected ? 700 : 500}>
                    {meta.native}
                  </Text>
                  <Text fontSize="xs" color="text.muted" fontWeight={600}>
                    {meta.short}
                  </Text>
                </HStack>
              </Box>
            )
          })}
        </Box>
      )}
    </Dropdown>
  )
}
