import type { OrderItem } from '@/utils/orderHelpers'
import { orderPartyRole, sortOrdersBySchedule } from '@/utils/orderHelpers'

export type DashboardUpcomingJob = {
  id: string
  order: OrderItem
  roleKey: 'customer' | 'worker'
}

export type DashboardGreetingCopy = {
  morning: string
  afternoon: string
  evening: string
  fallbackName: string
}

export function greetingForNow(
  copy: DashboardGreetingCopy,
  now = new Date(),
): string {
  const hour = now.getHours()
  if (hour < 12) return copy.morning
  if (hour < 18) return copy.afternoon
  return copy.evening
}

export function displayNameFromMe(
  me: {
    profile?: { name?: string | null } | null
    email?: string | null
  } | null,
  fallbackName: string,
): string {
  return me?.profile?.name?.trim() || me?.email?.split('@')[0] || fallbackName
}

export function buildUpcomingJobs(
  activeOrders: readonly OrderItem[],
  userId: string | undefined,
): DashboardUpcomingJob[] {
  if (!userId) return []
  return sortOrdersBySchedule([...activeOrders]).map((order) => ({
    id: order.id,
    order,
    roleKey:
      orderPartyRole(order, userId) === 'customer' ? 'customer' : 'worker',
  }))
}

export type DashboardQuickAction = {
  key: string
  title: string
  subtitle: string
  href: string
  kind: 'post' | 'browse' | 'requests' | 'quotes' | 'profile'
}

export type DashboardQuickActionsCopy = {
  postTitle: string
  postSubtitle: string
  browseTitle: string
  browseSubtitle: string
  requestsTitle: string
  requestsSubtitle: string
  quotesTitle: string
  quotesSubtitle: string
  profileTitle: string
  profileSubtitleWorker: string
  profileSubtitleCustomer: string
}

export function buildQuickActions(
  hasWorkerProfile: boolean,
  copy: DashboardQuickActionsCopy,
): DashboardQuickAction[] {
  return [
    {
      key: 'post',
      title: copy.postTitle,
      subtitle: copy.postSubtitle,
      href: '/tasks/create',
      kind: 'post',
    },
    {
      key: 'browse',
      title: copy.browseTitle,
      subtitle: copy.browseSubtitle,
      href: '/search',
      kind: 'browse',
    },
    {
      key: 'requests',
      title: copy.requestsTitle,
      subtitle: copy.requestsSubtitle,
      href: '/requests',
      kind: 'requests',
    },
    {
      key: 'quotes',
      title: copy.quotesTitle,
      subtitle: copy.quotesSubtitle,
      href: '/quotes',
      kind: 'quotes',
    },
    {
      key: 'profile',
      title: copy.profileTitle,
      subtitle: hasWorkerProfile
        ? copy.profileSubtitleWorker
        : copy.profileSubtitleCustomer,
      href: '/profile',
      kind: 'profile',
    },
  ]
}
