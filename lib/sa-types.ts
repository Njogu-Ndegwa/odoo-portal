// ============================================================================
// Serviced Account governance types
// ============================================================================

export type SARoleCode = 'admin' | 'staff' | 'agent'
export type SAMembershipState = 'active' | 'suspended' | 'revoked'
export type SAScopePolicy = 'sa_wide' | 'assigned_plus_unassigned' | 'assigned_only'
export type SAAccountClass = 'OVAC' | 'EXTC'
export type SAState = 'active' | 'inactive'

// The shape returned by GET /api/me/service-accounts → service_accounts[]
export interface ServiceAccount {
  id: number
  name: string
  account_class: SAAccountClass
  my_role: SARoleCode
  membership_state: SAMembershipState
  scope_policy: SAScopePolicy
}

export interface MyServiceAccountsResponse {
  success: boolean
  count: number
  auto_selected: boolean
  service_accounts: ServiceAccount[]
}

// Full SA detail from GET /api/service-accounts/<id>
export interface SADetail {
  id: number
  name: string
  account_class: SAAccountClass
  account_code: string | null
  state: SAState
  parent_id: number | null
  parent_name: string | null
  partner_id: number | null
  partner_name: string | null
  note: string | null
  child_ids: number[]
}

export interface SADetailResponse {
  success: boolean
  service_account: SADetail
}

// SA list from GET /api/service-accounts
export interface SAListResponse {
  success: boolean
  service_accounts: SADetail[]
  count: number
}

// SA create/update payloads
export interface SACreatePayload {
  parent_id: number
  partner_id: number
  account_class: SAAccountClass
  name: string
  account_code?: string
  state?: SAState
  initial_admin_partner_id?: number
}

export interface SAUpdatePayload {
  name?: string
  state?: SAState
  note?: string
}

export interface SAMutationResponse {
  success: boolean
  message?: string
  service_account?: SADetail
}

// SA members
export interface SAMemberPerson {
  id: number
  name: string
  email: string | false
  phone: string | false
}

export interface SAMember {
  id: number
  role_code: SARoleCode
  membership_state: SAMembershipState
  scope_policy: SAScopePolicy | null
  effective_from: string | false
  effective_to: string | false
  account_id: number
  person: SAMemberPerson
}

export interface SAMemberListResponse {
  success: boolean
  account_id: number
  total: number
  members: SAMember[]
}

export interface SAMemberAddPayload {
  person_partner_id: number
  role_code: SARoleCode
  membership_state?: SAMembershipState
  scope_policy?: SAScopePolicy
  effective_from?: string
  effective_to?: string
}

export interface SAMemberEnrollPayload {
  name: string
  email: string
  password?: string
  phone?: string
  role_code: SARoleCode
  employee_role: 'salesrep' | 'salesattendant'
}

export interface SAMemberUpdatePayload {
  role_code?: SARoleCode
  membership_state?: SAMembershipState
  scope_policy?: SAScopePolicy
}

export interface SAMemberMutationResponse {
  success: boolean
  message?: string
  member?: SAMember
}

export interface SAMemberEnrollResponse {
  success: boolean
  message?: string
  member?: SAMember
  generated_password?: string
}

// GET /api/service-accounts query params
export interface GetServiceAccountsParams {
  state?: SAState
  account_class?: SAAccountClass
  parent_id?: number
  is_root?: boolean
  search?: string
}

export interface GetSAMembersParams {
  membership_state?: SAMembershipState
}
