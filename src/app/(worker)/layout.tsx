import { AppShell } from '@/ui/AppShell'

export default function WorkerLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <AppShell>{children}</AppShell>
}
