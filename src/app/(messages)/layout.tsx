import { AccountAuthGate } from '@/app/(dashboard)/components/layout/AccountAuthGate'
import { getHasAuthSession } from '@/app/helpers/getHasAuthSession'
import { AppShell } from '@/ui/AppShell'

/**
 * Messages (FE-202): signed-in only, app chrome without the account-hub
 * container or footer, so the inbox and thread fill the screen.
 */
export default async function MessagesGroupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const hasSession = await getHasAuthSession()
  return (
    <AccountAuthGate>
      <AppShell hasSession={hasSession} bg="bg.subtle" color="text.default">
        {children}
      </AppShell>
    </AccountAuthGate>
  )
}
