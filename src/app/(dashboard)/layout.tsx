import type { Metadata } from 'next'

import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n } from '@/i18n/loadPageI11n'

import { AccountAuthGate } from './components/AccountAuthGate'
import { AccountShell } from './components/AccountShell'
import bag from './i11n.json'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(bag, locale)
  return { title: copy.metadata.title }
}

export default function DashboardGroupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AccountAuthGate>
      <AccountShell>{children}</AccountShell>
    </AccountAuthGate>
  )
}
