'use client'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'

import {
  SKILLS_MAX,
  SKILLS_MIN,
  SKILL_RULES,
} from '../../../helpers/workerSetupSkills'
import bag from '../../../i11n.json'
import { WorkerSetupChipsField } from './WorkerSetupChipsField'

export type WorkerSetupSkillsInputProps = {
  value: string[]
  onChange: (skills: string[]) => void
  /** The trade's skills; general ones until a trade is chosen. */
  suggestions?: readonly string[]
  errorText?: string
}

/** Skills as chips: 3 to 12, the same `string[]` the API takes. */
export function WorkerSetupSkillsInput({
  value,
  onChange,
  suggestions,
  errorText,
}: WorkerSetupSkillsInputProps) {
  const copy = useI11n(bag).skills
  return (
    <WorkerSetupChipsField
      label={copy.label}
      helperText={formatMessage(copy.helper, { min: SKILLS_MIN })}
      errorText={errorText}
      value={value}
      onChange={onChange}
      rules={SKILL_RULES}
      suggestions={suggestions?.length ? suggestions : copy.defaults}
      suggestionsLabel={copy.suggestions}
      countText={formatMessage(copy.count, {
        count: value.length,
        max: SKILLS_MAX,
        min: SKILLS_MIN,
      })}
      copy={copy}
    />
  )
}
