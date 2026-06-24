'use client'

import { Box, HStack, Text } from '@chakra-ui/react'
import { LuArrowLeft, LuArrowRight } from 'react-icons/lu'

import { Button } from '@ui'

type WorkerSetupStepActionsProps = {
  showBack?: boolean
  continueLabel?: string
  continueLoading?: boolean
  onBack?: () => void
  onContinue?: () => void
  sticky?: boolean
}

export function WorkerSetupStepActions({
  showBack = false,
  continueLabel = 'Continue',
  continueLoading = false,
  onBack,
  onContinue,
  sticky = false,
}: WorkerSetupStepActionsProps) {
  return (
    <Box
      borderTopWidth="1px"
      borderColor="neutral.300"
      bg="bg.surface"
      px={{ base: 4, md: 8, lg: 10 }}
      py={4}
      position={sticky ? 'sticky' : 'static'}
      bottom={0}
      zIndex={2}
      flexShrink={0}
      pb={{ base: 'calc(16px + env(safe-area-inset-bottom))', lg: 4 }}
    >
      <HStack justify="space-between" gap={3} w="full" align="center">
        {showBack ? (
          <Button
            type="button"
            variant="ghost"
            color="text.link"
            fontWeight={600}
            px={0}
            minH="44px"
            onClick={onBack}
            _hover={{ bg: 'transparent', color: 'action.primaryHover' }}
          >
            <HStack gap={2}>
              <LuArrowLeft size={18} aria-hidden />
              <span>Back</span>
            </HStack>
          </Button>
        ) : (
          <Box flexShrink={0} w={{ base: 0, lg: '88px' }} />
        )}
        <Button
          type="button"
          variant="primary"
          onClick={onContinue}
          loading={continueLoading}
          minH="44px"
          minW={{ base: 'full', lg: 'auto' }}
          flex={{ base: 1, lg: 'none' }}
          ml="auto"
          borderRadius="md"
          px={6}
        >
          <HStack gap={2}>
            <span>{continueLabel}</span>
            {continueLabel !== 'Start quoting' ? (
              <LuArrowRight size={18} aria-hidden />
            ) : null}
          </HStack>
        </Button>
      </HStack>
    </Box>
  )
}
