'use client'

import type { ReactNode } from 'react'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { LuChevronDown, LuChevronRight } from 'react-icons/lu'

import { useWorkerSetup } from '../context/WorkerSetupProvider'
import {
  WORKER_SETUP_MAJOR_STEPS,
  type WorkerSetupSubStepId,
} from '../helpers/workerSetupSteps.config'

function StepNumber({
  active,
  complete,
  children,
}: {
  active: boolean
  complete: boolean
  children: ReactNode
}) {
  return (
    <Box
      boxSize="28px"
      borderRadius="full"
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontSize="sm"
      fontWeight={700}
      flexShrink={0}
      bg={active ? 'primary.600' : complete ? 'primary.100' : 'transparent'}
      color={active ? 'white' : complete ? 'primary.800' : 'formLabelMuted'}
      borderWidth={active || complete ? '0' : '1px'}
      borderColor="neutral.300"
    >
      {children}
    </Box>
  )
}

function SubStepDot({
  active,
  complete,
}: {
  active: boolean
  complete: boolean
}) {
  return (
    <Box
      boxSize="10px"
      borderRadius="full"
      flexShrink={0}
      bg={active ? 'primary.600' : complete ? 'primary.400' : 'transparent'}
      borderWidth={active || complete ? '0' : '2px'}
      borderColor="neutral.300"
    />
  )
}

export function WorkerSetupStepper() {
  const { activeSubStep, completedSubSteps, goToSubStep, isSubStepUnlocked } =
    useWorkerSetup()

  let activeMajorIndex = 0
  for (let i = 0; i < WORKER_SETUP_MAJOR_STEPS.length; i += 1) {
    if (
      WORKER_SETUP_MAJOR_STEPS[i].subSteps.some(
        (sub) => sub.id === activeSubStep,
      )
    ) {
      activeMajorIndex = i
      break
    }
  }

  return (
    <Stack gap={1} w="full" maxW="320px">
      {WORKER_SETUP_MAJOR_STEPS.map((major, majorIdx) => {
        const isActiveMajor = majorIdx === activeMajorIndex
        const isCompleteMajor = majorIdx < activeMajorIndex

        return (
          <Box key={major.id} w="full">
            <HStack gap={3} align="center" py={2}>
              <StepNumber active={isActiveMajor} complete={isCompleteMajor}>
                {majorIdx + 1}
              </StepNumber>
              <Text
                flex={1}
                fontSize="sm"
                fontWeight={isActiveMajor ? 700 : 600}
                color={isActiveMajor ? 'cardFg' : 'formLabelMuted'}
              >
                {major.label}
              </Text>
              {isActiveMajor ? (
                <LuChevronDown
                  size={18}
                  color="var(--chakra-colors-primary-600)"
                />
              ) : (
                <LuChevronRight
                  size={18}
                  color="var(--chakra-colors-formLabelMuted)"
                />
              )}
            </HStack>

            {isActiveMajor ? (
              <Stack
                gap={0}
                pl="14px"
                ml="13px"
                borderLeftWidth="2px"
                borderColor="primary.300"
                pb={2}
              >
                {major.subSteps.map((sub) => {
                  const isActiveSub = sub.id === activeSubStep
                  const isComplete = completedSubSteps.has(sub.id)
                  const unlocked = isSubStepUnlocked(
                    sub.id as WorkerSetupSubStepId,
                  )

                  return (
                    <HStack
                      key={sub.id}
                      gap={3}
                      py={2}
                      cursor={unlocked ? 'pointer' : 'not-allowed'}
                      opacity={unlocked ? 1 : 0.45}
                      onClick={() => {
                        if (unlocked)
                          goToSubStep(sub.id as WorkerSetupSubStepId)
                      }}
                    >
                      <SubStepDot active={isActiveSub} complete={isComplete} />
                      <Text
                        fontSize="sm"
                        fontWeight={isActiveSub ? 600 : 500}
                        color={isActiveSub ? 'primary.700' : 'formLabelMuted'}
                      >
                        {sub.label}
                      </Text>
                    </HStack>
                  )
                })}
              </Stack>
            ) : null}
          </Box>
        )
      })}
    </Stack>
  )
}
