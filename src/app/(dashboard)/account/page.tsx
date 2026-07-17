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
import { Button, Card, Link } from '@ui'

import { MembershipRefreshOnMount } from '../components/MembershipRefreshOnMount'
import { WorkerMembershipCard } from '../components/WorkerMembershipCard'
import { AccountContactCard } from './components/AccountContactCard'
import { AccountSettingsCard } from './components/AccountSettingsCard'

const SECTION_LINKS = [
  { label: 'Overview', href: '#overview' },
  { label: 'Contact', href: '#contact' },
  { label: 'Login', href: '#login' },
  { label: 'Security', href: '#security' },
  { label: 'Settings', href: '#settings' },
  { label: 'Session', href: '#session' },
] as const

export default function AccountPage() {
  const router = useRouter()
  const me = useUserStore((s) => s.me)
  const logout = useUserStore((s) => s.logout)

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!me) return null

  const enabledMethods = me.enabledLoginMethods?.length
    ? me.enabledLoginMethods.join(', ')
    : 'Password'

  return (
    <>
      <MembershipRefreshOnMount />
      <DashboardPageLayout
        eyebrow="ACCOUNT"
        title="Account & security"
        description={
          <>
            Login, security, and contact settings. Your photo, name, bio, and
            date of birth live on{' '}
            <Link href="/profile" color="text.link">
              Profile
            </Link>
            .
          </>
        }
        sections={SECTION_LINKS}
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
                    Related
                  </Text>
                  <Text fontSize="xs" color="text.muted">
                    Jump to other account areas.
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
                  Profile & professional presence →
                </Link>
                <Link
                  href="/billing"
                  fontSize="sm"
                  fontWeight={600}
                  color="text.link"
                >
                  Billing & membership →
                </Link>
                {me.worker?.id ? (
                  <Link
                    href="/earnings"
                    fontSize="sm"
                    fontWeight={600}
                    color="text.link"
                  >
                    Earnings log →
                  </Link>
                ) : null}
                <Link
                  href="/profile?section=preferences"
                  fontSize="sm"
                  fontWeight={600}
                  color="text.link"
                >
                  Privacy preferences →
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
          title="Login methods"
          description="How you sign in to Slashie."
          icon={<LuKeyRound size={18} aria-hidden />}
        >
          <DashboardDetailRow label="Sign-in methods" value={enabledMethods} />
        </DashboardSectionCard>

        <DashboardSectionCard
          id="security"
          title="Security"
          description="Reset your password with an email to the address on file."
          icon={<LuShield size={18} aria-hidden />}
        >
          <Stack gap={3}>
            <DashboardDetailRow
              label="Password"
              value="Use the reset flow to change."
            />
            <Box>
              <Link href="/forgot-password" _hover={{ textDecoration: 'none' }}>
                <Button size="sm" variant="ghost">
                  Reset password
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
          title="Session"
          description="Logging out clears the session token and the cached me snapshot."
          icon={<LuLogOut size={18} aria-hidden />}
        >
          <Button size="sm" variant="ghost" onClick={handleLogout}>
            Log out
          </Button>
        </DashboardSectionCard>
      </DashboardPageLayout>
    </>
  )
}
