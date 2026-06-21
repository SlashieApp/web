'use client'

import type { ReactNode } from 'react'

import { Stack, Text } from '@chakra-ui/react'
import { LuArrowLeft } from 'react-icons/lu'

import { Link } from '@ui'

type TaskQuoteGateViewProps = {
  title: string
  description: string
  children: ReactNode
  backHref?: string
}

function BackToTaskLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      fontSize="sm"
      fontWeight={600}
      color="secondary.600"
      display="inline-flex"
      alignItems="center"
      gap={1}
      w="fit-content"
      _hover={{ textDecoration: 'none', color: 'secondary.700' }}
    >
      <LuArrowLeft size={16} aria-hidden />
      Back to task
    </Link>
  )
}

export function TaskQuoteGateView({
  title,
  description,
  children,
  backHref,
}: TaskQuoteGateViewProps) {
  return (
    <Stack
      gap={6}
      flex={1}
      px={{ base: 4, md: 8 }}
      py={{ base: 6, md: 10 }}
      maxW="lg"
      mx="auto"
      w="full"
    >
      {backHref ? <BackToTaskLink href={backHref} /> : null}
      <Stack gap={1}>
        <Text
          as="h1"
          fontSize={{ base: '2xl', md: '3xl' }}
          fontWeight={800}
          color="neutral.900"
        >
          {title}
        </Text>
        <Text color="formLabelMuted">{description}</Text>
      </Stack>
      {children}
    </Stack>
  )
}
