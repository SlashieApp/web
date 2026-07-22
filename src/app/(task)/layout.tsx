import { TaskRouteChrome } from './TaskRouteChrome'

export default function TaskLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <TaskRouteChrome>{children}</TaskRouteChrome>
}
