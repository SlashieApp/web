'use client'

import type { ReactNode, Ref } from 'react'

import { useI11n } from '@/i18n/useI11n'
import { useGoBack } from '@/utils/goBack'
import { PageLayout } from '@ui'

import bag from '../../i11n.json'

export type DashboardPageLayoutProps = {
  /** The h1: the same words as the menu item and the browser tab. */
  title: string
  /** One short line under the title. */
  description?: ReactNode
  /** Between the header and the body (hero, notices). */
  afterHeader?: ReactNode
  /**
   * `narrow`: one readable column (45rem), left-aligned on the logo line (R3).
   * `wide`: the page width, with an optional rail (R4).
   */
  width?: 'narrow' | 'wide'
  /** Rail beside the body on large screens; stacks under it on phones. */
  sidebar?: ReactNode
  /** When false, the rail is desktop-only (default true). */
  sidebarOnMobile?: boolean
  rootRef?: Ref<HTMLDivElement>
  children: ReactNode
}

/**
 * Page contract for the signed-in dashboard pages: `PageLayout` (`@ui`) with
 * Back wired to the page before and its label from this group's copy. The
 * page header (FE-458) starts on the logo line and spans the container; the
 * body is one readable column or the full width with a rail.
 */
export function DashboardPageLayout({
  width = 'narrow',
  ...props
}: DashboardPageLayoutProps) {
  const t = useI11n(bag)
  const onBack = useGoBack()

  return (
    <PageLayout
      {...props}
      width={width === 'narrow' ? 'column' : 'wide'}
      onBack={onBack}
      backAriaLabel={t.page.backAria}
    />
  )
}
