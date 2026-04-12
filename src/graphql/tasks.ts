import { gql } from '@apollo/client'

export const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      description
      address
      location {
        lat
        lng
        name
      }
      locationLat
      locationLng
      locationName
      dateTime
      category
      priceQuotePence
      paymentMethod
      contactMethod
      images
    }
  }
`

export const ADD_QUOTE = gql`
  mutation AddQuote($input: AddQuoteInput!) {
    addQuote(input: $input) {
      id
      pricePence
      message
    }
  }
`

export const TASKS_QUERY = gql`
  query Tasks(
    $lat: Float
    $lng: Float
    $radiusMiles: Float
    $search: String
    $category: TaskCategory
    $minPricePence: Int
    $maxPricePence: Int
    $dateTimeFrom: DateTime
    $dateTimeTo: DateTime
  ) {
    tasks(
      lat: $lat
      lng: $lng
      radiusMiles: $radiusMiles
      search: $search
      category: $category
      minPricePence: $minPricePence
      maxPricePence: $maxPricePence
      dateTimeFrom: $dateTimeFrom
      dateTimeTo: $dateTimeTo
    ) {
      id
      title
      description
      location {
        lat
        lng
        name
      }
      locationLat
      locationLng
      locationName
      status
      createdAt
      dateTime
      category
      priceQuotePence
      paymentMethod
      images
    }
  }
`

export const TASK_QUERY = gql`
  query Task($id: ID!) {
    task(id: $id) {
      id
      title
      description
      address
      location {
        lat
        lng
        name
      }
      locationLat
      locationLng
      locationName
      status
      workerUserId
      selectedQuoteId
      createdByUserId
      createdAt
      completedAt
      confirmedAt
      dateTime
      category
      priceQuotePence
      budgetRange {
        min
        max
      }
      paymentMethod
      contactMethod
      images
      availability {
        day
        slots
      }
      poster {
        id
        firstName
        lastName
        profile {
          name
        }
      }
      selectedQuote {
        id
        pricePence
        message
        workerUserId
        status
        createdAt
      }
      review {
        id
        rating
        comment
        createdAt
        workerUserId
        reviewer {
          id
          firstName
          lastName
          profile {
            name
          }
        }
      }
      comments {
        id
        body
        createdAt
        userId
      }
      quotes {
        id
        taskId
        pricePence
        message
        workerUserId
        status
        createdAt
      }
    }
  }
`

export const BROWSE_TASKS_QUERY = gql`
  query BrowseTasks(
    $lat: Float
    $lng: Float
    $radiusMiles: Float
    $search: String
    $category: TaskCategory
    $minPricePence: Int
    $maxPricePence: Int
    $dateTimeFrom: DateTime
    $dateTimeTo: DateTime
  ) {
    tasks(
      lat: $lat
      lng: $lng
      radiusMiles: $radiusMiles
      search: $search
      category: $category
      minPricePence: $minPricePence
      maxPricePence: $maxPricePence
      dateTimeFrom: $dateTimeFrom
      dateTimeTo: $dateTimeTo
    ) {
      id
      title
      description
      address
      location {
        lat
        lng
        name
      }
      locationLat
      locationLng
      locationName
      status
      priceQuotePence
      createdAt
      category
      images
    }
  }
`

export const MY_TASKS_QUERY = gql`
  query MyTasks($status: [TaskStatus!]) {
    myTasks(status: $status) {
      id
      title
      description
      address
      location {
        lat
        lng
        name
      }
      locationLat
      locationLng
      locationName
      status
      createdByUserId
      createdAt
      dateTime
      category
      priceQuotePence
      paymentMethod
      contactMethod
      images
      quotes {
        id
        taskId
        workerUserId
        pricePence
        message
        status
        createdAt
      }
    }
  }
`

export const ACCEPT_QUOTE_MUTATION = gql`
  mutation AcceptQuote($input: AcceptQuoteInput, $quoteId: ID) {
    acceptQuote(input: $input, quoteId: $quoteId) {
      id
      status
      selectedQuoteId
    }
  }
`

export const MAKE_QUOTE_MUTATION = gql`
  mutation MakeQuote($amount: Float!, $taskId: ID!, $message: String) {
    makeQuote(amount: $amount, taskId: $taskId, message: $message) {
      id
      pricePence
      message
      status
    }
  }
`

export const ADD_TASK_COMMENT_MUTATION = gql`
  mutation AddTaskComment($input: AddTaskCommentInput!) {
    addTaskComment(input: $input) {
      id
      body
      createdAt
      userId
    }
  }
`

export const CANCEL_TASK_MUTATION = gql`
  mutation CancelTask($taskId: ID!) {
    cancelTask(taskId: $taskId) {
      id
      status
    }
  }
`

export const COMPLETE_TASK_MUTATION = gql`
  mutation CompleteTask($taskId: ID!) {
    completeTask(taskId: $taskId) {
      id
      status
      completedAt
    }
  }
`

export const CONFIRM_TASK_MUTATION = gql`
  mutation ConfirmTask($taskId: ID!) {
    confirmTask(taskId: $taskId) {
      id
      status
      confirmedAt
    }
  }
`

export const MARK_TASK_COMPLETE_MUTATION = gql`
  mutation MarkTaskComplete($taskId: ID!) {
    markTaskComplete(taskId: $taskId) {
      id
      status
      completedAt
    }
  }
`
