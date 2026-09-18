'use client'

import { type ReactNode, createContext, useContext } from 'react'

import { EMPTY_LOGIN_AUTOFILL, type LoginAutofill } from './loginAutofill'

const LoginAutofillContext = createContext<LoginAutofill>(EMPTY_LOGIN_AUTOFILL)

export function LoginAutofillProvider({
  value,
  children,
}: {
  value: LoginAutofill
  children: ReactNode
}) {
  return (
    <LoginAutofillContext.Provider value={value}>
      {children}
    </LoginAutofillContext.Provider>
  )
}

export function useLoginAutofill(): LoginAutofill {
  return useContext(LoginAutofillContext)
}
