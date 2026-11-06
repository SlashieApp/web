'use client'

import { useI11n } from '@/i18n/useI11n'
import { useGoBack } from '@/utils/goBack'
import { PageLayout, type PageLayoutProps } from '@ui'

import bag from '../../i11n.json'

/** `Omit` that keeps each member of a union (a plain `Omit` would merge them). */
type OmitEach<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never

/**
 * The props of `PageLayout` (and so its rules: only a `wide` page takes a
 * `sidebar`), less Back and its label, which are wired here.
 */
export type DashboardPageLayoutProps = OmitEach<
  PageLayoutProps,
  'onBack' | 'backAriaLabel'
>

/**
 * Page contract for the signed-in dashboard pages: `PageLayout` (`@ui`) with
 * Back wired to the page before and its label from this group's copy. The
 * page header (FE-458) starts on the logo line and spans the container; the
 * body is one readable column or the full width with a rail.
 */
export function DashboardPageLayout(props: DashboardPageLayoutProps) {
  const t = useI11n(bag)
  const onBack = useGoBack()

  return (
    <PageLayout {...props} onBack={onBack} backAriaLabel={t.page.backAria} />
  )
}
