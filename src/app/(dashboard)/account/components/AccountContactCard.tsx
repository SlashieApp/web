'use client'

import { LuPhone } from 'react-icons/lu'

import { ContactMethodsPanel } from '@/app/(dashboard)/components/account/ContactMethodsPanel'
import { DashboardSectionCard } from '@/app/(dashboard)/components/layout/DashboardSectionCard'
import { useI11n } from '@/i18n/useI11n'

import bag from '../i11n.json'

export function AccountContactCard() {
  const t = useI11n(bag)
  return (
    <DashboardSectionCard
      title={t.contactTitle}
      description={t.contactDescription}
      icon={<LuPhone size={18} aria-hidden />}
    >
      <ContactMethodsPanel showIntro={false} />
    </DashboardSectionCard>
  )
}
