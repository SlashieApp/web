import { gql } from '@apollo/client'

export const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $password: String!) {
    register(email: $email, password: $password) {
      token
      user {
        id
        email
      }
    }
  }
`

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
      }
    }
  }
`

export const LOGIN_WITH_METHOD_MUTATION = gql`
  mutation LoginWithMethod($input: LoginInput!) {
    loginWithMethod(input: $input) {
      token
      user {
        id
        email
      }
    }
  }
`

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      createdAt
      firstName
      lastName
      enabledLoginMethods
      profile {
        name
        contactNumber
        avatarUrl
      }
    }
  }
`

export const HEALTH_QUERY = gql`
  query Health {
    health
  }
`

export const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      success
      resetToken
    }
  }
`

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword) {
      token
      user {
        id
        email
      }
    }
  }
`
