import { Box, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useCallback, useState } from 'react'

import { Input } from '../Input/Input'
import { OtpInput } from '../OtpInput/OtpInput'
import { PhoneInput } from '../PhoneInput/PhoneInput'
import { Select } from '../Select/Select'
import { Textarea } from '../Textarea/Textarea'
import { FormField } from './FormField'

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
  title: 'ui/FormField',
  component: FormField,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Label + helper + error wrapper. Slot any `@ui` control; field state (id, invalid, disabled, aria) flows via context.',
      },
    },
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
      <Input placeholder="you@example.com" />
    </FormField>
  ),
}

export const WithError: Story = {
  render: () => (
    <FormField label="Password" errorText="Password is too short">
      <Input type="password" placeholder="••••••••" />
    </FormField>
  ),
}

export const WithSelect: Story = {
  render: () => (
    <FormField
      label="Category"
      helperText="Workers filter discovery by category."
    >
      <Select>
        <option value="">Select a category…</option>
        <option value="handyman">Handyman</option>
        <option value="cleaning">Cleaning</option>
      </Select>
    </FormField>
  ),
}

export const WithTextarea: Story = {
  render: function WithTextareaRender() {
    const [value, setValue] = useState('')
    return (
      <FormField
        label="Description"
        errorText={
          value.length > 0 && value.length < 10
            ? 'Add a bit more detail'
            : undefined
        }
      >
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Describe the work…"
          rows={4}
        />
      </FormField>
    )
  },
}

export const WithCharCount: Story = {
  render: function WithCharCountRender() {
    const [value, setValue] = useState('')
    const maxLength = 300
    return (
      <FormField label="Short bio" helperText="Keep it clear and friendly.">
        <Box position="relative" w="full">
          <Textarea
            value={value}
            maxLength={maxLength}
            pb={10}
            rows={6}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Tell customers about your experience, skills, and what makes you great to work with."
          />
          <Text
            position="absolute"
            bottom={3}
            right={4}
            fontSize="xs"
            color="formLabelMuted"
            pointerEvents="none"
            aria-hidden
          >
            {value.length} / {maxLength}
          </Text>
        </Box>
      </FormField>
    )
  },
}

export const WithPhoneAndOtp: Story = {
  render: function WithPhoneAndOtpRender() {
    const [phone, setPhone] = useState('')
    const [code, setCode] = useState('')
    return (
      <Stack gap={6} maxW="420px">
        <FormField
          label="Mobile number"
          helperText="UK numbers only in this demo."
        >
          <PhoneInput value={phone} onChange={setPhone} />
        </FormField>
        <FormField
          label="Verification code"
          errorText={
            code.length > 0 && code.length < 6
              ? 'Enter all 6 digits'
              : undefined
          }
        >
          <OtpInput value={code} onChange={setCode} />
        </FormField>
      </Stack>
    )
  },
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
        <Input defaultValue="Urban Garden Redesign" />
      </FormField>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
        <FormField
          label="Start date"
          labelProps={slashieLabelProps}
          icon={<IconCalendar />}
          iconProps={slashieIconProps}
        >
          <Input placeholder="Select date" readOnly />
        </FormField>

        <FormField
          label="Budget range"
          labelProps={slashieLabelProps}
          icon={<IconCash />}
          iconProps={slashieIconProps}
        >
          <Input defaultValue="$500 - $1.2k" readOnly />
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
      <Input placeholder="Select date" readOnly />
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

export const Disabled: Story = {
  render: () => (
    <FormField label="Email" helperText="This field is disabled." disabled>
      <Input defaultValue="you@example.com" />
    </FormField>
  ),
}

export const RenderProp: Story = {
  render: () => (
    <FormField
      label="Task title"
      helperText="Render prop receives field state."
    >
      {(field) => (
        <Input
          placeholder="e.g. Fix leaking pipe"
          aria-invalid={field.invalid ? true : undefined}
        />
      )}
    </FormField>
  ),
}
