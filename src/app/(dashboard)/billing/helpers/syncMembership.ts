import type { ApolloClient } from '@apollo/client'
import type { MeQuery, SyncWorkerBillingMutation } from '@codegen/schema'

import type { MeSnapshot } from '@/app/(auth)/store/user'
import MyWorkerBilling from '@/app/(dashboard)/billing/graphql/MyWorkerBilling.gql'
import SyncWorkerBilling from '@/app/(dashboard)/billing/graphql/SyncWorkerBilling.gql'
import Me from '@/graphql/Me.gql'

import type { WorkerMembershipSnapshot } from '../../helpers/workerMembershipHelpers'

type SyncMembershipResult = {
  me: MeSnapshot | null
  membership: WorkerMembershipSnapshot | null
}

export function mergeMembershipIntoMe(
  me: MeSnapshot | null,
  membership: WorkerMembershipSnapshot,
): MeSnapshot | null {
  if (!me?.worker) return me
  return {
    ...me,
    worker: {
      ...me.worker,
      membership,
    },
  }
}

/** Stripe sync mutation + network refresh of `me` and `myWorkerBilling`. */
export async function syncMembershipFromStripe(
  apolloClient: ApolloClient,
  setMe: (me: MeSnapshot | null) => void,
): Promise<SyncMembershipResult> {
  let membership: WorkerMembershipSnapshot | null = null

  try {
    const syncResult = await apolloClient.mutate<SyncWorkerBillingMutation>({
      mutation: SyncWorkerBilling,
    })
    membership = syncResult.data?.syncWorkerBilling ?? null
    if (membership) {
      const current = await apolloClient.query<MeQuery>({
        query: Me,
        fetchPolicy: 'cache-first',
      })
      const merged = mergeMembershipIntoMe(current.data?.me ?? null, membership)
      if (merged) setMe(merged)
    }
  } catch {
    // Fall through to full refetch when sync is unavailable or fails.
  }

  await apolloClient.refetchQueries({
    include: [Me, MyWorkerBilling],
  })

  const result = await apolloClient.query<MeQuery>({
    query: Me,
    fetchPolicy: 'network-only',
  })

  const me = result.data?.me ?? null
  if (me) setMe(me)

  return {
    me,
    membership: me?.worker?.membership ?? membership,
  }
}
