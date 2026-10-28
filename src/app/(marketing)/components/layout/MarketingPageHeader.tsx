'use client'

import type { ReactNode } from 'react'

import { useI11n } from '@/i18n/useI11n'
import { useGoBack } from '@/utils/goBack'
import { StickyHeader, type StickyHeaderProps } from '@ui'

import chromeMessages from '../../i11n.chrome.json'

/** The marketing header's 56 / 64px row plus its 1px border above and below. */
const MARKETING_HEADER_H = { base: '58px', md: '66px' } as const

type MarketingPageHeaderProps = Pick<
  StickyHeaderProps,
  'description' | 'contentMaxW'
> & {
  title: string
  /** The page under the title. */
  children: ReactNode
}

/**
 * The page header (FE-458) for the public pages, its big title the page's h1:
 * the bar sticks under the marketing header and the title collapses into it
 * on scroll. Back goes to the page before, or when this page was opened
 * straight away to Search (signed in) or the marketing home (a visitor).
 */
export function MarketingPageHeader({
  title,
  description,
  contentMaxW,
  children,
}: MarketingPageHeaderProps) {
  const t = useI11n(chromeMessages)
  const onBack = useGoBack()

  return (
    <StickyHeader
      title={title}
      description={description}
      onBack={onBack}
      backAriaLabel={t.goBack}
      stickyTop={MARKETING_HEADER_H}
      contentMaxW={contentMaxW}
    >
      {children}
    </StickyHeader>
  )
}
