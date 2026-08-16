import { TaskSegmentChrome } from './TaskSegmentChrome'

export default function TaskLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <TaskSegmentChrome>{children}</TaskSegmentChrome>
}
