'use client'

import { HStack, Stack, Text, Wrap, chakra } from '@chakra-ui/react'
import { Currency, TaskPaymentMethod } from '@codegen/schema'
import { useEffect, useRef } from 'react'
import type { UseFormRegister } from 'react-hook-form'
import { LuChevronRight } from 'react-icons/lu'

import {
  BUDGET_UNIT_SUGGESTIONS,
  CUSTOM_UNIT_MAX,
  chosenUnitSuggestion,
  taskBudgetBag,
} from '@/app/(task)/helpers/taskBudget/taskBudget'
import { useI11n } from '@/i18n/useI11n'
import { sdlFigure, sdlFocusRing, sdlMotion } from '@/theme/styles'
import {
  Button,
  FormField,
  Input,
  RadioButtonGroup,
  formControlRootProps,
} from '@ui'

import type { CreateTaskFormFieldValues } from '../../../createTaskFormSchema'
import { taskFieldError } from '../../../helpers/taskFieldError'
import bag from '../../../i11n.json'
import { CreateTaskSection } from '../../layout/shared/CreateTaskSection'

export type CreateTaskBudgetSectionProps = {
  /** Bare inside the create flow's step; a titled section on edit. */
  bare?: boolean
  sectionHeading?: string
  register: UseFormRegister<CreateTaskFormFieldValues>
  /** Shown as the amount's symbol; tasks are posted in GBP. */
  budgetCurrency: Currency
  /** The unit field's text: blank, a suggestion, or the poster's own words. */
  budgetUnit: string
  /** Skipped: no amount or unit, workers quote their own price. */
  openBudget: boolean
  paymentMethod: TaskPaymentMethod
  onBudgetUnitChange: (value: string) => void
  onOpenBudgetChange: (open: boolean) => void
  onPaymentMethodChange: (value: TaskPaymentMethod) => void
  /** Copy keys from the form schema. */
  budgetMajorError?: string
  budgetUnitError?: string
}

const CURRENCY_SYMBOL: Record<Currency, string> = {
  [Currency.Gbp]: '£',
  [Currency.Usd]: '$',
}

const chipTransition = {
  transitionProperty: 'background-color, border-color, color',
  transitionDuration: sdlMotion.duration.base,
  transitionTimingFunction: sdlMotion.easing.standard,
} as const

const ChipButton = chakra('button')

/**
 * The budget (FE-584, BE-139; Ryan 21 Nov): the amount, then what it's for
 * (blank is the whole job; tap a suggestion or type your own), then Skip,
 * which folds both into an Open budget note that "Add a budget" undoes. How
 * you'll pay is asked either way. The same in Edit task and the Expo app.
 */
export function CreateTaskBudgetSection({
  bare = false,
  sectionHeading = '',
  register,
  budgetCurrency,
  budgetUnit,
  openBudget,
  paymentMethod,
  onBudgetUnitChange,
  onOpenBudgetChange,
  onPaymentMethodChange,
  budgetMajorError,
  budgetUnitError,
}: CreateTaskBudgetSectionProps) {
  const t = useI11n(bag)
  const units = useI11n(taskBudgetBag)
  const f = t.fields
  const chosen = chosenUnitSuggestion(budgetUnit)

  // Focus follows the switch: to "Add a budget" after Skip, to the amount after it.
  const amountField = register('budgetMajor')
  const amountRef = useRef<HTMLInputElement | null>(null)
  const addBudgetRef = useRef<HTMLButtonElement | null>(null)
  const switched = useRef(false)
  useEffect(() => {
    if (!switched.current) return
    switched.current = false
    if (openBudget) addBudgetRef.current?.focus()
    else amountRef.current?.focus()
  }, [openBudget])
  const switchTo = (open: boolean) => {
    switched.current = true
    onOpenBudgetChange(open)
  }

  return (
    <CreateTaskSection
      bare={bare}
      heading={sectionHeading}
      headingSubtext={
        <Text fontSize="sm" color="text.muted">
          {t.steps.budget.description}
        </Text>
      }
    >
      {openBudget ? (
        <HStack
          data-open-budget
          justify="space-between"
          gap={3}
          pl={4}
          pr={1}
          py={2}
          borderRadius="lg"
          bg="bg.subtle"
        >
          <Stack gap={0.5} minW={0}>
            <Text fontSize="sm" fontWeight={500} color="text.default">
              {f.openBudget}
            </Text>
            <Text fontSize="sm" color="text.muted">
              {f.openBudgetBody}
            </Text>
          </Stack>
          <Button
            ref={addBudgetRef}
            type="button"
            variant="ghost"
            minH="44px"
            color="text.link"
            flexShrink={0}
            onClick={() => switchTo(false)}
          >
            {f.addBudget}
          </Button>
        </HStack>
      ) : (
        <>
          <FormField
            label={f.amount}
            required
            errorText={taskFieldError(t.errors, budgetMajorError)}
          >
            <Input
              type="number"
              inputMode="decimal"
              min={1}
              step="0.01"
              placeholder="0.00"
              rootProps={{ maxW: { base: 'full', md: '240px' } }}
              startElement={
                <Text {...sdlFigure} fontSize="sm" color="text.muted">
                  {CURRENCY_SYMBOL[budgetCurrency]}
                </Text>
              }
              {...amountField}
              ref={(el) => {
                amountField.ref(el)
                amountRef.current = el
              }}
            />
          </FormField>

          <FormField
            label={f.budgetUnit}
            helperText={f.budgetUnitHint}
            errorText={taskFieldError(t.errors, budgetUnitError)}
          >
            <Stack gap="form.labelToControl" w="full">
              <Input
                value={budgetUnit}
                maxLength={CUSTOM_UNIT_MAX}
                placeholder={f.budgetUnitPlaceholder}
                onChange={(e) => onBudgetUnitChange(e.target.value)}
                rootProps={{ ...formControlRootProps, maxW: { md: '360px' } }}
              />
              <Wrap gap="form.alternativesGap">
                {BUDGET_UNIT_SUGGESTIONS.map((unit) => {
                  const on = chosen === unit
                  return (
                    <ChipButton
                      key={unit}
                      type="button"
                      aria-pressed={on}
                      // Tapping the chosen one again clears it (the whole job).
                      onClick={() =>
                        onBudgetUnitChange(on ? '' : units.suggestion[unit])
                      }
                      display="inline-flex"
                      alignItems="center"
                      px={3}
                      minH="44px"
                      borderRadius="full"
                      borderWidth="1px"
                      borderColor={on ? 'transparent' : 'border.strong'}
                      bg={on ? 'status.success.soft' : 'bg.surface'}
                      color={on ? 'status.success.fg' : 'text.muted'}
                      fontSize="sm"
                      fontWeight={500}
                      cursor="pointer"
                      _hover={
                        on
                          ? undefined
                          : {
                              bg: 'bg.subtle',
                              borderColor: 'border.hover',
                              color: 'text.default',
                            }
                      }
                      _focusVisible={sdlFocusRing}
                      {...chipTransition}
                    >
                      {units.suggestion[unit]}
                    </ChipButton>
                  )
                })}
              </Wrap>
            </Stack>
          </FormField>

          <Button
            type="button"
            variant="ghost"
            minH="44px"
            px={2}
            ml={-2}
            alignSelf="flex-start"
            color="text.link"
            onClick={() => switchTo(true)}
          >
            {f.skipBudget}
            <LuChevronRight aria-hidden />
          </Button>
        </>
      )}

      <RadioButtonGroup
        label={f.payment}
        value={paymentMethod}
        options={[
          { value: TaskPaymentMethod.Cash, label: f.cash },
          { value: TaskPaymentMethod.BankTransfer, label: f.bankTransfer },
        ]}
        onChange={onPaymentMethodChange}
      />
    </CreateTaskSection>
  )
}
