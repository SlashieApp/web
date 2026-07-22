/**
 * Shared dashboard chrome — import from subfolders or this barrel.
 */
export { AccountAuthGate } from './account/AccountAuthGate'
export { AccountShell } from './account/AccountShell'
export { ContactMethodsPanel } from './account/ContactMethodsPanel'
export { InboxActivityPanel } from './inbox/InboxActivityPanel'
export { InboxUpcomingEventRow } from './inbox/InboxUpcomingEventRow'
export { DashboardPageHeader } from './layout/DashboardPageHeader'
export { DashboardPageLayout } from './layout/DashboardPageLayout'
export {
  DashboardDetailRow,
  DashboardSectionCard,
} from './layout/DashboardSectionCard'
export { DashboardSectionNav } from './layout/DashboardSectionNav'
export { MembershipCancelNotice } from './membership/MembershipCancelNotice'
export { MembershipRefreshOnMount } from './membership/MembershipRefreshOnMount'
export { MembershipStatusBadge } from './membership/MembershipStatusBadge'
export { MembershipStatusDetail } from './membership/MembershipStatusDetail'
export { WorkerMembershipCard } from './membership/WorkerMembershipCard'
export { EmailVerificationModal } from './verification/EmailVerificationModal'
export { PhoneVerificationModal } from './verification/PhoneVerificationModal'
