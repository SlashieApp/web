import { AppShell } from '@/ui/AppShell'

export default function TaskLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <AppShell>{children}</AppShell>
}
