'use client'

import { Box, Collapsible, Stack, Text, chakra } from '@chakra-ui/react'
import { LuCheck, LuChevronDown, LuChevronRight } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { sdlFocusRing } from '@/theme/styles'
import { StepFlowHeading } from '@ui'
import { useWorkerSetup } from '../../../context/WorkerSetupProvider'
import {
  type WorkerSetupSubStepId,
  majorIndexForSubStep,
  workerSetupStepsWithLabels,
} from '../../../helpers/workerSetupSteps.config'
import bag from '../../../i11n.json'
import { WorkerSetupStepContent } from '../../ui/steps/WorkerSetupStepContent'

/**
 * Phone stepper: one disclosure per major step. Headers and sub-steps are
 * real buttons (expanded / current / locked states, 44px rows).
 */
export function WorkerSetupMobileAccordion() {
  const t = useI11n(bag)
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
  const copy = t.steps[activeSubStep]

  return (
    <Stack gap={0} w="full" bg="bg.surface">
      {workerSetupStepsWithLabels(t).map((major, majorIdx) => {
        const isExpanded = expandedMajor === majorIdx
        const isActiveMajor = majorIdx === activeMajorIndex
        const majorComplete = major.subSteps.every((sub) =>
          completedSubSteps.has(sub.id),
        )
        const panelId = `worker-setup-${major.id}`

        return (
          <Box
            key={major.id}
            w="full"
            borderBottomWidth="1px"
            borderColor="border.default"
            _last={{ borderBottomWidth: 0 }}
          >
            <chakra.button
              type="button"
              aria-expanded={isExpanded}
              aria-controls={panelId}
              onClick={() => toggleMajor(majorIdx)}
              display="flex"
              alignItems="center"
              gap={3}
              w="full"
              minH="44px"
              px={4}
              py={3}
              textAlign="left"
              cursor="pointer"
              _focusVisible={sdlFocusRing}
            >
              <Box
                boxSize="24px"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg={majorComplete ? 'status.success.soft' : 'bg.subtle'}
                color={majorComplete ? 'status.success.fg' : 'text.muted'}
                flexShrink={0}
                aria-hidden
              >
                {majorComplete ? (
                  <LuCheck size={14} />
                ) : (
                  <Text fontSize="xs" fontWeight={700}>
                    {majorIdx + 1}
                  </Text>
                )}
              </Box>
              <Text
                as="span"
                flex={1}
                fontSize="sm"
                fontWeight={600}
                color="text.default"
              >
                {major.label}
              </Text>
              {isExpanded ? (
                <LuChevronDown
                  size={18}
                  color="var(--chakra-colors-text-muted)"
                  aria-hidden
                />
              ) : (
                <LuChevronRight
                  size={18}
                  color="var(--chakra-colors-text-muted)"
                  aria-hidden
                />
              )}
            </chakra.button>

            <Collapsible.Root open={isExpanded}>
              <Collapsible.Content id={panelId}>
                <Stack gap={0} px={4} pb={4}>
                  <Stack gap={0} pl={9}>
                    {major.subSteps.map((sub) => {
                      const id = sub.id as WorkerSetupSubStepId
                      const isActive = id === activeSubStep
                      const isComplete = completedSubSteps.has(id)
                      const unlocked = isSubStepUnlocked(id)

                      return (
                        <chakra.button
                          key={id}
                          type="button"
                          disabled={!unlocked}
                          aria-current={isActive ? 'step' : undefined}
                          onClick={() => goToSubStep(id)}
                          display="flex"
                          alignItems="center"
                          gap={3}
                          w="full"
                          minH="44px"
                          textAlign="left"
                          cursor="pointer"
                          borderRadius="md"
                          _disabled={{ cursor: 'not-allowed', opacity: 0.45 }}
                          _focusVisible={sdlFocusRing}
                        >
                          <Box
                            boxSize="8px"
                            borderRadius="full"
                            bg={
                              isActive
                                ? 'action.primary'
                                : isComplete
                                  ? 'green.300' /* TODO(sdl): no lighter-green semantic role for completed-but-inactive dot */
                                  : 'transparent'
                            }
                            borderWidth={isActive || isComplete ? '0' : '2px'}
                            borderColor="border.strong"
                            flexShrink={0}
                            aria-hidden
                          />
                          <Text
                            as="span"
                            fontSize="sm"
                            fontWeight={isActive ? 600 : 500}
                            color={isActive ? 'text.link' : 'text.muted'}
                          >
                            {sub.label}
                          </Text>
                        </chakra.button>
                      )
                    })}
                  </Stack>

                  {isActiveMajor ? (
                    <Stack
                      gap={4}
                      mt={3}
                      pt={4}
                      borderTopWidth="1px"
                      borderColor="border.default"
                    >
                      <StepFlowHeading
                        title={copy.title}
                        description={copy.description}
                        compact
                      />
                      {saveError ? (
                        <Text
                          color="status.danger.fg"
                          fontSize="sm"
                          role="alert"
                        >
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
