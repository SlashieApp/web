'use client'

import { TaskContactMethod } from '@codegen/schema'

import type { ContactOption } from '@/app/(dashboard)/profile/profileEligibility'
import { useI11n } from '@/i18n/useI11n'
import { Button, Link, RadioButtonGroup } from '@ui'

import bag from '../../../i11n.json'
import { CreateTaskSection } from '../../layout/shared/CreateTaskSection'

export type CreateTaskContactSectionProps = {
  /** Bare inside the create flow's step; a titled section on edit. */
  bare?: boolean
  sectionHeading?: string
  preferredContactMethod: TaskContactMethod
  onPreferredContactMethodChange: (value: TaskContactMethod) => void
  /** Which methods this account can use (verified phone / email). */
  contactOptions: ContactOption[]
}

/** How the accepted worker reaches you. Phone and email need verifying first. */
export function CreateTaskContactSection({
  bare = false,
  sectionHeading = '',
  preferredContactMethod,
  onPreferredContactMethodChange,
  contactOptions,
}: CreateTaskContactSectionProps) {
  const f = useI11n(bag).fields
  const enabled = (method: TaskContactMethod) =>
    method === TaskContactMethod.InApp ||
    Boolean(contactOptions.find((option) => option.value === method)?.enabled)
  const needsPhoneVerify =
    preferredContactMethod === TaskContactMethod.Phone &&
    !enabled(TaskContactMethod.Phone)

  return (
    <CreateTaskSection bare={bare} heading={sectionHeading} bodyGap={5}>
      <RadioButtonGroup
        label={f.contact}
        helperText={f.contactHelper}
        value={preferredContactMethod}
        options={[
          { value: TaskContactMethod.InApp, label: f.inApp },
          {
            value: TaskContactMethod.Phone,
            label: f.phone,
            disabled: !enabled(TaskContactMethod.Phone),
            disabledHint: f.phoneLocked,
          },
          {
            value: TaskContactMethod.Email,
            label: f.email,
            disabled: !enabled(TaskContactMethod.Email),
            disabledHint: f.emailLocked,
          },
        ]}
        onChange={onPreferredContactMethodChange}
      />

      {needsPhoneVerify ? (
        <Button asChild variant="secondary" alignSelf="flex-start">
          <Link href="/account" _hover={{ textDecoration: 'none' }}>
            {f.verifyPhone}
          </Link>
        </Button>
      ) : null}
    </CreateTaskSection>
  )
}
