'use client'

import { Box, Stack, Text, Wrap, chakra } from '@chakra-ui/react'
import { Currency, type TaskPaymentMethod } from '@codegen/schema'
import { useEffect, useId, useRef, useState } from 'react'
import type { UseFormRegister } from 'react-hook-form'

import type { BudgetUnitChoice } from '@/app/(task)/helpers/taskBudget/proUnits'
import {
  BUDGET_UNIT_SUGGESTIONS,
  type BudgetUnitSuggestion,
  CUSTOM_UNIT_MAX,
  chosenUnitSuggestion,
  normalizeUnitText,
  taskBudgetBag,
} from '@/app/(task)/helpers/taskBudget/taskBudget'
import {
  TASK_PAYMENT_METHODS,
  taskPaymentBag,
} from '@/app/(task)/helpers/taskPayment/taskPayment'
import { useI11n } from '@/i18n/useI11n'
import { sdlFigure, sdlFocusRing, sdlMotion } from '@/theme/styles'
import {
  CheckButtonGroup,
  FormField,
  Input,
  RadioButtonGroup,
  Reveal,
  formControlLabelProps,
  formControlRootProps,
} from '@ui'

import type { CreateTaskFormFieldValues } from '../../../createTaskFormSchema'
import { taskFieldError } from '../../../helpers/taskFieldError'
import bag from '../../../i11n.json'
import { CreateTaskSection } from '../../layout/shared/CreateTaskSection'

/** The answer to "Do you have a budget in mind?"; null until it is picked. */
export type BudgetChoice = 'set' | 'open'

export type CreateTaskBudgetSectionProps = {
  /** Bare inside the create flow's step; a titled section on edit. */
  bare?: boolean
  sectionHeading?: string
  /**
   * The screen's own title already asks "Do you have a budget in mind?" (the
   * create step), so the choice's label is for screen readers only.
   */
  questionInTitle?: boolean
  register: UseFormRegister<CreateTaskFormFieldValues>
  /** Shown as the amount's symbol; tasks are posted in GBP. */
  budgetCurrency: Currency
  /** The amount as typed: what it's for is only asked once there is one. */
  budgetMajor: string
  /** What the amount is for: blank (the whole job), a suggestion, or the poster's own words. */
  budgetUnit: string
  /**
   * What "What's it for?" offers (FE-603; budget units are Slashie Pro only).
   * `all` (default): every unit and the poster's own words. `none`: no unit
   * question, the budget is for the whole job. `keep`: Whole job or
   * `keptUnit`, the unit the task already has (Edit task without Pro).
   */
  unitChoice?: BudgetUnitChoice
  /** The unit text the task was saved with, for `keep`. */
  keptUnit?: string
  /** The budget question has been answered; false on a new task. */
  budgetAnswered: boolean
  /** Open budget: no amount or unit, workers quote their own price. */
  openBudget: boolean
  /** Every payment method the poster accepts (FE-599): one or more. */
  paymentMethods: readonly TaskPaymentMethod[]
  onBudgetUnitChange: (value: string) => void
  onBudgetChoiceChange: (choice: BudgetChoice) => void
  onPaymentMethodsChange: (value: TaskPaymentMethod[]) => void
  /** Copy keys from the form schema. */
  budgetChoiceError?: string
  budgetMajorError?: string
  budgetUnitError?: string
  paymentMethodsError?: string
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

const ChipLabel = chakra('label')
const ChipInput = chakra('input')

/**
 * One of the "What's it for?" choices: a pill, green when it is the one
 * picked. A real radio input under the pill, so the arrow keys move between
 * the choices and each is announced as "2 of 7".
 */
function UnitChip({
  name,
  on,
  label,
  onPick,
}: {
  /** The group's name: one choice at a time. */
  name: string
  on: boolean
  label: string
  /** `byPointer`: tapped or clicked, not reached with the arrow keys. */
  onPick: (byPointer: boolean) => void
}) {
  const pointer = useRef(false)
  return (
    <ChipLabel
      position="relative"
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
      _focusWithin={{ '&:has(:focus-visible)': sdlFocusRing }}
      {...chipTransition}
    >
      <ChipInput
        type="radio"
        name={name}
        checked={on}
        // A real click has a count; one made by the keyboard has none.
        onClick={(e) => {
          pointer.current = e.detail > 0
        }}
        onChange={() => {
          onPick(pointer.current)
          pointer.current = false
        }}
        position="absolute"
        inset={0}
        w="full"
        h="full"
        m={0}
        opacity={0}
        cursor="pointer"
      />
      {label}
    </ChipLabel>
  )
}

/** The second thing an answer reveals follows the first by this much (staggering). */
const STAGGER_MS = 60

/**
 * The budget, one question at a time (Ryan 22 Nov; it replaces the Skip link
 * of FE-584). "Do you have a budget in mind?" starts with neither choice
 * picked. Set a budget opens the amount under it, with the cursor in it; once
 * an amount is typed, "What's it for?" opens with Whole job picked, the
 * suggestions, and Other, which opens a field for the poster's own words.
 * That question is a Slashie Pro feature (FE-603): without Pro it does not
 * show and every budget is for the whole job (`unitChoice`).
 * Open budget shows the one-line note. "Your accepted payment method"
 * follows either answer: Cash, Bank transfer and Pay by card, any number of
 * them (FE-599). The customer pays the worker directly, card included. Each
 * part slides open from the answer that revealed it (`Reveal`).
 * Changing the answer keeps what was typed. The same in Edit task and the
 * Expo app.
 */
export function CreateTaskBudgetSection({
  bare = false,
  sectionHeading = '',
  questionInTitle = false,
  register,
  budgetCurrency,
  budgetMajor,
  budgetUnit,
  unitChoice = 'all',
  keptUnit = '',
  budgetAnswered,
  openBudget,
  paymentMethods,
  onBudgetUnitChange,
  onBudgetChoiceChange,
  onPaymentMethodsChange,
  budgetChoiceError,
  budgetMajorError,
  budgetUnitError,
  paymentMethodsError,
}: CreateTaskBudgetSectionProps) {
  const t = useI11n(bag)
  const units = useI11n(taskBudgetBag)
  const payment = useI11n(taskPaymentBag)
  const f = t.fields
  const unitLabelId = useId()

  const choice: BudgetChoice | null = !budgetAnswered
    ? null
    : openBudget
      ? 'open'
      : 'set'
  const amount = Number.parseFloat(budgetMajor)
  const hasAmount = Number.isFinite(amount) && amount > 0

  // What it's for: the poster's own words keep Other picked; a blank unit is
  // the whole job unless Other was just tapped and nothing is typed yet.
  const chosen = chosenUnitSuggestion(budgetUnit)
  const ownWords = normalizeUnitText(budgetUnit) !== '' && chosen === null
  const [otherTapped, setOtherTapped] = useState(false)
  const otherOn = ownWords || otherTapped
  const wholeJobOn = !otherOn && chosen === null
  const unitName = useId()
  const pickUnit = (unit: BudgetUnitSuggestion | null) => {
    setOtherTapped(false)
    onBudgetUnitChange(unit ? units.suggestion[unit] : '')
  }
  // `keep`: the task's own unit, worded as a chip (a suggestion in the
  // reader's language, the poster's own words as typed).
  const keptSuggestion = chosenUnitSuggestion(keptUnit)
  const keptLabel = keptSuggestion
    ? units.unit[keptSuggestion]
    : normalizeUnitText(keptUnit)
  const keptOn =
    normalizeUnitText(budgetUnit) !== '' &&
    normalizeUnitText(budgetUnit) === normalizeUnitText(keptUnit)

  // Focus follows the answer: into the amount after Set a budget, into the
  // field after Other. Only after a tap here, never on load.
  const amountField = register('budgetMajor')
  const amountRef = useRef<HTMLInputElement | null>(null)
  const otherRef = useRef<HTMLInputElement | null>(null)
  const focusNext = useRef<'amount' | 'other' | null>(null)
  // The field is usually not there yet (its fold mounts it a moment later):
  // it takes the focus as it arrives. One still folding away takes it here.
  const focusIfAsked = (which: 'amount' | 'other', el: HTMLElement | null) => {
    if (!el || focusNext.current !== which) return
    focusNext.current = null
    el.focus()
  }
  useEffect(() => {
    if (choice === 'set') focusIfAsked('amount', amountRef.current)
    if (otherOn) focusIfAsked('other', otherRef.current)
  })

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
      {/* One block with no gap: each part brings its own space, inside its fold. */}
      <Stack gap={0} w="full" data-budget-choice={choice ?? 'none'}>
        <RadioButtonGroup
          label={f.budgetChoice}
          labelHidden={questionInTitle}
          value={choice}
          options={[
            { value: 'set', label: f.setBudget },
            { value: 'open', label: f.openBudget },
          ]}
          onChange={(next) => {
            if (next === 'set') focusNext.current = 'amount'
            onBudgetChoiceChange(next)
          }}
          errorText={taskFieldError(t.errors, budgetChoiceError)}
        />

        <Reveal open={choice === 'set'} spaceAbove="form.fieldGap">
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
                focusIfAsked('amount', el)
              }}
            />
          </FormField>
        </Reveal>

        <Reveal
          open={choice === 'set' && hasAmount && unitChoice !== 'none'}
          spaceAbove="form.fieldGap"
          data-budget-unit={unitChoice}
        >
          <Stack gap={0} w="full">
            <Text id={unitLabelId} {...formControlLabelProps} px={1}>
              {f.budgetUnit}
            </Text>
            <Wrap
              role="radiogroup"
              aria-labelledby={unitLabelId}
              gap="form.alternativesGap"
            >
              <UnitChip
                name={unitName}
                on={unitChoice === 'keep' ? !keptOn : wholeJobOn}
                label={f.unitWholeJob}
                onPick={() => pickUnit(null)}
              />
              {unitChoice === 'keep' ? (
                // Without Slashie Pro the task keeps the unit it has, or
                // drops it: no other unit is offered.
                <UnitChip
                  name={unitName}
                  on={keptOn}
                  label={keptLabel}
                  onPick={() => {
                    setOtherTapped(false)
                    onBudgetUnitChange(keptUnit)
                  }}
                />
              ) : (
                <>
                  {BUDGET_UNIT_SUGGESTIONS.map((unit) => (
                    <UnitChip
                      key={unit}
                      name={unitName}
                      on={!otherOn && chosen === unit}
                      label={units.unit[unit]}
                      onPick={() => pickUnit(unit)}
                    />
                  ))}
                  <UnitChip
                    name={unitName}
                    on={otherOn}
                    label={f.unitOther}
                    onPick={(byPointer) => {
                      // Arrowing past Other must not pull focus out of the choices.
                      if (byPointer) focusNext.current = 'other'
                      setOtherTapped(true)
                      // A tapped suggestion isn't the poster's own words.
                      if (chosen !== null) onBudgetUnitChange('')
                    }}
                  />
                </>
              )}
            </Wrap>
            <Reveal
              open={otherOn && unitChoice === 'all'}
              spaceAbove="form.labelToControl"
            >
              <FormField
                label={f.unitOtherLabel}
                labelProps={{ srOnly: true }}
                errorText={taskFieldError(t.errors, budgetUnitError)}
              >
                <Input
                  ref={(el) => {
                    otherRef.current = el
                    focusIfAsked('other', el)
                  }}
                  value={budgetUnit}
                  maxLength={CUSTOM_UNIT_MAX}
                  placeholder={f.budgetUnitPlaceholder}
                  onChange={(e) => onBudgetUnitChange(e.target.value)}
                  rootProps={{ ...formControlRootProps, maxW: { md: '360px' } }}
                />
              </FormField>
            </Reveal>
          </Stack>
        </Reveal>

        <Reveal open={choice === 'open'} spaceAbove="form.fieldGap">
          <Box data-open-budget px={4} py={3} borderRadius="lg" bg="bg.subtle">
            <Text fontSize="sm" color="text.muted">
              {f.openBudgetBody}
            </Text>
          </Box>
        </Reveal>

        <Reveal
          open={choice !== null}
          delayMs={STAGGER_MS}
          spaceAbove="form.fieldGap"
        >
          <CheckButtonGroup
            label={f.payment}
            helperText={f.paymentHelper}
            values={paymentMethods}
            options={TASK_PAYMENT_METHODS.map((method) => ({
              value: method,
              label: payment.method[method],
            }))}
            onChange={onPaymentMethodsChange}
            errorText={taskFieldError(t.errors, paymentMethodsError)}
          />
        </Reveal>
      </Stack>
    </CreateTaskSection>
  )
}
