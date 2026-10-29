'use client'

import { LuScale, LuShieldCheck } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import footerMessages from '@/ui/Footer/i11n.json'

import { Eyebrow } from './MarketingFrame'

/**
 * The footer's column each public policy page sits in: the legal documents
 * under "Legal", the safety guide under "Support".
 */
export type LegalColumn = 'legal' | 'support'

const ICONS = { legal: LuScale, support: LuShieldCheck } as const

/**
 * The eyebrow over a policy page's title (tone refresh, train 2): the footer's
 * own column name ("Legal", "Support"; today's strings, in both languages) with
 * a small green 600 icon, so no new string is needed.
 */
export function LegalEyebrow({ column }: { column: LegalColumn }) {
  const t = useI11n(footerMessages)
  return <Eyebrow icon={ICONS[column]}>{t.columns[column]}</Eyebrow>
}
