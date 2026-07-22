'use client'

import { Box, Stack, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { LuKeyRound, LuLogOut, LuShield } from 'react-icons/lu'

import { useUserStore } from '@/app/(auth)/store/user'
import { DashboardPageLayout } from '@/app/(dashboard)/components/DashboardPageLayout'
import {
  DashboardDetailRow,
  DashboardSectionCard,
} from '@/app/(dashboard)/components/DashboardSectionCard'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { useI11n } from '@/i18n/useI11n'
import { Button, Card, Link } from '@ui'

import { MembershipRefreshOnMount } from '../components/MembershipRefreshOnMount'
import { WorkerMembershipCard } from '../components/WorkerMembershipCard'
import { AccountContactCard } from './components/AccountContactCard'
import { AccountSettingsCard } from './components/AccountSettingsCard'
import bag from './i11n.json'

export default function AccountPage() {
  const router = useRouter()
  const href = useLocalizedHref()
  const me = useUserStore((s) => s.me)
  const logout = useUserStore((s) => s.logout)
  const t = useI11n(bag)

  const handleLogout = () => {
    logout()
    router.push(href('/'))
  }

  if (!me) return null

  const enabledMethods = me.enabledLoginMethods?.length
    ? me.enabledLoginMethods.join(', ')
    : t.passwordFallback
  const sectionLinks = [
    { label: t.navOverview, href: '#overview' },
    { label: t.navContact, href: '#contact' },
    { label: t.navLogin, href: '#login' },
    { label: t.navSecurity, href: '#security' },
    { label: t.navSettings, href: '#settings' },
    { label: t.navSession, href: '#session' },
  ] as const

  return (
    <>
      <MembershipRefreshOnMount />
      <DashboardPageLayout
        eyebrow={t.eyebrow}
        title={t.title}
        description={
          <>
            {t.descriptionBefore}{' '}
            <Link href="/profile" color="text.link">
              {t.profileLink}
            </Link>
            {t.descriptionAfter}
          </>
        }
        sections={sectionLinks}
        sidebar={
          <>
            {me.worker?.membership ? (
              <WorkerMembershipCard membership={me.worker.membership} />
            ) : null}
            <Card
              layout="section"
              p={{ base: 4, md: 5 }}
              header={
                <Stack gap={0.5}>
                  <Text fontSize="md" fontWeight={600}>
                    {t.relatedTitle}
                  </Text>
                  <Text fontSize="xs" color="text.muted">
                    {t.relatedDescription}
                  </Text>
                </Stack>
              }
            >
              <Stack gap={3}>
                <Link
                  href="/profile"
                  fontSize="sm"
                  fontWeight={600}
                  color="text.link"
                >
                  {t.profilePresence}
                </Link>
                <Link
                  href="/billing"
                  fontSize="sm"
                  fontWeight={600}
                  color="text.link"
                >
                  {t.billingMembership}
                </Link>
                {me.worker?.id ? (
                  <Link
                    href="/earnings"
                    fontSize="sm"
                    fontWeight={600}
                    color="text.link"
                  >
                    {t.earningsLog}
                  </Link>
                ) : null}
                <Link
                  href="/profile?section=preferences"
                  fontSize="sm"
                  fontWeight={600}
                  color="text.link"
                >
                  {t.privacyPreferences}
                </Link>
              </Stack>
            </Card>
          </>
        }
      >
        <Box id="contact" scrollMarginTop="96px">
          <AccountContactCard />
        </Box>

        <DashboardSectionCard
          id="login"
          title={t.loginMethodsTitle}
          description={t.loginMethodsDescription}
          icon={<LuKeyRound size={18} aria-hidden />}
        >
          <DashboardDetailRow label={t.signInMethods} value={enabledMethods} />
        </DashboardSectionCard>

        <DashboardSectionCard
          id="security"
          title={t.securityTitle}
          description={t.securityDescription}
          icon={<LuShield size={18} aria-hidden />}
        >
          <Stack gap={3}>
            <DashboardDetailRow
              label={t.passwordLabel}
              value={t.passwordValue}
            />
            <Box>
              <Link href="/forgot-password" _hover={{ textDecoration: 'none' }}>
                <Button size="sm" variant="ghost">
                  {t.resetPassword}
                </Button>
              </Link>
            </Box>
          </Stack>
        </DashboardSectionCard>

        <Box id="settings" scrollMarginTop="96px">
          <AccountSettingsCard />
        </Box>

        <DashboardSectionCard
          id="session"
          title={t.sessionTitle}
          description={t.sessionDescription}
          icon={<LuLogOut size={18} aria-hidden />}
        >
          <Button size="sm" variant="ghost" onClick={handleLogout}>
            {t.logout}
          </Button>
        </DashboardSectionCard>
      </DashboardPageLayout>
    </>
  )
}
