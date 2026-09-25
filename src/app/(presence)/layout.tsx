import { getHasAuthSession } from '@/app/helpers/getHasAuthSession'
import { AppShell } from '@/ui/AppShell'

export default async function PresenceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const hasSession = await getHasAuthSession()
  return <AppShell hasSession={hasSession}>{children}</AppShell>
}
