'use client'

import type { ReactNode } from 'react'

import { LuArrowLeft } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { FormStack, Link, StatusCard } from '@ui'

import bag from '../../../i11n.json'

type TaskQuoteGateViewProps = {
  title: string
  description: string
  children: ReactNode
  backHref?: string
}

function BackToTaskLink({ href }: { href: string }) {
  const backLabel = useI11n(bag).gate.backToTask
  return (
    <Link
      href={href}
      fontSize="sm"
      fontWeight={500}
      color="text.link"
      display="inline-flex"
      alignItems="center"
      gap={1}
      // A 44px target; the text stays 24 above the title, as before: the
      // card's 24 gap less the 12 the taller box adds under the text.
      minH="44px"
      mb={-3}
      _hover={{ textDecoration: 'none', color: 'text.link' }}
    >
      <LuArrowLeft size={16} aria-hidden />
      {backLabel}
    </Link>
  )
}

/**
 * A gate in front of the quote form (signed out, no worker profile, limit
 * reached, email to verify): the centred status card every gate uses (R6,
 * 448), on a page of its own. The way back to the task is the first line of
 * the card, left-aligned and 24 above the title, as it was above the form and
 * as the app has it. The card is the title, the description 8 under it, then
 * 24 to the first block; the summary card and the action are one form column,
 * 20 apart.
 */
export function TaskQuoteGateView({
  title,
  description,
  children,
  backHref,
}: TaskQuoteGateViewProps) {
  return (
    <StatusCard
      fullPage
      title={title}
      body={description}
      actions={<FormStack>{children}</FormStack>}
      back={backHref ? <BackToTaskLink href={backHref} /> : undefined}
    />
  )
}
