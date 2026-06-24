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
 * `rootProps.invalid` when not wrapped in a field context.
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

    return (
      <NativeSelect.Root
        unstyled
        w="full"
        {...rootProps}
        disabled={controlProps.disabled}
        invalid={invalid}
      >
        <Box
          pointerEvents="auto"
          display="flex"
          alignItems="center"
          gap={1}
          minH="44px"
          borderRadius="md"
          borderWidth="1px"
          borderColor="border.default"
          bg="bg.surface"
          pl={3}
          pr={2}
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
            px={1}
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
          <Box
            flexShrink={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="text.muted"
            pr={0.5}
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
