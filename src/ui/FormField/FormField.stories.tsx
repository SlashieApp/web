import {
  Box,
  Input,
  type InputProps,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useCallback, useState } from 'react'

import { FormField } from './FormField'

/** Themed field shell; resolves via `formControl*` tokens in `theme/system.ts` (Storybook light/dark toolbar). */
const slashieFormInputProps = {
  bg: 'formControlBg',
  color: 'formControlFg',
  borderWidth: '1px',
  borderColor: 'formControlBorder',
  borderRadius: '12px',
  h: '52px',
  px: 4,
  fontSize: 'md',
  outline: 'none',
  _placeholder: { color: 'formControlPlaceholder' },
  _focusVisible: {
    borderColor: 'formControlFocusBorder',
  },
} satisfies InputProps

const slashieLabelProps = {
  fontSize: 'xs',
  fontWeight: 700,
  color: 'formLabelMuted',
  textTransform: 'uppercase',
  letterSpacing: '0.14em',
} as const

const slashieIconProps = { color: 'formControlIcon' } as const

function IconCalendar() {
  return (
    <Box as="span" display="inline-flex" w="18px" h="18px">
      <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
        <title>Calendar</title>
        <rect
          x="3"
          y="5"
          width="18"
          height="16"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path
          d="M3 10h18M8 3v4M16 3v4"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    </Box>
  )
}

function IconCash() {
  return (
    <Box as="span" display="inline-flex" w="18px" h="18px">
      <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
        <title>Budget</title>
        <rect
          x="2"
          y="6"
          width="20"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <circle
          cx="12"
          cy="13"
          r="2.5"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path
          d="M6 10h2M16 10h2M6 16h2M16 16h2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </Box>
  )
}

const meta = {
  title: 'form/FormField',
  component: FormField,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    label: 'Email',
    children: null,
  },
} satisfies Meta<typeof FormField>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <FormField
      label="Email"
      helperText="We’ll never share your email."
      helperTextProps={{ color: 'formHelperMuted' }}
    >
      <Input placeholder="you@example.com" {...slashieFormInputProps} />
    </FormField>
  ),
}

export const WithError: Story = {
  render: () => (
    <FormField label="Password" errorText="Password is too short">
      <Input
        type="password"
        placeholder="••••••••"
        {...slashieFormInputProps}
      />
    </FormField>
  ),
}

/** Project-style grid; toggle Storybook **Theme** for light/dark. */
export const FormControls: Story = {
  render: () => (
    <Stack gap={8} maxW="720px">
      <Text
        fontSize="xs"
        fontWeight={700}
        color="formLabelMuted"
        textTransform="uppercase"
        letterSpacing="0.2em"
      >
        Form controls
      </Text>

      <FormField label="Project title" labelProps={slashieLabelProps}>
        <Input
          defaultValue="Urban Garden Redesign"
          {...slashieFormInputProps}
        />
      </FormField>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
        <FormField
          label="Start date"
          labelProps={slashieLabelProps}
          icon={<IconCalendar />}
          iconProps={slashieIconProps}
        >
          <Input
            placeholder="Select date"
            readOnly
            {...slashieFormInputProps}
          />
        </FormField>

        <FormField
          label="Budget range"
          labelProps={slashieLabelProps}
          icon={<IconCash />}
          iconProps={slashieIconProps}
        >
          <Input
            defaultValue="$500 - $1.2k"
            readOnly
            {...slashieFormInputProps}
          />
        </FormField>
      </SimpleGrid>
    </Stack>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <FormField
      label="Start date"
      labelProps={slashieLabelProps}
      icon={<IconCalendar />}
      iconProps={slashieIconProps}
    >
      <Input placeholder="Select date" readOnly {...slashieFormInputProps} />
    </FormField>
  ),
}

export const ClickableTrigger: Story = {
  render: function ClickableTriggerRender() {
    const [opens, setOpens] = useState(0)
    const onControlClick = useCallback(() => setOpens((n) => n + 1), [])

    return (
      <FormField
        label="Budget range"
        labelProps={slashieLabelProps}
        icon={<IconCash />}
        iconProps={slashieIconProps}
        helperText={
          opens > 0
            ? `Control activated ${opens} time(s)`
            : 'Click the row to open picker'
        }
        helperTextProps={{ color: 'formHelperMuted' }}
        onControlClick={onControlClick}
      >
        <Box
          h="52px"
          display="flex"
          alignItems="center"
          px={4}
          bg="formControlBg"
          borderWidth="1px"
          borderColor="formControlBorder"
          borderRadius="12px"
        >
          <Text fontSize="md" color="formControlFg">
            $500 – $1.2k
          </Text>
        </Box>
      </FormField>
    )
  },
}
