import {
  getContacts,
  getContactById as apiGetContactById,
  updateContact as apiUpdateContact,
  createContact as apiCreateContact,
  deleteContact as apiDeleteContact,
  getEmployees as apiGetEmployees,
  assignContactToEmployee as apiAssignContact,
  type OdooContact,
  type OdooEmployee,
  type ContactWritePayload,
} from '@/lib/odoo-api';

// ============================================================================
// Types
// ============================================================================

export interface ExistingCustomer {
  id: number;
  partnerId: number;
  name: string;
  email: string;
  phone: string;
  mobile: string;
  street: string;
  city: string;
  zip: string;
  createdAt: string;
  isCompany: boolean;
  companyName: string;
  companyId: number | null;
}

export interface CustomerListResponse {
  success: boolean;
  customers: ExistingCustomer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CustomerDetailResponse {
  success: boolean;
  customer: ExistingCustomer;
}

export interface CustomerUpdateResponse {
  success: boolean;
  customer: ExistingCustomer;
  message: string;
}

// ============================================================================
// Mapping helper
// ============================================================================

function mapContact(c: OdooContact): ExistingCustomer {
  return {
    id: c.id,
    partnerId: c.id,
    name: c.name || '',
    email: c.email || '',
    phone: c.phone || '',
    mobile: c.mobile || '',
    street: c.street || '',
    city: c.city || '',
    zip: c.zip || '',
    createdAt: c.create_date || '',
    isCompany: c.is_company ?? false,
    companyName: c.company_name || '',
    companyId: c.company_id ?? null,
  };
}

// ============================================================================
// API Functions
// ============================================================================

export async function searchCustomers(
  query: string,
  authToken: string
): Promise<CustomerListResponse> {
  const trimmed = query.trim();
  const result = await getContacts(
    trimmed ? { q: trimmed } : { limit: 50 },
    authToken
  );

  return {
    success: true,
    customers: result.contacts.map(mapContact),
    total: result.pagination.total_records,
    page: result.pagination.current_page,
    limit: result.pagination.per_page,
    totalPages: result.pagination.total_pages,
    hasNextPage: result.pagination.has_next_page,
    hasPreviousPage: result.pagination.has_previous_page,
  };
}

export interface CustomerFilters {
  type?: 'all' | 'company' | 'individual';
  created_after?: string;
  created_before?: string;
  updated_after?: string;
  updated_before?: string;
  all_company?: boolean;
  strict?: boolean;
  company_id?: number;
}

export async function getAllCustomers(
  page: number = 1,
  limit: number = 20,
  authToken: string,
  filters: CustomerFilters = {}
): Promise<CustomerListResponse> {
  const result = await getContacts(
    { page, limit, type: filters.type || 'all', ...filters },
    authToken
  );

  return {
    success: true,
    customers: result.contacts.map(mapContact),
    total: result.pagination.total_records,
    page: result.pagination.current_page,
    limit: result.pagination.per_page,
    totalPages: result.pagination.total_pages,
    hasNextPage: result.pagination.has_next_page,
    hasPreviousPage: result.pagination.has_previous_page,
  };
}

export async function getCustomerById(
  id: number,
  authToken: string
): Promise<CustomerDetailResponse> {
  const result = await apiGetContactById(id, authToken);
  return {
    success: true,
    customer: mapContact(result.contact),
  };
}

export async function updateCustomer(
  id: number,
  data: Partial<Omit<ExistingCustomer, 'id' | 'partnerId' | 'createdAt'>>,
  authToken: string
): Promise<CustomerUpdateResponse> {
  const payload: ContactWritePayload = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.email !== undefined) payload.email = data.email;
  if (data.phone !== undefined) payload.phone = data.phone;
  if (data.street !== undefined) payload.street = data.street;
  if (data.city !== undefined) payload.city = data.city;
  if (data.zip !== undefined) payload.zip = data.zip;

  const result = await apiUpdateContact(id, payload, authToken);
  return {
    success: true,
    customer: mapContact(result.contact),
    message: result.message || 'Customer updated successfully',
  };
}

export async function createCustomer(
  data: {
    name: string;
    email?: string;
    phone?: string;
    mobile?: string;
    street?: string;
    city?: string;
    zip?: string;
    is_company?: boolean;
    company_id?: number;
  },
  authToken: string
): Promise<CustomerDetailResponse> {
  const payload: ContactWritePayload = {
    name: data.name,
    email: data.email || undefined,
    phone: data.phone || undefined,
    mobile: data.mobile || undefined,
    street: data.street || undefined,
    city: data.city || undefined,
    zip: data.zip || undefined,
    is_company: data.is_company,
    company_id: data.company_id,
  };

  const result = await apiCreateContact(payload, authToken);
  return {
    success: true,
    customer: mapContact(result.contact),
  };
}

export async function deleteCustomer(
  id: number,
  authToken: string
): Promise<{ success: boolean; message: string }> {
  const result = await apiDeleteContact(id, authToken);
  return {
    success: true,
    message: result.message || 'Customer deleted successfully',
  };
}

// ============================================================================
// Employee helpers
// ============================================================================

export interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  mobile: string;
  role: string;
  companyId: number | null;
  companyName: string;
}

function mapEmployee(e: OdooEmployee): Employee {
  return {
    id: e.id,
    name: e.name || '',
    email: e.email || '',
    phone: e.phone || '',
    mobile: e.mobile || '',
    role: e.role || '',
    companyId: Array.isArray(e.company_id) ? e.company_id[0] : null,
    companyName: Array.isArray(e.company_id) ? e.company_id[1] : '',
  };
}

export async function fetchEmployees(
  params: { companyId?: number; search?: string } = {},
  authToken?: string
): Promise<{ employees: Employee[]; total: number }> {
  const result = await apiGetEmployees(
    {
      company_id: params.companyId,
      search: params.search || undefined,
      active: 'true',
      limit: 100,
    },
    authToken
  );

  return {
    employees: result.employees.map(mapEmployee),
    total: result.total,
  };
}

export async function assignCustomerToEmployee(
  contactId: number,
  employeeId: number,
  authToken: string
): Promise<{ success: boolean; message: string }> {
  const result = await apiAssignContact(contactId, employeeId, authToken);
  return {
    success: true,
    message: result.message,
  };
}
