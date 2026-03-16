import { STORAGE_KEYS } from '@/lib/odoo-auth'

const ODOO_API_KEY =
  process.env.NEXT_PUBLIC_ODOO_API_KEY || 'abs_connector_secret_key_2024'

export function getSelectedSAIdFromStorage(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEYS.SA_ID)
}

export function buildOdooHeaders(authToken?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-API-KEY': ODOO_API_KEY,
  }
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`
  const saId = getSelectedSAIdFromStorage()
  if (saId) headers['X-SA-ID'] = saId
  return headers
}
