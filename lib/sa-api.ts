import { fetchWithRetry, parseOdooResponse } from '@/lib/odoo-api'
import { getSalesToken } from '@/lib/odoo-auth'
import type {
  MyServiceAccountsResponse,
  SAListResponse,
  SADetailResponse,
  SACreatePayload,
  SAUpdatePayload,
  SAMutationResponse,
  SAMemberListResponse,
  SAMemberAddPayload,
  SAMemberEnrollPayload,
  SAMemberUpdatePayload,
  SAMemberMutationResponse,
  SAMemberEnrollResponse,
  GetServiceAccountsParams,
  GetSAMembersParams,
} from '@/lib/sa-types'

const ODOO_BASE_URL =
  process.env.NEXT_PUBLIC_ODOO_API_URL || 'https://crm-omnivoltaic.odoo.com'
const ODOO_API_KEY =
  process.env.NEXT_PUBLIC_ODOO_API_KEY || 'abs_connector_secret_key_2024'

function headers(authToken?: string): HeadersInit {
  const h: HeadersInit = {
    'Content-Type': 'application/json',
    'X-API-KEY': ODOO_API_KEY,
  }
  if (authToken) h['Authorization'] = `Bearer ${authToken}`
  return h
}

function tokenOrThrow(token?: string): string {
  const t = token ?? getSalesToken()
  if (!t) throw new Error('Not authenticated')
  return t
}

// ============================================================================
// My Service Accounts (current user)
// ============================================================================

export async function fetchMyServiceAccounts(
  authToken?: string,
): Promise<MyServiceAccountsResponse> {
  const token = tokenOrThrow(authToken)
  const endpoint = '/api/me/service-accounts'
  const url = `${ODOO_BASE_URL}${endpoint}`
  const response = await fetchWithRetry(url, { method: 'GET', headers: headers(token) })
  return parseOdooResponse<MyServiceAccountsResponse>(response, endpoint)
}

// ============================================================================
// Service Account CRUD
// ============================================================================

export async function getServiceAccounts(
  params: GetServiceAccountsParams = {},
  authToken?: string,
): Promise<SAListResponse> {
  const token = tokenOrThrow(authToken)
  const qp = new URLSearchParams()
  if (params.state) qp.append('state', params.state)
  if (params.account_class) qp.append('account_class', params.account_class)
  if (params.parent_id !== undefined) qp.append('parent_id', String(params.parent_id))
  if (params.is_root !== undefined) qp.append('is_root', String(params.is_root))
  if (params.search) qp.append('search', params.search)

  const qs = qp.toString()
  const endpoint = `/api/service-accounts${qs ? `?${qs}` : ''}`
  const url = `${ODOO_BASE_URL}${endpoint}`
  const response = await fetchWithRetry(url, { method: 'GET', headers: headers(token) })
  return parseOdooResponse<SAListResponse>(response, endpoint)
}

export async function getServiceAccount(
  id: number,
  authToken?: string,
): Promise<SADetailResponse> {
  const token = tokenOrThrow(authToken)
  const endpoint = `/api/service-accounts/${id}`
  const url = `${ODOO_BASE_URL}${endpoint}`
  const response = await fetchWithRetry(url, { method: 'GET', headers: headers(token) })
  return parseOdooResponse<SADetailResponse>(response, endpoint)
}

export async function createServiceAccount(
  payload: SACreatePayload,
  authToken?: string,
): Promise<SAMutationResponse> {
  const token = tokenOrThrow(authToken)
  const endpoint = '/api/service-accounts'
  const url = `${ODOO_BASE_URL}${endpoint}`
  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(payload),
  })
  return parseOdooResponse<SAMutationResponse>(response, endpoint)
}

export async function updateServiceAccount(
  id: number,
  payload: SAUpdatePayload,
  authToken?: string,
): Promise<SAMutationResponse> {
  const token = tokenOrThrow(authToken)
  const endpoint = `/api/service-accounts/${id}`
  const url = `${ODOO_BASE_URL}${endpoint}`
  const response = await fetchWithRetry(url, {
    method: 'PATCH',
    headers: headers(token),
    body: JSON.stringify(payload),
  })
  return parseOdooResponse<SAMutationResponse>(response, endpoint)
}

export async function deleteServiceAccount(
  id: number,
  authToken?: string,
): Promise<SAMutationResponse> {
  const token = tokenOrThrow(authToken)
  const endpoint = `/api/service-accounts/${id}`
  const url = `${ODOO_BASE_URL}${endpoint}`
  const response = await fetchWithRetry(url, { method: 'DELETE', headers: headers(token) })
  return parseOdooResponse<SAMutationResponse>(response, endpoint)
}

// ============================================================================
// SA Members
// ============================================================================

export async function getMembers(
  saId: number,
  params: GetSAMembersParams = {},
  authToken?: string,
): Promise<SAMemberListResponse> {
  const token = tokenOrThrow(authToken)
  const qp = new URLSearchParams()
  if (params.membership_state) qp.append('membership_state', params.membership_state)

  const qs = qp.toString()
  const endpoint = `/api/service-accounts/${saId}/members${qs ? `?${qs}` : ''}`
  const url = `${ODOO_BASE_URL}${endpoint}`
  const response = await fetchWithRetry(url, { method: 'GET', headers: headers(token) })
  return parseOdooResponse<SAMemberListResponse>(response, endpoint)
}

export async function addMember(
  saId: number,
  payload: SAMemberAddPayload,
  authToken?: string,
): Promise<SAMemberMutationResponse> {
  const token = tokenOrThrow(authToken)
  const endpoint = `/api/service-accounts/${saId}/members`
  const url = `${ODOO_BASE_URL}${endpoint}`
  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(payload),
  })
  return parseOdooResponse<SAMemberMutationResponse>(response, endpoint)
}

export async function enrollMember(
  saId: number,
  payload: SAMemberEnrollPayload,
  authToken?: string,
): Promise<SAMemberEnrollResponse> {
  const token = tokenOrThrow(authToken)
  const endpoint = `/api/service-accounts/${saId}/members/enroll`
  const url = `${ODOO_BASE_URL}${endpoint}`
  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(payload),
  })
  return parseOdooResponse<SAMemberEnrollResponse>(response, endpoint)
}

export async function updateMember(
  saId: number,
  memberId: number,
  payload: SAMemberUpdatePayload,
  authToken?: string,
): Promise<SAMemberMutationResponse> {
  const token = tokenOrThrow(authToken)
  const endpoint = `/api/service-accounts/${saId}/members/${memberId}`
  const url = `${ODOO_BASE_URL}${endpoint}`
  const response = await fetchWithRetry(url, {
    method: 'PATCH',
    headers: headers(token),
    body: JSON.stringify(payload),
  })
  return parseOdooResponse<SAMemberMutationResponse>(response, endpoint)
}

export async function removeMember(
  saId: number,
  memberId: number,
  authToken?: string,
): Promise<SAMemberMutationResponse> {
  const token = tokenOrThrow(authToken)
  const endpoint = `/api/service-accounts/${saId}/members/${memberId}`
  const url = `${ODOO_BASE_URL}${endpoint}`
  const response = await fetchWithRetry(url, { method: 'DELETE', headers: headers(token) })
  return parseOdooResponse<SAMemberMutationResponse>(response, endpoint)
}
