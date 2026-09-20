'use client'

import { useI11n } from '@/i18n/useI11n'
import { Badge, type UiBadgeProps } from '@ui'
import bag from '../../i11n.json'

/** Task lifecycle status → Badge family (always renders a dot + label). */
export type TaskStatusValue = 'OPEN' | 'AWARDED' | 'CLOSED' | 'CANCELLED'

const taskStatusFamily: Record<
  TaskStatusValue,
  NonNullable<UiBadgeProps['variant']>
> = {
  OPEN: 'success',
  AWARDED: 'warning',
  CLOSED: 'info',
  CANCELLED: 'danger',
}

export type TaskStatusPillProps = Omit<
  UiBadgeProps,
  'variant' | 'dot' | 'children'
> & {
  status: TaskStatusValue
  label?: string
}

/** Route-scoped status chip; composes the universal `Badge` primitive. */
export function TaskStatusPill({
  status,
  label,
  ...props
}: TaskStatusPillProps) {
  const t = useI11n(bag)
  const family = taskStatusFamily[status]
  const defaultLabel = t.statusPill[status]
  return (
    <Badge variant={family} dot shape="pill" {...props}>
      {label ?? defaultLabel}
    </Badge>
  )
}
