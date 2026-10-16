'use client'

import { LuPhone } from 'react-icons/lu'

import { DashboardSectionCard } from '@/app/(dashboard)/components/layout/DashboardSectionCard'
import { ContactRows } from '@/app/(dashboard)/components/ui/contact/ContactRows'
import { useI11n } from '@/i18n/useI11n'

import bag from '../../i11n.json'

/** Contact: the email and phone rows (`ContactRows`). */
export function AccountContactCard({
  readOnly = false,
}: { readOnly?: boolean }) {
  const t = useI11n(bag)
  return (
    <DashboardSectionCard
      id="contact"
      title={t.contactTitle}
      description={t.contactDescription}
      icon={<LuPhone size={18} aria-hidden />}
    >
      <ContactRows readOnly={readOnly} />
    </DashboardSectionCard>
  )
}
