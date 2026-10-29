'use client'

import { Box, NativeSelect } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import * as React from 'react'
import { LuChevronDown } from 'react-icons/lu'

import {
  formControlFieldRingless,
  formControlShellInteraction,
} from '@/theme/system'
import {
  formControlInvalidShellProps,
  useFormControlMinH,
  useFormFieldControlProps,
} from '../FormField/formFieldContext'

type NativeFieldProps = React.ComponentProps<typeof NativeSelect.Field>
type NativeRootProps = React.ComponentProps<typeof NativeSelect.Root>

export type SelectProps = NativeFieldProps & {
  /** When set, applies to the root and field (overridden by `rootProps.disabled` when both set). */
  disabled?: NativeRootProps['disabled']
  required?: boolean
  /** Forwarded to `NativeSelect.Root` (`w`, `maxW`, `disabled`, `invalid`, …). */
  rootProps?: Omit<NativeRootProps, 'children'>
  /** Optional leading content inside the control shell (e.g. icon). */
  startElement?: ReactNode
  /** Replaces the default chevron; keep `pointerEvents: none` if purely decorative. */
  endElement?: ReactNode
}

/**
 * Native `<select>` with the same bordered shell and focus treatment as {@link Input}:
 * `formControl*` tokens and green focus border via the wrapper.
 *
 * Pair with {@link FormField} for labels and errors. Use `rootProps.disabled` /
 * `rootProps.invalid` when not wrapped in a field context. The shell is 48px
 * tall in a `FormField` (a form), 44px on its own.
 *
 * The whole shell is the target (FE-481): the native control fills it edge to
 * edge, and the chevron sits over it with `pointer-events: none`, so a tap on
 * the chevron, the padding or the strip above and below the text opens the
 * list. Only a `startElement` (a decorative prefix) is outside the target.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      rootProps,
      startElement,
      endElement,
      children,
      disabled,
      required,
      id,
      ...fieldProps
    },
    ref,
  ) {
    const { invalid, ...controlProps } = useFormFieldControlProps({
      id,
      disabled: disabled ?? rootProps?.disabled,
      required,
      'aria-describedby': fieldProps['aria-describedby'],
    })
    const minH = useFormControlMinH()

    return (
      <NativeSelect.Root
        unstyled
        w="full"
        {...rootProps}
        disabled={controlProps.disabled}
        invalid={invalid}
      >
        <Box
          position="relative"
          pointerEvents="auto"
          display="flex"
          alignItems="stretch"
          gap={1}
          minH={minH}
          borderRadius="md"
          borderWidth="1px"
          borderColor="border.strong"
          bg="bg.surface"
          pl={startElement != null ? 3 : 0}
          {...formControlShellInteraction}
          {...formControlInvalidShellProps(invalid)}
        >
          {startElement != null ? (
            <Box
              flexShrink={0}
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="text.muted"
              px={1}
            >
              {startElement}
            </Box>
          ) : null}
          <NativeSelect.Field
            ref={ref}
            unstyled
            flex={1}
            minW={0}
            py={2.5}
            pl={startElement != null ? 1 : 4}
            pr={9}
            h="auto"
            minH={0}
            borderWidth={0}
            boxShadow="none"
            bg="transparent"
            color="text.default"
            cursor="pointer"
            appearance="none"
            lineHeight="1.25"
            _disabled={{
              opacity: 0.6,
              cursor: 'not-allowed',
            }}
            {...formControlFieldRingless}
            {...fieldProps}
            {...controlProps}
          >
            {children}
          </NativeSelect.Field>
          {/* Over the control, not beside it, so the click lands on the select. */}
          <Box
            position="absolute"
            top={0}
            bottom={0}
            right={2.5}
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="text.muted"
            pointerEvents="none"
            aria-hidden
          >
            {endElement ?? <LuChevronDown size={18} strokeWidth={2} />}
          </Box>
        </Box>
      </NativeSelect.Root>
    )
  },
)

Select.displayName = 'Select'
