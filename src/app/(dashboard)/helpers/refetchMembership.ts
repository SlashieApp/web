import type { ApolloClient } from '@apollo/client'

import type { MeSnapshot } from '@/app/(auth)/store/user'
import { syncMembershipFromStripe } from '@/app/(dashboard)/billing/helpers/syncMembership'

import type { WorkerMembershipSnapshot } from './workerMembershipHelpers'

type RefetchMembershipResult = {
  me: MeSnapshot | null
  membership: WorkerMembershipSnapshot | null
}

/** Network refresh of membership via Stripe sync + `me` / `myWorkerBilling`. */
export async function refetchMembershipState(
  apolloClient: ApolloClient,
  setMe: (me: MeSnapshot | null) => void,
): Promise<RefetchMembershipResult> {
  return syncMembershipFromStripe(apolloClient, setMe)
}
