'use client'

import { Box } from '@chakra-ui/react'

import { ProgressBar } from '@ui'

import { useWorkerSetup } from '../context/WorkerSetupProvider'
import { stepCaption } from '../helpers/workerSetupSteps.config'

export function WorkerSetupProgressBar() {
  const { activeSubStep, progressPercent: percent } = useWorkerSetup()

  return (
    <Box
      w="full"
      px={{ base: 4, md: 6 }}
      py={3}
      bg="bg.surface"
      borderBottomWidth="1px"
      borderColor="border.default"
    >
      <ProgressBar
        value={percent}
        label={stepCaption(activeSubStep)}
        trackLabel="Worker setup progress"
      />
    </Box>
  )
}
