'use client'

import { useApolloClient } from '@apollo/client/react'
import type { CheckPromoCodeQuery } from '@codegen/schema'
import { useCallback, useState } from 'react'

import CheckPromoCode from '../graphql/CheckPromoCode.gql'
import {
  type PromoCheck,
  type PromoProblem,
  normalizePromoCode,
  promoProblemFromCheck,
  promoProblemFromError,
} from './promoCode'

export type PromoCodeControl = {
  /** "Have a code?" was tapped: the field shows. */
  open: boolean
  setOpen: (open: boolean) => void
  text: string
  setText: (text: string) => void
  /** A code that works, shown as the applied line. */
  applied: PromoCheck | null
  problem: PromoProblem | null
  checking: boolean
  apply: () => Promise<void>
  remove: () => void
  /**
   * The code to start Checkout with: the applied one; a typed one is checked
   * first. `false` when the typed code can't be used: stay on the page, its
   * problem shows under the field.
   */
  codeForCheckout: () => Promise<string | null | false>
  /** Checkout refused the code (it ran out, say): show why under the field. */
  refuse: (problem: PromoProblem) => void
}

/** The "Have a code?" field's state (FE-586, decided by Ryan 21 Nov). */
export function usePromoCode(): PromoCodeControl {
  const apollo = useApolloClient()
  const [open, setOpen] = useState(false)
  const [text, setTextState] = useState('')
  const [applied, setApplied] = useState<PromoCheck | null>(null)
  const [problem, setProblem] = useState<PromoProblem | null>(null)
  const [checking, setChecking] = useState(false)

  const setText = useCallback((next: string) => {
    setTextState(next)
    setProblem(null)
  }, [])

  const check = useCallback(
    async (raw: string): Promise<PromoCheck | null> => {
      const code = normalizePromoCode(raw)
      if (!code) return null
      setChecking(true)
      setProblem(null)
      try {
        const { data } = await apollo.query<CheckPromoCodeQuery>({
          query: CheckPromoCode,
          variables: { code },
          fetchPolicy: 'network-only',
        })
        const result = data?.checkPromoCode
        if (!result) throw new Error('No check')
        if (result.valid) {
          setApplied(result)
          setTextState('')
          return result
        }
        setProblem(promoProblemFromCheck(result))
        return null
      } catch (err) {
        setProblem(promoProblemFromError(err) ?? 'FAILED')
        return null
      } finally {
        setChecking(false)
      }
    },
    [apollo],
  )

  const apply = useCallback(async () => {
    await check(text)
  }, [check, text])

  const remove = useCallback(() => {
    setApplied(null)
    setProblem(null)
  }, [])

  const codeForCheckout = useCallback(async () => {
    if (applied) return applied.code
    if (!normalizePromoCode(text)) return null
    const result = await check(text)
    return result ? result.code : false
  }, [applied, check, text])

  const refuse = useCallback(
    (next: PromoProblem) => {
      if (applied) setTextState(applied.code)
      setApplied(null)
      setOpen(true)
      setProblem(next)
    },
    [applied],
  )

  return {
    open,
    setOpen,
    text,
    setText,
    applied,
    problem,
    checking,
    apply,
    remove,
    codeForCheckout,
    refuse,
  }
}
