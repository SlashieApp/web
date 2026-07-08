import { notFound } from 'next/navigation'

import { WorkerProfileProvider } from './context/WorkerProfileContext'
import { getWorkerForPublicPage } from './helpers/getWorkerForPublicPage'

export default async function WorkerProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { worker } = await getWorkerForPublicPage(slug)

  if (!worker) notFound()

  return (
    <WorkerProfileProvider worker={worker}>{children}</WorkerProfileProvider>
  )
}
