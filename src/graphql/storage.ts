import { gql } from '@apollo/client'

export const GET_S3_UPLOAD_URL_QUERY = gql`
  query GetTaskS3Upload($taskId: ID!, $index: String!) {
    getTaskS3Upload(taskId: $taskId, index: $index) {
      url
    }
  }
`
