'use client'

import { Box, Text } from '@chakra-ui/react'

import { useWorkerSetup } from '../context/WorkerSetupProvider'
import { stepCaption } from '../helpers/workerSetupSteps.config'

export function WorkerSetupProgressBar() {
  const { activeSubStep, progressPercent: percent } = useWorkerSetup()

  return (
    <Box
      w="full"
      px={{ base: 4, md: 6 }}
      py={3}
      bg="white"
      borderBottomWidth="1px"
      borderColor="cardBorder"
    >
      <Box
        h="4px"
        borderRadius="full"
        bg="neutral.200"
        overflow="hidden"
        mb={2}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Worker setup progress"
      >
        <Box
          h="full"
          w={`${percent}%`}
          bg="primary.600"
          transition="width 0.2s ease"
        />
      </Box>
      <Text fontSize="xs" fontWeight={600} color="formLabelMuted">
        {stepCaption(activeSubStep)}
      </Text>
    </Box>
  )
}
