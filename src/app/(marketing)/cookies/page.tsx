import type { Metadata } from 'next'

import { LegalPageLayout } from '@/app/(marketing)/components/LegalPageLayout'
import { COOKIES_DOCUMENT } from '@/content/legal/cookies'
import { Footer } from '@/ui'

export const metadata: Metadata = {
  title: `${COOKIES_DOCUMENT.title} | Slashie`,
  description: COOKIES_DOCUMENT.description,
  alternates: { canonical: '/cookies' },
}

export default function CookiesPage() {
  return (
    <>
      <LegalPageLayout document={COOKIES_DOCUMENT} />
      <Footer variant="minimal" />
    </>
  )
}
