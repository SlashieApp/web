'use client'

import { Box, HStack, Stack, type StackProps, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { LuChevronDown, LuChevronRight } from 'react-icons/lu'

export type StepperSubStep = {
  id: string
  label: string
}

export type StepperStep = {
  id: string
  label: string
  subSteps?: StepperSubStep[]
}

export type StepperProps = {
  /** Ordered major steps; each may contain sub-steps. */
  steps: StepperStep[]
  /** Active sub-step id (or step id when a step has no sub-steps). */
  activeSubStepId: string
  /** Completed sub-step ids. */
  completedSubStepIds?: ReadonlySet<string> | readonly string[]
  /** Returns whether a sub-step is navigable. Defaults to always unlocked. */
  isSubStepUnlocked?: (id: string) => boolean
  /** Navigate to a sub-step. */
  onSelectSubStep?: (id: string) => void
} & Omit<StackProps, 'children' | 'onSelect'>

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
      bg={active ? 'primary' : complete ? 'primary.100' : 'transparent'}
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
      bg={active ? 'primary' : complete ? 'primary.400' : 'transparent'}
      borderWidth={active || complete ? '0' : '2px'}
      borderColor="neutral.300"
    />
  )
}

/** Universal vertical stepper with collapsible sub-steps for the active group. */
export function Stepper({
  steps,
  activeSubStepId,
  completedSubStepIds,
  isSubStepUnlocked,
  onSelectSubStep,
  ...rest
}: StepperProps) {
  const completed =
    completedSubStepIds instanceof Set
      ? completedSubStepIds
      : new Set(completedSubStepIds ?? [])

  let activeMajorIndex = 0
  for (let i = 0; i < steps.length; i += 1) {
    const ids = steps[i].subSteps?.map((sub) => sub.id) ?? [steps[i].id]
    if (ids.includes(activeSubStepId)) {
      activeMajorIndex = i
      break
    }
  }

  return (
    <Stack gap={1} w="full" {...rest}>
      {steps.map((major, majorIdx) => {
        const isActiveMajor = majorIdx === activeMajorIndex
        const isCompleteMajor = majorIdx < activeMajorIndex
        const subSteps = major.subSteps ?? []

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
              {subSteps.length > 0 ? (
                isActiveMajor ? (
                  <LuChevronDown
                    size={18}
                    color="var(--chakra-colors-primary-600)"
                  />
                ) : (
                  <LuChevronRight
                    size={18}
                    color="var(--chakra-colors-formLabelMuted)"
                  />
                )
              ) : null}
            </HStack>

            {isActiveMajor && subSteps.length > 0 ? (
              <Stack
                gap={0}
                pl="14px"
                ml="13px"
                borderLeftWidth="2px"
                borderColor="primary.300"
                pb={2}
              >
                {subSteps.map((sub) => {
                  const isActiveSub = sub.id === activeSubStepId
                  const isComplete = completed.has(sub.id)
                  const unlocked = isSubStepUnlocked?.(sub.id) ?? true

                  return (
                    <HStack
                      key={sub.id}
                      gap={3}
                      py={2}
                      cursor={unlocked ? 'pointer' : 'not-allowed'}
                      opacity={unlocked ? 1 : 0.45}
                      onClick={() => {
                        if (unlocked) onSelectSubStep?.(sub.id)
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
