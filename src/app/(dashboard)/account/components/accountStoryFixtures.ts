import type { ApolloClient } from '@apollo/client/core'

import WebPushVapidPublicKey from '@/app/(dashboard)/account/graphql/WebPushVapidPublicKey.graphql'

/** A placeholder VAPID public key: the real one comes from the API. */
export const STORY_VAPID_KEY =
  'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'

/**
 * Seeds the VAPID query for the Browser notifications switch: a key means the
 * server can push, `null` means push is not configured.
 */
export function seedVapidKey(key: string | null) {
  return (client: ApolloClient) => {
    client.writeQuery({
      query: WebPushVapidPublicKey,
      data: { webPushVapidPublicKey: key },
    })
  }
}
