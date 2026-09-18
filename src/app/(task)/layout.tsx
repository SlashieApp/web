import { getHasAuthSession } from '@/app/helpers/getHasAuthSession'
import { AppShell } from '@/ui/AppShell'

import { MarketplaceMapHost } from './context/MarketplaceMapSession'

export default async function TaskLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const hasSession = await getHasAuthSession()
  return (
    <AppShell hasSession={hasSession}>
      <MarketplaceMapHost>{children}</MarketplaceMapHost>
    </AppShell>
  )
}
