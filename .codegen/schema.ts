export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
};

export type AcceptOfferInput = {
  location?: InputMaybe<LocationInput>;
  preferredDate?: InputMaybe<Scalars['DateTime']['input']>;
};

export type AddOfferInput = {
  message?: InputMaybe<Scalars['String']['input']>;
  pricePence: Scalars['Int']['input'];
  taskId: Scalars['ID']['input'];
};

export type AddReviewInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  rating: Scalars['Int']['input'];
  taskId: Scalars['ID']['input'];
};

export type AddTaskCommentInput = {
  body: Scalars['String']['input'];
  taskId: Scalars['ID']['input'];
};

export type AuthPayload = {
  token: Scalars['String']['output'];
  user: User;
};

export enum Bucket {
  TaskImages = 'TASK_IMAGES'
}

export enum BudgetUnit {
  Gbp = 'GBP',
  Usd = 'USD'
}

export type Category = {
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type CreateTaskInput = {
  address: Scalars['String']['input'];
  availability: Array<DayAvailabilityInput>;
  budget: Scalars['Float']['input'];
  budgetUnit: BudgetUnit;
  category: TaskCategory;
  description: Scalars['String']['input'];
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  location: LocationInput;
  paymentMethod: TaskPaymentMethod;
  preferredContactMethod: TaskContactMethod;
  preferredDateTime: Scalars['DateTime']['input'];
  title: Scalars['String']['input'];
};

export type DayAvailabilityInput = {
  day: DayOfWeek;
  slots: Array<Scalars['String']['input']>;
};

export enum DayOfWeek {
  Fri = 'FRI',
  Mon = 'MON',
  Sat = 'SAT',
  Sun = 'SUN',
  Thu = 'THU',
  Tue = 'TUE',
  Wed = 'WED'
}

export type Endorsement = {
  comment?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
};

export type ForgotPasswordPayload = {
  resetToken?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type Location = {
  address?: Maybe<Scalars['String']['output']>;
  lat?: Maybe<Scalars['Float']['output']>;
  lng?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type LocationInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  lat?: InputMaybe<Scalars['Float']['input']>;
  lng?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type LoginInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  method?: InputMaybe<LoginMethod>;
  oauthToken?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
};

export enum LoginMethod {
  Apple = 'APPLE',
  Google = 'GOOGLE',
  Password = 'PASSWORD'
}

export type Mutation = {
  acceptOffer: Task;
  addOffer: Offer;
  addReview: Review;
  addTaskComment: TaskComment;
  cancelTask: Task;
  completeTask: Task;
  confirmTask: Task;
  createTask: Task;
  endorseProfessional: Endorsement;
  forgotPassword: ForgotPasswordPayload;
  login: AuthPayload;
  loginWithMethod: AuthPayload;
  makeOffer: Offer;
  markTaskComplete: Task;
  rateProfessional: Review;
  register: AuthPayload;
  registerAsPro: Worker;
  resetPassword: AuthPayload;
  updateMyMembership: UserMembership;
  updateMyProfile: User;
  updateMySettings: User;
  upgradeToProMembership: Worker;
};


export type MutationAcceptOfferArgs = {
  input?: InputMaybe<AcceptOfferInput>;
  offerId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationAddOfferArgs = {
  input: AddOfferInput;
};


export type MutationAddReviewArgs = {
  input: AddReviewInput;
};


export type MutationAddTaskCommentArgs = {
  input: AddTaskCommentInput;
};


export type MutationCancelTaskArgs = {
  taskId: Scalars['ID']['input'];
};


export type MutationCompleteTaskArgs = {
  taskId: Scalars['ID']['input'];
};


export type MutationConfirmTaskArgs = {
  taskId: Scalars['ID']['input'];
};


export type MutationCreateTaskArgs = {
  input: CreateTaskInput;
};


export type MutationEndorseProfessionalArgs = {
  comment?: InputMaybe<Scalars['String']['input']>;
  professionalId: Scalars['ID']['input'];
  skillId: Scalars['ID']['input'];
};


export type MutationForgotPasswordArgs = {
  email: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  method?: InputMaybe<LoginMethod>;
  password: Scalars['String']['input'];
};


export type MutationLoginWithMethodArgs = {
  input: LoginInput;
};


export type MutationMakeOfferArgs = {
  amount: Scalars['Float']['input'];
  message?: InputMaybe<Scalars['String']['input']>;
  taskId: Scalars['ID']['input'];
};


export type MutationMarkTaskCompleteArgs = {
  taskId: Scalars['ID']['input'];
};


export type MutationRateProfessionalArgs = {
  input: RateProfessionalInput;
};


export type MutationRegisterArgs = {
  contactNumber?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
};


export type MutationRegisterAsProArgs = {
  input: ProRegistrationInput;
};


export type MutationResetPasswordArgs = {
  newPassword: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


export type MutationUpdateMyMembershipArgs = {
  input: UpdateMyMembershipInput;
};


export type MutationUpdateMyProfileArgs = {
  input: UpdateMyProfileInput;
};


export type MutationUpdateMySettingsArgs = {
  input: UpdateMySettingsInput;
};

export type Offer = {
  amount?: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  message?: Maybe<Scalars['String']['output']>;
  pricePence: Scalars['Int']['output'];
  status: OfferStatus;
  taskId: Scalars['ID']['output'];
  workerUserId: Scalars['ID']['output'];
};

export enum OfferStatus {
  Accepted = 'ACCEPTED',
  Declined = 'DECLINED',
  Pending = 'PENDING',
  Rejected = 'REJECTED',
  Withdrawn = 'WITHDRAWN'
}

export type ProRegistrationInput = {
  bio?: InputMaybe<Scalars['String']['input']>;
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  location: LocationInput;
  skills?: InputMaybe<Array<Scalars['String']['input']>>;
  tagline?: InputMaybe<Scalars['String']['input']>;
  yearsExperience?: InputMaybe<Scalars['Int']['input']>;
};

export type Profile = {
  avatarUrl?: Maybe<Scalars['String']['output']>;
  contactNumber?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  categories: Array<Category>;
  getS3UploadUrl: S3UploadUrlPayload;
  health: Scalars['String']['output'];
  me: User;
  myTasks: Array<Task>;
  searchProfessionals: Array<Worker>;
  task?: Maybe<Task>;
  taskWorkflow?: Maybe<Task>;
  tasks: Array<Task>;
  worker?: Maybe<Worker>;
};


export type QueryGetS3UploadUrlArgs = {
  bucket: Bucket;
  index?: InputMaybe<Scalars['Int']['input']>;
  key: Scalars['String']['input'];
};


export type QueryMyTasksArgs = {
  status?: InputMaybe<Array<TaskStatus>>;
};


export type QuerySearchProfessionalsArgs = {
  location?: InputMaybe<Scalars['String']['input']>;
  skill?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTaskArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTaskWorkflowArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTasksArgs = {
  category?: InputMaybe<TaskCategory>;
  dateTimeFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTimeTo?: InputMaybe<Scalars['DateTime']['input']>;
  lat?: InputMaybe<Scalars['Float']['input']>;
  lng?: InputMaybe<Scalars['Float']['input']>;
  maxPricePence?: InputMaybe<Scalars['Int']['input']>;
  minPricePence?: InputMaybe<Scalars['Int']['input']>;
  radiusMiles?: InputMaybe<Scalars['Float']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryWorkerArgs = {
  id: Scalars['ID']['input'];
};

export type RateProfessionalInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  communicationRating?: InputMaybe<Scalars['Int']['input']>;
  highlights?: InputMaybe<Array<Scalars['String']['input']>>;
  professionalId?: InputMaybe<Scalars['ID']['input']>;
  punctualityRating?: InputMaybe<Scalars['Int']['input']>;
  rating?: InputMaybe<Scalars['Int']['input']>;
  taskId?: InputMaybe<Scalars['ID']['input']>;
  workQualityRating?: InputMaybe<Scalars['Int']['input']>;
};

export type Review = {
  comment?: Maybe<Scalars['String']['output']>;
  communicationRating?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  punctualityRating?: Maybe<Scalars['Int']['output']>;
  rating: Scalars['Int']['output'];
  workQualityRating?: Maybe<Scalars['Int']['output']>;
};

export type S3UploadUrlPayload = {
  url: Scalars['String']['output'];
};

export type Skill = {
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type Task = {
  address?: Maybe<Scalars['String']['output']>;
  category: TaskCategory;
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  confirmedAt?: Maybe<Scalars['DateTime']['output']>;
  contactMethod?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  createdByUserId?: Maybe<Scalars['ID']['output']>;
  dateTime?: Maybe<Scalars['DateTime']['output']>;
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  location?: Maybe<Location>;
  locationLat?: Maybe<Scalars['Float']['output']>;
  locationLng?: Maybe<Scalars['Float']['output']>;
  locationName?: Maybe<Scalars['String']['output']>;
  offers: Array<Offer>;
  paymentMethod?: Maybe<TaskPaymentMethod>;
  priceOfferPence?: Maybe<Scalars['Int']['output']>;
  selectedOfferId?: Maybe<Scalars['ID']['output']>;
  status: TaskStatus;
  title: Scalars['String']['output'];
};

export enum TaskCategory {
  Electrical = 'ELECTRICAL',
  Gardening = 'GARDENING',
  Painting = 'PAINTING',
  Plumbing = 'PLUMBING'
}

export type TaskComment = {
  body: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  userId: Scalars['ID']['output'];
};

export enum TaskContactMethod {
  Email = 'EMAIL',
  InApp = 'IN_APP',
  Phone = 'PHONE'
}

export enum TaskPaymentMethod {
  BankTransfer = 'BANK_TRANSFER',
  Cash = 'CASH'
}

export enum TaskStatus {
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  InProgress = 'IN_PROGRESS',
  Open = 'OPEN',
  Posted = 'POSTED',
  Published = 'PUBLISHED'
}

export type UpdateMyMembershipInput = {
  tier?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateMyProfileInput = {
  contactNumber?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateMySettingsInput = {
  isProfilePrivate?: InputMaybe<Scalars['Boolean']['input']>;
  marketingEmails?: InputMaybe<Scalars['Boolean']['input']>;
};

export type User = {
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  email: Scalars['String']['output'];
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  profile?: Maybe<Profile>;
  settings?: Maybe<UserSettings>;
};

export type UserMembership = {
  isPaid: Scalars['Boolean']['output'];
  renewsAt?: Maybe<Scalars['DateTime']['output']>;
  tier?: Maybe<Scalars['String']['output']>;
};

export type UserSettings = {
  isProfilePrivate?: Maybe<Scalars['Boolean']['output']>;
  marketingEmails?: Maybe<Scalars['Boolean']['output']>;
};

export type Worker = {
  bio?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isPaid?: Maybe<Scalars['Boolean']['output']>;
  isProMember?: Maybe<Scalars['Boolean']['output']>;
  isVerified?: Maybe<Scalars['Boolean']['output']>;
  location?: Maybe<Location>;
  rating?: Maybe<Scalars['Float']['output']>;
  renewsAt?: Maybe<Scalars['DateTime']['output']>;
  reviewCount?: Maybe<Scalars['Int']['output']>;
  skills?: Maybe<Array<Skill>>;
  tier?: Maybe<Scalars['String']['output']>;
  user?: Maybe<User>;
  userId?: Maybe<Scalars['ID']['output']>;
  yearsExperience?: Maybe<Scalars['Int']['output']>;
};

export type RegisterMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type RegisterMutation = { register: { token: string, user: { id: string, email: string } } };

export type LoginMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginMutation = { login: { token: string, user: { id: string, email: string } } };

export type LoginWithMethodMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginWithMethodMutation = { loginWithMethod: { token: string, user: { id: string, email: string } } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: { id: string, email: string, createdAt?: any | null } };

export type HealthQueryVariables = Exact<{ [key: string]: never; }>;


export type HealthQuery = { health: string };

export type ForgotPasswordMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type ForgotPasswordMutation = { forgotPassword: { success: boolean, resetToken?: string | null } };

export type ResetPasswordMutationVariables = Exact<{
  token: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
}>;


export type ResetPasswordMutation = { resetPassword: { token: string, user: { id: string, email: string } } };

export type CategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type CategoriesQuery = { categories: Array<{ id: string, name: string, createdAt: any }> };

export type AddReviewMutationVariables = Exact<{
  input: AddReviewInput;
}>;


export type AddReviewMutation = { addReview: { id: string, rating: number, comment?: string | null, createdAt: any } };

export type EndorseProfessionalMutationVariables = Exact<{
  comment?: InputMaybe<Scalars['String']['input']>;
  professionalId: Scalars['ID']['input'];
  skillId: Scalars['ID']['input'];
}>;


export type EndorseProfessionalMutation = { endorseProfessional: { id: string, comment?: string | null, createdAt: any } };

export type RateProfessionalMutationVariables = Exact<{
  input: RateProfessionalInput;
}>;


export type RateProfessionalMutation = { rateProfessional: { id: string, rating: number, comment?: string | null, communicationRating?: number | null, punctualityRating?: number | null, workQualityRating?: number | null } };

export type GetS3UploadUrlQueryVariables = Exact<{
  bucket: Bucket;
  key: Scalars['String']['input'];
  index?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetS3UploadUrlQuery = { getS3UploadUrl: { url: string } };

export type CreateTaskMutationVariables = Exact<{
  input: CreateTaskInput;
}>;


export type CreateTaskMutation = { createTask: { id: string, title: string, description: string, address?: string | null, locationLat?: number | null, locationLng?: number | null, locationName?: string | null, dateTime?: any | null, category: TaskCategory, priceOfferPence?: number | null, paymentMethod?: TaskPaymentMethod | null, contactMethod?: string | null, location?: { lat?: number | null, lng?: number | null, name?: string | null } | null } };

export type AddOfferMutationVariables = Exact<{
  input: AddOfferInput;
}>;


export type AddOfferMutation = { addOffer: { id: string, pricePence: number, message?: string | null } };

export type TasksQueryVariables = Exact<{
  lat?: InputMaybe<Scalars['Float']['input']>;
  lng?: InputMaybe<Scalars['Float']['input']>;
  radiusMiles?: InputMaybe<Scalars['Float']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<TaskCategory>;
  minPricePence?: InputMaybe<Scalars['Int']['input']>;
  maxPricePence?: InputMaybe<Scalars['Int']['input']>;
  dateTimeFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTimeTo?: InputMaybe<Scalars['DateTime']['input']>;
}>;


export type TasksQuery = { tasks: Array<{ id: string, title: string, description: string, address?: string | null, locationLat?: number | null, locationLng?: number | null, locationName?: string | null, status: TaskStatus, createdByUserId?: string | null, createdAt: any, dateTime?: any | null, category: TaskCategory, priceOfferPence?: number | null, paymentMethod?: TaskPaymentMethod | null, contactMethod?: string | null, location?: { lat?: number | null, lng?: number | null, name?: string | null } | null, offers: Array<{ id: string, taskId: string, workerUserId: string, pricePence: number, message?: string | null, status: OfferStatus, createdAt: any }> }> };

export type TaskQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type TaskQuery = { task?: { id: string, title: string, description: string, address?: string | null, locationLat?: number | null, locationLng?: number | null, locationName?: string | null, status: TaskStatus, createdByUserId?: string | null, createdAt: any, dateTime?: any | null, category: TaskCategory, priceOfferPence?: number | null, paymentMethod?: TaskPaymentMethod | null, contactMethod?: string | null, location?: { lat?: number | null, lng?: number | null, name?: string | null } | null, offers: Array<{ id: string, taskId: string, pricePence: number, message?: string | null, workerUserId: string, status: OfferStatus, createdAt: any }> } | null };

export type BrowseTasksQueryVariables = Exact<{
  lat?: InputMaybe<Scalars['Float']['input']>;
  lng?: InputMaybe<Scalars['Float']['input']>;
  radiusMiles?: InputMaybe<Scalars['Float']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<TaskCategory>;
  minPricePence?: InputMaybe<Scalars['Int']['input']>;
  maxPricePence?: InputMaybe<Scalars['Int']['input']>;
  dateTimeFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTimeTo?: InputMaybe<Scalars['DateTime']['input']>;
}>;


export type BrowseTasksQuery = { tasks: Array<{ id: string, title: string, description: string, address?: string | null, locationLat?: number | null, locationLng?: number | null, locationName?: string | null, status: TaskStatus, priceOfferPence?: number | null, createdAt: any, category: TaskCategory, location?: { lat?: number | null, lng?: number | null, name?: string | null } | null }> };

export type MyTasksQueryVariables = Exact<{
  status?: InputMaybe<Array<TaskStatus> | TaskStatus>;
}>;


export type MyTasksQuery = { myTasks: Array<{ id: string, title: string, description: string, address?: string | null, locationLat?: number | null, locationLng?: number | null, locationName?: string | null, status: TaskStatus, createdByUserId?: string | null, createdAt: any, dateTime?: any | null, category: TaskCategory, priceOfferPence?: number | null, paymentMethod?: TaskPaymentMethod | null, contactMethod?: string | null, location?: { lat?: number | null, lng?: number | null, name?: string | null } | null, offers: Array<{ id: string, taskId: string, workerUserId: string, pricePence: number, message?: string | null, status: OfferStatus, createdAt: any }> }> };

export type TaskWorkflowQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type TaskWorkflowQuery = { taskWorkflow?: { id: string, status: TaskStatus, offers: Array<{ id: string, status: OfferStatus, pricePence: number }> } | null };

export type AcceptOfferMutationVariables = Exact<{
  input?: InputMaybe<AcceptOfferInput>;
  offerId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type AcceptOfferMutation = { acceptOffer: { id: string, status: TaskStatus, selectedOfferId?: string | null } };

export type MakeOfferMutationVariables = Exact<{
  amount: Scalars['Float']['input'];
  taskId: Scalars['ID']['input'];
  message?: InputMaybe<Scalars['String']['input']>;
}>;


export type MakeOfferMutation = { makeOffer: { id: string, amount?: number | null, message?: string | null, status: OfferStatus } };

export type AddTaskCommentMutationVariables = Exact<{
  input: AddTaskCommentInput;
}>;


export type AddTaskCommentMutation = { addTaskComment: { id: string, body: string, createdAt: any, userId: string } };

export type CancelTaskMutationVariables = Exact<{
  taskId: Scalars['ID']['input'];
}>;


export type CancelTaskMutation = { cancelTask: { id: string, status: TaskStatus } };

export type CompleteTaskMutationVariables = Exact<{
  taskId: Scalars['ID']['input'];
}>;


export type CompleteTaskMutation = { completeTask: { id: string, status: TaskStatus, completedAt?: any | null } };

export type ConfirmTaskMutationVariables = Exact<{
  taskId: Scalars['ID']['input'];
}>;


export type ConfirmTaskMutation = { confirmTask: { id: string, status: TaskStatus, confirmedAt?: any | null } };

export type MarkTaskCompleteMutationVariables = Exact<{
  taskId: Scalars['ID']['input'];
}>;


export type MarkTaskCompleteMutation = { markTaskComplete: { id: string, status: TaskStatus, completedAt?: any | null } };

export type ProfessionalProfileQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ProfessionalProfileQuery = { worker?: { id: string, bio?: string | null, isVerified?: boolean | null, rating?: number | null, reviewCount?: number | null, yearsExperience?: number | null, location?: { address?: string | null, lat?: number | null, lng?: number | null } | null, skills?: Array<{ id: string, name: string }> | null } | null };

export type SearchProfessionalsQueryVariables = Exact<{
  location?: InputMaybe<Scalars['String']['input']>;
  skill?: InputMaybe<Scalars['String']['input']>;
}>;


export type SearchProfessionalsQuery = { searchProfessionals: Array<{ id: string, bio?: string | null, rating?: number | null, reviewCount?: number | null, user?: { id: string, firstName?: string | null, lastName?: string | null } | null }> };

export type WorkerQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type WorkerQuery = { worker?: { userId?: string | null, rating?: number | null, reviewCount?: number | null } | null };

export type RegisterAsProMutationVariables = Exact<{
  input: ProRegistrationInput;
}>;


export type RegisterAsProMutation = { registerAsPro: { id: string, isProMember?: boolean | null } };

export type UpdateMyMembershipMutationVariables = Exact<{
  input: UpdateMyMembershipInput;
}>;


export type UpdateMyMembershipMutation = { updateMyMembership: { isPaid: boolean, tier?: string | null, renewsAt?: any | null } };

export type UpdateMyProfileMutationVariables = Exact<{
  input: UpdateMyProfileInput;
}>;


export type UpdateMyProfileMutation = { updateMyProfile: { id: string, profile?: { name?: string | null, contactNumber?: string | null } | null } };

export type UpdateMySettingsMutationVariables = Exact<{
  input: UpdateMySettingsInput;
}>;


export type UpdateMySettingsMutation = { updateMySettings: { id: string, settings?: { isProfilePrivate?: boolean | null, marketingEmails?: boolean | null } | null } };

export type UpgradeToProMembershipMutationVariables = Exact<{ [key: string]: never; }>;


export type UpgradeToProMembershipMutation = { upgradeToProMembership: { id: string, isProMember?: boolean | null } };
