import type { OrderItem } from '@/utils/orderHelpers'
import { orderPartyRole, sortOrdersBySchedule } from '@/utils/orderHelpers'

export type DashboardUpcomingJob = {
  id: string
  order: OrderItem
  role: 'Customer' | 'Worker'
}

export function greetingForNow(now = new Date()): string {
  const hour = now.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function displayNameFromMe(
  me: {
    profile?: { name?: string | null } | null
    email?: string | null
  } | null,
): string {
  return me?.profile?.name?.trim() || me?.email?.split('@')[0] || 'there'
}

export function buildUpcomingJobs(
  activeOrders: readonly OrderItem[],
  userId: string | undefined,
): DashboardUpcomingJob[] {
  if (!userId) return []
  return sortOrdersBySchedule([...activeOrders]).map((order) => ({
    id: order.id,
    order,
    role: orderPartyRole(order, userId) === 'customer' ? 'Customer' : 'Worker',
  }))
}

export type DashboardQuickAction = {
  key: string
  title: string
  subtitle: string
  href: string
  kind: 'post' | 'browse' | 'requests' | 'quotes' | 'profile'
}

export function buildQuickActions(
  hasWorkerProfile: boolean,
): DashboardQuickAction[] {
  return [
    {
      key: 'post',
      title: 'Post a task',
      subtitle: 'Get quotes from local workers',
      href: '/tasks/create',
      kind: 'post',
    },
    {
      key: 'browse',
      title: 'Browse tasks',
      subtitle: 'Find work and send quotes',
      href: '/search',
      kind: 'browse',
    },
    {
      key: 'requests',
      title: 'My requests',
      subtitle: 'Track posted tasks and quotes',
      href: '/requests',
      kind: 'requests',
    },
    {
      key: 'quotes',
      title: 'My Quotes',
      subtitle: 'Track quotes you sent on tasks',
      href: '/quotes',
      kind: 'quotes',
    },
    {
      key: 'profile',
      title: 'Complete profile',
      subtitle: hasWorkerProfile
        ? 'Keep your worker profile fresh'
        : 'Set up your worker profile',
      href: '/profile',
      kind: 'profile',
    },
  ]
}
