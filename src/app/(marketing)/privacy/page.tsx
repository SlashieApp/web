import type { Metadata } from 'next'

import { LegalPageLayout } from '@/app/(marketing)/components/LegalPageLayout'
import { PRIVACY_DOCUMENT } from '@/content/legal/privacy'
import { Footer } from '@/ui'

export const metadata: Metadata = {
  title: `${PRIVACY_DOCUMENT.title} | Slashie`,
  description: PRIVACY_DOCUMENT.description,
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <>
      <LegalPageLayout document={PRIVACY_DOCUMENT} />
      <Footer variant="minimal" />
    </>
  )
}
