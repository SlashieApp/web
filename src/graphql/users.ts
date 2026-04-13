import { gql } from '@apollo/client'

export const PROFESSIONAL_PROFILE_QUERY = gql`
  query ProfessionalProfile($id: ID!) {
    worker(id: $id) {
      id
      bio
      isVerified
      yearsExperience
      location {
        address
        lat
        lng
      }
    }
  }
`

export const SEARCH_PROFESSIONALS_QUERY = gql`
  query SearchProfessionals($location: String) {
    searchProfessionals(location: $location) {
      id
      bio
      user {
        id
        firstName
        lastName
      }
    }
  }
`

export const WORKER_QUERY = gql`
  query Worker($id: ID!) {
    worker(id: $id) {
      userId
    }
  }
`

export const REGISTER_AS_PRO_MUTATION = gql`
  mutation RegisterAsPro($input: ProRegistrationInput!) {
    registerAsPro(input: $input) {
      id
      userId
    }
  }
`

export const UPDATE_MY_PROFILE_MUTATION = gql`
  mutation UpdateMyProfile($input: UpdateMyProfileInput!) {
    updateMyProfile(input: $input) {
      id
      profile {
        name
        contactNumber
      }
    }
  }
`

export const UPDATE_MY_SETTINGS_MUTATION = gql`
  mutation UpdateMySettings($input: UpdateMySettingsInput!) {
    updateMySettings(input: $input) {
      id
      settings {
        isProfilePrivate
        marketingEmails
      }
    }
  }
`
