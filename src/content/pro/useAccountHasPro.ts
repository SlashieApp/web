'use client'

import { useUserStore } from '@/app/(auth)/store/user'

import { accountHasPro } from './accountPro'

/** The signed-in account's Slashie Pro (`accountHasPro`), from the user store. False for a guest. */
export function useAccountHasPro(): boolean {
  return useUserStore((state) => accountHasPro(state.me))
}
