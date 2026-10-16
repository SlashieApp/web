'use client'

import { HStack, Stack } from '@chakra-ui/react'
import type { LoginMethod } from '@codegen/schema'
import { useRouter } from 'next/navigation'
import { LuKeyRound } from 'react-icons/lu'

import { stashResetEmail } from '@/app/(auth)/helpers/resetEmailHandoff'
import { useUserStore } from '@/app/(auth)/store/user'
import { DashboardSectionCard } from '@/app/(dashboard)/components/layout/DashboardSectionCard'
import {
  SETTING_ROW_DIVIDERS,
  SettingRow,
} from '@/app/(dashboard)/components/ui/SettingRow'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { useI11n } from '@/i18n/useI11n'
import { Badge, Button, Link } from '@ui'

import bag from '../../i11n.json'

export type AccountSignInCardProps = {
  email: string
  methods: readonly LoginMethod[]
  /** Show the Password row (accounts that have one). */
  showPassword: boolean
}

/** Sign-in and security: how you sign in, a new password by email, Log out. */
export function AccountSignInCard({
  email,
  methods,
  showPassword,
}: AccountSignInCardProps) {
  const t = useI11n(bag)
  const router = useRouter()
  const href = useLocalizedHref()
  const logout = useUserStore((s) => s.logout)
  const labels: Record<string, string> = t.loginMethodLabels

  return (
    <DashboardSectionCard
      id="sign-in"
      title={t.signInTitle}
      description={t.signInDescription}
      icon={<LuKeyRound size={18} aria-hidden />}
    >
      <Stack gap={0} css={SETTING_ROW_DIVIDERS}>
        <SettingRow label={t.signedInWith}>
          <HStack gap={2} flexWrap="wrap">
            {methods.map((method) => (
              <Badge key={method} variant="neutral">
                {labels[method] ?? method}
              </Badge>
            ))}
          </HStack>
        </SettingRow>
        {showPassword ? (
          <SettingRow label={t.passwordLabel} description={t.passwordHint}>
            <Button asChild size="sm" minH="44px" variant="secondary">
              {/* forgot-password picks the email up from sessionStorage. */}
              <Link
                href="/forgot-password"
                onClick={() => stashResetEmail(email)}
                _hover={{ textDecoration: 'none' }}
              >
                {t.changePassword}
              </Link>
            </Button>
          </SettingRow>
        ) : null}
        <SettingRow label={t.deviceLabel}>
          <Button
            size="sm"
            minH="44px"
            variant="secondary"
            onClick={() => {
              logout()
              router.push(href('/'))
            }}
          >
            {t.logout}
          </Button>
        </SettingRow>
      </Stack>
    </DashboardSectionCard>
  )
}
