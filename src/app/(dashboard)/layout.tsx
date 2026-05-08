import type { Metadata } from 'next'

import { AccountAuthGate } from './components/AccountAuthGate'
import { AccountShell } from './components/AccountShell'

export const metadata: Metadata = {
  title: 'Dashboard · Slashie',
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
