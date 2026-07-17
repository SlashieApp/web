'use client'

import { Badge, type UiBadgeProps } from '@ui'

/** Task lifecycle status → Badge family (always renders a dot + label). */
export type TaskStatusValue = 'OPEN' | 'AWARDED' | 'CLOSED' | 'CANCELLED'

const taskStatusMap: Record<
  TaskStatusValue,
  { family: NonNullable<UiBadgeProps['variant']>; label: string }
> = {
  OPEN: { family: 'success', label: 'Open' },
  AWARDED: { family: 'warning', label: 'Awarded' },
  CLOSED: { family: 'info', label: 'Closed' },
  CANCELLED: { family: 'danger', label: 'Cancelled' },
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
  const { family, label: defaultLabel } = taskStatusMap[status]
  return (
    <Badge variant={family} dot shape="pill" {...props}>
      {label ?? defaultLabel}
    </Badge>
  )
}
