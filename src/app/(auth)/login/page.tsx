import { getHasAuthSession } from '@/app/helpers/getHasAuthSession'

import { LoginScreen } from './components/LoginScreen'

/** A saved session starts on the session check, so the form never flashes. */
export default async function LoginPage() {
  return <LoginScreen hasSession={await getHasAuthSession()} />
}
