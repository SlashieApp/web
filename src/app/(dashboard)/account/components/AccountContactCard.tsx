'use client'

import { LuPhone } from 'react-icons/lu'

import { ContactMethodsPanel } from '@/app/(dashboard)/components/ContactMethodsPanel'
import { DashboardSectionCard } from '@/app/(dashboard)/components/DashboardSectionCard'

export function AccountContactCard() {
  return (
    <DashboardSectionCard
      title="Contact methods"
      description="Verify a contact method to unlock it as a default on your profile and to become a worker."
      icon={<LuPhone size={18} aria-hidden />}
    >
      <ContactMethodsPanel showIntro={false} />
    </DashboardSectionCard>
  )
}
