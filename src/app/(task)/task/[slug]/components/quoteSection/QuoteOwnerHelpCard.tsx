'use client'

import { Link, Stack, Text } from '@chakra-ui/react'

import { SectionCard } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'

export function QuoteOwnerHelpCard() {
  const { isOwner } = useTaskDetail()
  if (!isOwner) return null

  return (
    <SectionCard
      p={6}
      borderWidth={0}
      bg="linear-gradient(160deg, #03225a 0%, #012b73 55%, #00358f 100%)"
      header={
        <Stack gap={1}>
          <Text
            fontSize="xs"
            fontWeight={700}
            color="whiteAlpha.800"
            letterSpacing="0.06em"
            textTransform="uppercase"
          >
            Support
          </Text>
          <Text fontSize="md" fontWeight={700} color="white">
            Need help?
          </Text>
        </Stack>
      }
      bodyGap={4}
    >
      <Text fontSize="sm" color="whiteAlpha.900" lineHeight="tall">
        Our team can help with quotes, payments, or disputes.
      </Text>
      <Link
        href="mailto:support@slashie.app"
        alignSelf="flex-start"
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        px={4}
        py={2}
        borderRadius="lg"
        fontSize="sm"
        fontWeight={700}
        fontFamily="heading"
        bg="white"
        color="primary.800"
        textDecoration="none"
        _hover={{ bg: 'primary.50', textDecoration: 'none' }}
      >
        Chat with support
      </Link>
    </SectionCard>
  )
}
