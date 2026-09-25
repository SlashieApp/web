import { redirect } from 'next/navigation'

import { getRequestLocale } from '@/i18n/getRequestLocale'
import { withLocale } from '@/i18n/navigation'

import { TaskDetailScreen } from './components/layout/TaskDetailScreen'

export default async function TaskDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ review?: string; orderId?: string }>
}) {
  const { slug } = await params
  const query = await searchParams
  if (query.review === '1') {
    const locale = await getRequestLocale()
    const orderId = query.orderId?.trim()
    const path = `/tasks/${slug}/review${
      orderId ? `?orderId=${encodeURIComponent(orderId)}` : ''
    }`
    redirect(withLocale(locale, path))
  }

  return <TaskDetailScreen taskId={slug} />
}
