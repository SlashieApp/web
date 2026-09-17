import type { Metadata } from 'next'

import { getHasAuthSession } from '@/app/helpers/getHasAuthSession'
import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n } from '@/i18n/loadPageI11n'

import { AccountAuthGate } from './components/account/AccountAuthGate'
import { AccountShell } from './components/account/AccountShell'
import bag from './i11n.json'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(bag, locale)
  return { title: copy.metadata.title }
}

export default async function DashboardGroupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const hasSession = await getHasAuthSession()
  return (
    <AccountAuthGate>
      <AccountShell hasSession={hasSession}>{children}</AccountShell>
    </AccountAuthGate>
  )
}
