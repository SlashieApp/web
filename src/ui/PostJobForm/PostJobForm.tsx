'use client'

import {
  Box,
  HStack,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react'

import { Button } from '../Button'
import { GlassCard } from '../Card/GlassCard'
import { FormField } from '../FormField/FormField'
import { TextInput } from '../Input'

export type PostJobOption = {
  value: string
  label: string
}

export type PostJobFormProps = {
  title: string
  description: string
  location: string
  dateTimeLocal: string
  category: string
  priceOfferPence: string
  paymentMethod: string
  contactMethod: string
  isSubmitting?: boolean
  error?: string | null
  paymentMethodOptions: readonly PostJobOption[]
  contactMethodOptions?: readonly PostJobOption[]
  categorySuggestions?: readonly string[]
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onLocationChange: (value: string) => void
  onDateTimeLocalChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onPriceOfferPenceChange: (value: string) => void
  onPaymentMethodChange: (value: string) => void
  onContactMethodChange: (value: string) => void
  onSubmit: () => void
}

const DEFAULT_CATEGORY_SUGGESTIONS = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Painting',
  'Cleaning',
] as const

const DEFAULT_CONTACT_OPTIONS = [
  { value: 'Phone', label: 'Phone' },
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Email', label: 'Email' },
] as const

type ChipProps = {
  active: boolean
  label: string
  onClick: () => void
}

function SelectChip({ active, label, onClick }: ChipProps) {
  return (
    <Button
      type="button"
      size="sm"
      variant="subtle"
      bg={active ? 'secondaryFixed' : 'surfaceContainerHigh'}
      color={active ? 'onSecondaryFixed' : 'fg'}
      boxShadow="none"
      _hover={{
        bg: active ? 'secondaryFixed' : 'surfaceContainerLowest',
      }}
      onClick={onClick}
    >
      {label}
    </Button>
  )
}

function toPoundAmountDisplay(priceOfferPence: string) {
  const parsed = Number.parseInt(priceOfferPence, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return '—'
  }

  return `£${(parsed / 100).toFixed(2)}`
}

export function PostJobForm({
  title,
  description,
  location,
  dateTimeLocal,
  category,
  priceOfferPence,
  paymentMethod,
  contactMethod,
  isSubmitting = false,
  error = null,
  paymentMethodOptions,
  contactMethodOptions = DEFAULT_CONTACT_OPTIONS,
  categorySuggestions = DEFAULT_CATEGORY_SUGGESTIONS,
  onTitleChange,
  onDescriptionChange,
  onLocationChange,
  onDateTimeLocalChange,
  onCategoryChange,
  onPriceOfferPenceChange,
  onPaymentMethodChange,
  onContactMethodChange,
  onSubmit,
}: PostJobFormProps) {
  return (
    <Stack gap={5}>
      <GlassCard p={{ base: 4, md: 6 }} bg="surfaceContainerHighest">
        <Stack gap={2}>
          <Text
            width="fit-content"
            px={3}
            py={1}
            borderRadius="full"
            bg="surfaceContainerLowest"
            color="primary.700"
            fontSize="xs"
            fontWeight={700}
            textTransform="uppercase"
            letterSpacing="0.06em"
          >
            Post a Job
          </Text>
          <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight={800}>
            Tell local pros what you need done
          </Text>
          <Text color="muted">
            Share the details below and nearby handymen can send you offers.
          </Text>
        </Stack>
      </GlassCard>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
        <GlassCard p={{ base: 4, md: 5 }} bg="surfaceContainerLowest">
          <Stack gap={4}>
            <Text fontSize="lg" fontWeight={700}>
              Job details
            </Text>

            <FormField label="Job title">
              <TextInput
                placeholder="e.g. Fix a leaky tap"
                value={title}
                onChange={(event) => onTitleChange(event.target.value)}
              />
            </FormField>

            <FormField
              label="Description"
              helperText="Include access details, measurements, and key constraints."
            >
              <Textarea
                minH="130px"
                placeholder="Describe the job clearly so professionals can quote accurately."
                bg="surfaceContainerLowest"
                borderWidth={0}
                boxShadow="ghostBorder"
                borderRadius="lg"
                value={description}
                onChange={(event) => onDescriptionChange(event.target.value)}
              />
            </FormField>

            <FormField label="Category">
              <Stack gap={2}>
                <TextInput
                  placeholder="e.g. Plumbing"
                  value={category}
                  onChange={(event) => onCategoryChange(event.target.value)}
                />
                <HStack wrap="wrap" gap={2}>
                  {categorySuggestions.map((suggestion) => (
                    <SelectChip
                      key={suggestion}
                      label={suggestion}
                      active={category === suggestion}
                      onClick={() => onCategoryChange(suggestion)}
                    />
                  ))}
                </HStack>
              </Stack>
            </FormField>
          </Stack>
        </GlassCard>

        <GlassCard p={{ base: 4, md: 5 }} bg="surfaceContainerLowest">
          <Stack gap={4}>
            <Text fontSize="lg" fontWeight={700}>
              Location, schedule and budget
            </Text>

            <FormField label="Location (optional)">
              <TextInput
                placeholder="e.g. Hackney, London"
                value={location}
                onChange={(event) => onLocationChange(event.target.value)}
              />
            </FormField>

            <FormField
              label="When should the job happen?"
              helperText="Choose your preferred date and time."
            >
              <TextInput
                type="datetime-local"
                value={dateTimeLocal}
                onChange={(event) => onDateTimeLocalChange(event.target.value)}
              />
            </FormField>

            <FormField
              label="Expected budget (pence)"
              helperText={`Current amount: ${toPoundAmountDisplay(priceOfferPence)}`}
            >
              <TextInput
                type="number"
                min={1}
                placeholder="e.g. 4500"
                value={priceOfferPence}
                onChange={(event) =>
                  onPriceOfferPenceChange(event.target.value)
                }
              />
            </FormField>

            <FormField label="Payment method">
              <HStack wrap="wrap" gap={2}>
                {paymentMethodOptions.map((option) => (
                  <SelectChip
                    key={option.value}
                    label={option.label}
                    active={paymentMethod === option.value}
                    onClick={() => onPaymentMethodChange(option.value)}
                  />
                ))}
              </HStack>
            </FormField>

            <FormField label="Preferred contact method">
              <Stack gap={2}>
                <HStack wrap="wrap" gap={2}>
                  {contactMethodOptions.map((option) => (
                    <SelectChip
                      key={option.value}
                      label={option.label}
                      active={contactMethod === option.value}
                      onClick={() => onContactMethodChange(option.value)}
                    />
                  ))}
                </HStack>
                <TextInput
                  placeholder="or type your preference"
                  value={contactMethod}
                  onChange={(event) =>
                    onContactMethodChange(event.target.value)
                  }
                />
              </Stack>
            </FormField>
          </Stack>
        </GlassCard>
      </SimpleGrid>

      <GlassCard p={{ base: 4, md: 5 }} bg="surfaceContainerLowest">
        <Stack gap={3}>
          <Box bg="surfaceContainerLow" borderRadius="md" px={4} py={3}>
            <Text fontWeight={600} fontSize="sm">
              Tip: clear details usually get faster and better quotes.
            </Text>
          </Box>

          <Button loading={isSubmitting} onClick={onSubmit} size="lg">
            Post job request
          </Button>

          {error ? (
            <Text color="red.400" fontSize="sm">
              {error}
            </Text>
          ) : null}
        </Stack>
      </GlassCard>
    </Stack>
  )
}
