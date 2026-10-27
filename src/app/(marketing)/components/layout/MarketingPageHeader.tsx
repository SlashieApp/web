'use client'

import { useI11n } from '@/i18n/useI11n'
import { useGoBack } from '@/utils/goBack'
import { StickyHeader, type StickyHeaderProps } from '@ui'

import chromeMessages from '../../i11n.chrome.json'

/** The marketing header's 56 / 64px row plus its 1px border above and below. */
const MARKETING_HEADER_H = { base: '58px', md: '66px' } as const

type MarketingPageHeaderProps = Pick<
  StickyHeaderProps,
  'title' | 'description' | 'contentMaxW'
> & {
  /** `largeTitle` is the page's h1; `inlineTitle` when the page draws its own. */
  variant: 'largeTitle' | 'inlineTitle'
}

/**
 * The iPhone title bar (FE-420) for the public pages: it sticks under the
 * marketing header. Back goes to the page before, or when this page was opened
 * straight away to Search (signed in) or the marketing home (a visitor).
 */
export function MarketingPageHeader({
  title,
  description,
  contentMaxW,
  variant,
}: MarketingPageHeaderProps) {
  const t = useI11n(chromeMessages)
  const onBack = useGoBack()

  return (
    <StickyHeader
      variant={variant}
      title={title}
      description={description}
      onBack={onBack}
      backAriaLabel={t.goBack}
      stickyTop={MARKETING_HEADER_H}
      contentMaxW={contentMaxW}
    />
  )
}
