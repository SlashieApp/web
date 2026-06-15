import { WorkerRouteChrome } from './WorkerRouteChrome'

export default function WorkerLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <WorkerRouteChrome>{children}</WorkerRouteChrome>
}
