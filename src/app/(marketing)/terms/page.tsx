import type { Metadata } from 'next'

import { LegalPageLayout } from '@/app/(marketing)/components/LegalPageLayout'
import { TERMS_DOCUMENT } from '@/content/legal/terms'
import { Footer } from '@/ui'

export const metadata: Metadata = {
  title: `${TERMS_DOCUMENT.title} | Slashie`,
  description: TERMS_DOCUMENT.description,
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <>
      <LegalPageLayout document={TERMS_DOCUMENT} />
      <Footer variant="minimal" />
    </>
  )
}
