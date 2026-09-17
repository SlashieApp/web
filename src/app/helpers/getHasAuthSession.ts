import { cookies } from 'next/headers'

import { AUTH_COOKIE_NAME } from '@/utils/authCookie'

/** True when the request already has a session cookie (SSR). */
export async function getHasAuthSession() {
  const store = await cookies()
  return Boolean(store.get(AUTH_COOKIE_NAME)?.value?.trim())
}
