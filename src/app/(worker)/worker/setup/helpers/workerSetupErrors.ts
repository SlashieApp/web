import {
  getFriendlyErrorMessage,
  pickGraphQLError,
} from '@/utils/graphqlErrors'

const SETUP_ERROR_MESSAGES: Record<string, string> = {
  INVALID_SETUP_SUB_STEP:
    'That setup step is not valid. Refresh and try again.',
  INVALID_NAME: 'Enter your first and last name.',
  AVATAR_REQUIRED: 'Add a profile photo before continuing.',
  SKILLS_REQUIRED: 'List at least one skill or service you offer.',
  YEARS_EXPERIENCE_REQUIRED: 'Enter your years of experience.',
  LOCATION_REQUIRED:
    "We couldn't find that place. Try a city name or full postcode.",
  LOCATION_LABEL_REQUIRED: 'Add your primary service area.',
  PHONE_NOT_VERIFIED: 'Verify your phone number before continuing.',
  WORKER_SETUP_INCOMPLETE: 'Finish worker setup before quoting on tasks.',
  WORKER_PROFILE_INCOMPLETE:
    'Complete your profile requirements before finishing setup.',
}

const MISSING_REQUIREMENT_MESSAGES: Record<string, string> = {
  VERIFIED_CONTACT_METHOD: 'Verify your phone number in the contact step.',
  AVATAR: 'Add a profile photo in the profile step.',
  DATE_OF_BIRTH: 'Add your date of birth in personal details.',
  AGE_REQUIREMENT: 'You must be at least 18 years old to work on Slashie.',
}

export function getWorkerSetupErrorMessage(
  error: unknown,
  fallback: string,
): string {
  const graphQLError = pickGraphQLError(error)
  const code = graphQLError?.extensions?.code
  if (typeof code === 'string' && SETUP_ERROR_MESSAGES[code]) {
    if (code === 'WORKER_PROFILE_INCOMPLETE' && graphQLError) {
      const missing = graphQLError.extensions?.missing
      if (Array.isArray(missing) && missing.length > 0) {
        const lines = missing
          .map((item) =>
            typeof item === 'string'
              ? MISSING_REQUIREMENT_MESSAGES[item]
              : null,
          )
          .filter(Boolean)
        if (lines.length > 0) return lines.join(' ')
      }
    }
    return SETUP_ERROR_MESSAGES[code]
  }
  return getFriendlyErrorMessage(error, fallback)
}
