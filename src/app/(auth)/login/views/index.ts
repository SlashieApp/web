import { checkingSession } from './checkingSession'
import { rateLimited } from './rateLimited'
import { securityCheck } from './securityCheck'
import { signIn } from './signIn'
import type { LoginView, LoginViewConfig } from './types'

export const LOGIN_VIEWS: Record<LoginView, LoginViewConfig> = {
  checkingSession,
  signIn,
  securityCheck,
  rateLimited,
}

export { getLoginView, loginMessageFor } from './getLoginView'
export type { LoginViewInput } from './getLoginView'
export type {
  LoginMessage,
  LoginPrimaryAction,
  LoginView,
  LoginViewConfig,
} from './types'
