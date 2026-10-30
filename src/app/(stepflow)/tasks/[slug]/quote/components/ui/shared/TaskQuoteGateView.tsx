'use client'

import type { ReactNode } from 'react'

import { Box } from '@chakra-ui/react'
import { LuArrowLeft } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { FormHeader, FormStack, Link } from '@ui'

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
      display="flex"
      alignItems="center"
      gap={1}
      w="fit-content"
      // 24 to the header, as the column's gap was.
      mb={6}
      _hover={{ textDecoration: 'none', color: 'text.link' }}
    >
      <LuArrowLeft size={16} aria-hidden />
      {backLabel}
    </Link>
  )
}

/**
 * A gate in front of the quote form (signed out, no worker profile, limit
 * reached, email to verify). Form spacing (FE-481): the header is the title,
 * the description 8 under it, then 24 to the first block; the summary card and
 * the action are one form column, 20 apart.
 */
export function TaskQuoteGateView({
  title,
  description,
  children,
  backHref,
}: TaskQuoteGateViewProps) {
  return (
    <Box
      flex={1}
      px={{ base: 4, md: 8 }}
      py={{ base: 6, md: 10 }}
      maxW="lg"
      mx="auto"
      w="full"
    >
      {backHref ? <BackToTaskLink href={backHref} /> : null}
      <FormHeader title={title} description={description} />
      <FormStack>{children}</FormStack>
    </Box>
  )
}
