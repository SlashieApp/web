'use client'

import { Box, NativeSelect } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import * as React from 'react'
import { LuChevronDown } from 'react-icons/lu'

import {
  formControlInvalidShellProps,
  useFormFieldControlProps,
} from '../FormField/formFieldContext'
import {
  formControlFieldRingless,
  formControlShellInteraction,
} from '../interactionStyles'

type NativeFieldProps = React.ComponentProps<typeof NativeSelect.Field>
type NativeRootProps = React.ComponentProps<typeof NativeSelect.Root>

export type SelectProps = NativeFieldProps & {
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
          minH={{ base: 10, md: 11 }}
          borderRadius={{ base: 'lg', md: 'xl' }}
          borderWidth="1px"
          borderColor="formControlBorder"
          bg="formControlBg"
          pl={2}
          pr={1}
          {...formControlShellInteraction}
          {...formControlInvalidShellProps(invalid)}
        >
          {startElement != null ? (
            <Box
              flexShrink={0}
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="formControlIcon"
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
            py={2}
            px={1}
            h="auto"
            minH={0}
            borderWidth={0}
            boxShadow="none"
            bg="transparent"
            color="formControlFg"
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
            color="formControlIcon"
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
