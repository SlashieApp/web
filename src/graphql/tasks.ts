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
      priceOfferPence
      paymentMethod
      contactMethod
    }
  }
`

export const ADD_OFFER = gql`
  mutation AddOffer($input: AddOfferInput!) {
    addOffer(input: $input) {
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
      priceOfferPence
      paymentMethod
      contactMethod
      offers {
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
      createdByUserId
      createdAt
      dateTime
      category
      priceOfferPence
      paymentMethod
      contactMethod
      offers {
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
      priceOfferPence
      createdAt
      category
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
      priceOfferPence
      paymentMethod
      contactMethod
      offers {
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

export const TASK_WORKFLOW_QUERY = gql`
  query TaskWorkflow($id: ID!) {
    taskWorkflow(id: $id) {
      id
      status
      offers {
        id
        status
        pricePence
      }
    }
  }
`

export const ACCEPT_OFFER_MUTATION = gql`
  mutation AcceptOffer($input: AcceptOfferInput, $offerId: ID) {
    acceptOffer(input: $input, offerId: $offerId) {
      id
      status
      selectedOfferId
    }
  }
`

export const MAKE_OFFER_MUTATION = gql`
  mutation MakeOffer($amount: Float!, $taskId: ID!, $message: String) {
    makeOffer(amount: $amount, taskId: $taskId, message: $message) {
      id
      amount
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
