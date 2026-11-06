'use client'

import { useI11n } from '@/i18n/useI11n'
import { Badge, type UiBadgeProps } from '@ui'

import bag from '../i11n.json'

export type TaskRolePillProps = Omit<
  UiBadgeProps,
  'variant' | 'dot' | 'children'
> & {
  /** You posted the task (Hosted), or you quoted on it (Quoted). */
  role: 'hosted' | 'quoted'
}

/** The task card's role pill, shared by the search card and My Tasks rows. */
export function TaskRolePill({ role, ...props }: TaskRolePillProps) {
  const t = useI11n(bag)
  return (
    <Badge shape="pill" variant="neutral" {...props}>
      {t.viewerRole[role]}
    </Badge>
  )
}
