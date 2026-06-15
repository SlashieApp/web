'use client'

import { Box, Collapsible, HStack, Stack, Text } from '@chakra-ui/react'
import { LuCheck, LuChevronDown, LuChevronRight } from 'react-icons/lu'

import { useWorkerSetup } from '../context/WorkerSetupProvider'
import {
  STEP_COPY,
  WORKER_SETUP_MAJOR_STEPS,
  type WorkerSetupSubStepId,
  majorIndexForSubStep,
} from '../helpers/workerSetupSteps.config'
import { WorkerSetupStepContent } from './WorkerSetupStepContent'
import { WorkerSetupStepHeading } from './WorkerSetupStepHeading'

export function WorkerSetupMobileAccordion() {
  const {
    activeSubStep,
    completedSubSteps,
    expandedMajor,
    toggleMajor,
    goToSubStep,
    isSubStepUnlocked,
    saveError,
  } = useWorkerSetup()

  const activeMajorIndex = majorIndexForSubStep(activeSubStep)
  const copy = STEP_COPY[activeSubStep]

  return (
    <Stack gap={0} w="full" bg="white">
      {WORKER_SETUP_MAJOR_STEPS.map((major, majorIdx) => {
        const isExpanded = expandedMajor === majorIdx
        const isActiveMajor = majorIdx === activeMajorIndex
        const majorComplete = major.subSteps.every((sub) =>
          completedSubSteps.has(sub.id),
        )

        return (
          <Box
            key={major.id}
            w="full"
            borderBottomWidth="1px"
            borderColor="cardBorder"
            _last={{ borderBottomWidth: 0 }}
          >
            <HStack
              gap={3}
              px={4}
              py={3}
              cursor="pointer"
              onClick={() => toggleMajor(majorIdx)}
            >
              <Box
                boxSize="24px"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg={majorComplete ? 'primary.100' : 'neutral.100'}
                color={majorComplete ? 'primary.800' : 'formLabelMuted'}
                flexShrink={0}
              >
                {majorComplete ? (
                  <LuCheck size={14} aria-hidden />
                ) : (
                  <Text fontSize="xs" fontWeight={700}>
                    {majorIdx + 1}
                  </Text>
                )}
              </Box>
              <Text flex={1} fontSize="sm" fontWeight={600} color="cardFg">
                {major.label}
              </Text>
              {isExpanded ? (
                <LuChevronDown
                  size={18}
                  color="var(--chakra-colors-formLabelMuted)"
                />
              ) : (
                <LuChevronRight
                  size={18}
                  color="var(--chakra-colors-formLabelMuted)"
                />
              )}
            </HStack>

            <Collapsible.Root open={isExpanded}>
              <Collapsible.Content>
                <Stack gap={0} px={4} pb={4}>
                  <Stack gap={0} pl={9}>
                    {major.subSteps.map((sub) => {
                      const isActive = sub.id === activeSubStep
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
                            if (unlocked) {
                              goToSubStep(sub.id as WorkerSetupSubStepId)
                            }
                          }}
                        >
                          <Box
                            boxSize="8px"
                            borderRadius="full"
                            bg={
                              isActive
                                ? 'primary.600'
                                : isComplete
                                  ? 'primary.300'
                                  : 'transparent'
                            }
                            borderWidth={isActive || isComplete ? '0' : '2px'}
                            borderColor="neutral.300"
                            flexShrink={0}
                          />
                          <Text
                            fontSize="sm"
                            fontWeight={isActive ? 600 : 500}
                            color={isActive ? 'primary.700' : 'formLabelMuted'}
                          >
                            {sub.label}
                          </Text>
                        </HStack>
                      )
                    })}
                  </Stack>

                  {isActiveMajor ? (
                    <Stack
                      gap={4}
                      mt={3}
                      pt={4}
                      borderTopWidth="1px"
                      borderColor="neutral.100"
                    >
                      <WorkerSetupStepHeading
                        title={copy.title}
                        description={copy.description}
                        compact
                      />
                      {saveError ? (
                        <Text color="red.500" fontSize="sm">
                          {saveError}
                        </Text>
                      ) : null}
                      <WorkerSetupStepContent />
                    </Stack>
                  ) : null}
                </Stack>
              </Collapsible.Content>
            </Collapsible.Root>
          </Box>
        )
      })}
    </Stack>
  )
}
