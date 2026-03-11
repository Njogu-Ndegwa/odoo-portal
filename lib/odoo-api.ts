const ODOO_BASE_URL = process.env.NEXT_PUBLIC_ODOO_API_URL || 'https://crm-omnivoltaic.odoo.com';
const ODOO_API_KEY = process.env.NEXT_PUBLIC_ODOO_API_KEY || 'abs_connector_secret_key_2024';

// ============================================================================
// Types
// ============================================================================

export interface OdooContact {
  id: number;
  name: string;
  email: string | false;
  phone: string | false;
  mobile: string | false;
  is_company: boolean;
  customer_rank: number;
  supplier_rank: number;
  active: boolean;
  street: string | false;
  city: string | false;
  zip: string | false;
  country_id: number | null;
  company_id: number | null;
  parent_id: number | null;
  create_date: string;
  write_date: string;
  user_id: number | null;
  country_name: string | null;
  company_name: string | null;
  parent_name: string | null;
  user_name: string | null;
  assigned_employee_id: number | null;
  assigned_employee_name: string | null;
}

export interface ContactsListApiResponse {
  success: boolean;
  contacts: OdooContact[];
  pagination: {
    current_page: number;
    per_page: number;
    total_records: number;
    total_pages: number;
    has_next_page: boolean;
    has_previous_page: boolean;
    next_page: number | null;
    previous_page: number | null;
  };
  filters_applied?: Record<string, unknown>;
}

export interface ContactDetailApiResponse {
  success: boolean;
  contact: OdooContact;
}

export interface ContactUpdateApiResponse {
  success: boolean;
  contact: OdooContact;
  message?: string;
}

export interface ContactCreateApiResponse {
  success: boolean;
  contact: OdooContact;
  message?: string;
}

export interface ContactDeleteApiResponse {
  success: boolean;
  message?: string;
}

export interface GetContactsParams {
  q?: string;
  page?: number;
  limit?: number;
  type?: 'all' | 'company' | 'individual';
  name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  logic?: 'AND' | 'OR';
  company_id?: number;
  strict?: boolean;
  all_company?: boolean;
  created_after?: string;
  created_before?: string;
  updated_after?: string;
  updated_before?: string;
}

export interface ContactWritePayload {
  name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  street?: string;
  city?: string;
  zip?: string;
  is_company?: boolean;
  company_id?: number;
  parent_id?: number;
  country_id?: number;
}

// ============================================================================
// Helpers
// ============================================================================

const RETRY_CONFIG = {
  maxRetries: 2,
  baseDelayMs: 1000,
  maxDelayMs: 5000,
};

function isNetworkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return [
    /network/i, /fetch/i, /timeout/i, /connection refused/i,
    /Failed to fetch/i, /Load failed/i, /Network request failed/i,
  ].some(p => p.test(message));
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retryCount = 0
): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch (error: unknown) {
    if (!isNetworkError(error) || retryCount >= RETRY_CONFIG.maxRetries) {
      throw error;
    }
    const delay = Math.min(
      RETRY_CONFIG.baseDelayMs * Math.pow(2, retryCount),
      RETRY_CONFIG.maxDelayMs
    );
    await new Promise(resolve => setTimeout(resolve, delay));
    return fetchWithRetry(url, options, retryCount + 1);
  }
}

export async function parseOdooResponse<T>(response: Response, endpoint: string): Promise<T> {
  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';
    let errorMessage = `Server error (HTTP ${response.status})`;

    if (contentType.includes('application/json')) {
      try {
        const errorData = await response.json();
        errorMessage = errorData?.data?.error || errorData?.error || errorData?.message || errorMessage;
      } catch { /* use default */ }
    } else {
      if (response.status === 401) errorMessage = 'Session expired. Please log out and log back in.';
      else if (response.status === 403) errorMessage = 'Access denied.';
      else if (response.status === 404) errorMessage = 'Resource not found.';
      else if (response.status >= 500) errorMessage = `Server unavailable (${response.status}). Please try again later.`;
    }

    throw new Error(errorMessage);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Server returned an unexpected response format.');
  }

  let data: T;
  try {
    data = await response.json();
  } catch {
    throw new Error('Failed to parse server response.');
  }

  const apiResponse = data as Record<string, unknown>;
  if (apiResponse.success === false) {
    const errorMessage = (apiResponse.error || apiResponse.message || apiResponse.data) as string || 'Request failed';
    throw new Error(typeof errorMessage === 'string' ? errorMessage : 'Request failed');
  }

  return data;
}

// ============================================================================
// Contact CRUD
// ============================================================================

export async function getContacts(
  params: GetContactsParams = {},
  authToken?: string
): Promise<ContactsListApiResponse> {
  const qp = new URLSearchParams();
  if (params.q) qp.append('q', params.q);
  if (params.page !== undefined) qp.append('page', String(params.page));
  if (params.limit !== undefined) qp.append('limit', String(params.limit));
  if (params.type) qp.append('type', params.type);
  if (params.name) qp.append('name', params.name);
  if (params.email) qp.append('email', params.email);
  if (params.phone) qp.append('phone', params.phone);
  if (params.mobile) qp.append('mobile', params.mobile);
  if (params.logic) qp.append('logic', params.logic);
  if (params.company_id !== undefined) qp.append('company_id', String(params.company_id));
  if (params.strict) qp.append('strict', 'true');
  if (params.all_company) qp.append('all_company', 'true');
  if (params.created_after) qp.append('created_after', params.created_after);
  if (params.created_before) qp.append('created_before', params.created_before);
  if (params.updated_after) qp.append('updated_after', params.updated_after);
  if (params.updated_before) qp.append('updated_before', params.updated_before);

  const qs = qp.toString();
  const endpoint = `/api/contacts${qs ? `?${qs}` : ''}`;
  const url = `${ODOO_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-API-KEY': ODOO_API_KEY,
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetchWithRetry(url, { method: 'GET', headers });
  return parseOdooResponse<ContactsListApiResponse>(response, endpoint);
}

export async function getContactById(
  contactId: number,
  authToken?: string
): Promise<ContactDetailApiResponse> {
  const endpoint = `/api/contacts/${contactId}`;
  const url = `${ODOO_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-API-KEY': ODOO_API_KEY,
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetchWithRetry(url, { method: 'GET', headers });
  return parseOdooResponse<ContactDetailApiResponse>(response, endpoint);
}

export async function updateContact(
  contactId: number,
  payload: ContactWritePayload,
  authToken?: string
): Promise<ContactUpdateApiResponse> {
  const endpoint = `/api/contacts/${contactId}`;
  const url = `${ODOO_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-API-KEY': ODOO_API_KEY,
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetchWithRetry(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  return parseOdooResponse<ContactUpdateApiResponse>(response, endpoint);
}

export async function createContact(
  payload: ContactWritePayload,
  authToken?: string
): Promise<ContactCreateApiResponse> {
  const endpoint = '/api/contacts';
  const url = `${ODOO_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-API-KEY': ODOO_API_KEY,
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  return parseOdooResponse<ContactCreateApiResponse>(response, endpoint);
}

export async function deleteContact(
  contactId: number,
  authToken?: string
): Promise<ContactDeleteApiResponse> {
  const endpoint = `/api/contacts/${contactId}`;
  const url = `${ODOO_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-API-KEY': ODOO_API_KEY,
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetchWithRetry(url, { method: 'DELETE', headers });
  return parseOdooResponse<ContactDeleteApiResponse>(response, endpoint);
}

// ============================================================================
// Employees
// ============================================================================

export interface OdooEmployee {
  id: number;
  name: string;
  email: string;
  phone: string | false;
  mobile: string | false;
  role: string | null;
  company_id: [number, string] | false;
  channel_partner_id: [number, string] | false;
  outlet_ids: number[];
  outlet_count: number;
  active: boolean;
  last_login: string | false;
  create_date: string;
}

export interface EmployeesListApiResponse {
  success: boolean;
  employees: OdooEmployee[];
  count: number;
  total: number;
  limit: number;
  offset: number;
}

export interface GetEmployeesParams {
  company_id?: number;
  search?: string;
  active?: 'true' | 'false' | 'all';
  channel_partner_id?: number | 'null';
  limit?: number;
  offset?: number;
}

export async function getEmployees(
  params: GetEmployeesParams = {},
  authToken?: string
): Promise<EmployeesListApiResponse> {
  const qp = new URLSearchParams();
  if (params.company_id !== undefined) qp.append('company_id', String(params.company_id));
  if (params.search) qp.append('search', params.search);
  if (params.active) qp.append('active', params.active);
  if (params.channel_partner_id !== undefined) qp.append('channel_partner_id', String(params.channel_partner_id));
  if (params.limit !== undefined) qp.append('limit', String(params.limit));
  if (params.offset !== undefined) qp.append('offset', String(params.offset));

  const qs = qp.toString();
  const endpoint = `/api/employees${qs ? `?${qs}` : ''}`;
  const url = `${ODOO_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-API-KEY': ODOO_API_KEY,
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetchWithRetry(url, { method: 'GET', headers });
  return parseOdooResponse<EmployeesListApiResponse>(response, endpoint);
}

// ============================================================================
// Assign Contact to Employee
// ============================================================================

export interface AssignContactApiResponse {
  success: boolean;
  message: string;
  contact_id: number;
  previous_employee: { id: number; name: string } | null;
  new_employee: { id: number; name: string };
}

export async function assignContactToEmployee(
  contactId: number,
  employeeId: number,
  authToken?: string
): Promise<AssignContactApiResponse> {
  const endpoint = `/api/contacts/${contactId}/assign`;
  const url = `${ODOO_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-API-KEY': ODOO_API_KEY,
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ employee_id: employeeId }),
  });
  return parseOdooResponse<AssignContactApiResponse>(response, endpoint);
}

// ============================================================================
// Products
// ============================================================================

export interface OdooProduct {
  product_id?: number;
  id?: number;
  name: string;
  default_code: string | false;
  description: string | false;
  description_sale?: string | false;
  list_price: number;
  type: string;
  currency: string;
  category_id: number | null;
  category_name: string | false;
  company_id?: [number, string] | false;
  recurring_invoice: boolean;
  sale_ok?: boolean;
  active?: boolean;
  image_url: string | null;
  pu_category: string | false;
  pu_metric: string | false;
  service_type: string | false;
  contract_type: string | false;
  create_date: string;
  write_date: string;
}

export interface ProductsListApiResponse {
  success: boolean;
  products: OdooProduct[];
  pagination: {
    current_page: number;
    per_page: number;
    total_records: number;
    total_pages: number;
    has_next_page: boolean;
    has_previous_page: boolean;
    next_page: number | null;
    previous_page: number | null;
  };
}

export interface ProductDetailApiResponse {
  success: boolean;
  product: OdooProduct;
}

export interface ProductWriteApiResponse {
  success: boolean;
  product?: OdooProduct;
  message?: string;
}

export interface ProductDeleteApiResponse {
  success: boolean;
  message?: string;
}

export interface GetProductsParams {
  company_id?: number;
  pu_category?: string;
  pu_metric?: string;
  service_type?: string;
  contract_type?: string;
  type?: string;
  category_id?: number;
  active?: boolean;
  page?: number;
  limit?: number;
  offset?: number;
  search?: string;
  created_after?: string;
  created_before?: string;
}

export interface ProductWritePayload {
  name?: string;
  list_price?: number;
  type?: string;
  company_id?: number;
  pu_category?: string;
  pu_metric?: string;
  service_type?: string;
  contract_type?: string;
  recurring_invoice?: boolean;
  sale_ok?: boolean;
  default_code?: string;
  description?: string;
  description_sale?: string;
  category?: string;
  external_image_url?: string;
}

export async function getProducts(
  params: GetProductsParams = {},
  authToken?: string
): Promise<ProductsListApiResponse> {
  const qp = new URLSearchParams();
  if (params.company_id !== undefined) qp.append('company_id', String(params.company_id));
  if (params.pu_category) qp.append('pu_category', params.pu_category);
  if (params.pu_metric) qp.append('pu_metric', params.pu_metric);
  if (params.service_type) qp.append('service_type', params.service_type);
  if (params.contract_type) qp.append('contract_type', params.contract_type);
  if (params.type) qp.append('type', params.type);
  if (params.category_id !== undefined) qp.append('category_id', String(params.category_id));
  if (params.active !== undefined) qp.append('active', String(params.active));
  if (params.page !== undefined) qp.append('page', String(params.page));
  if (params.limit !== undefined) qp.append('limit', String(params.limit));
  if (params.offset !== undefined) qp.append('offset', String(params.offset));
  if (params.search) qp.append('search', params.search);
  if (params.created_after) qp.append('created_after', params.created_after);
  if (params.created_before) qp.append('created_before', params.created_before);

  const qs = qp.toString();
  const endpoint = `/api/products${qs ? `?${qs}` : ''}`;
  const url = `${ODOO_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-API-KEY': ODOO_API_KEY,
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetchWithRetry(url, { method: 'GET', headers });
  return parseOdooResponse<ProductsListApiResponse>(response, endpoint);
}

export async function getProductById(
  productId: number,
  authToken?: string
): Promise<ProductDetailApiResponse> {
  const endpoint = `/api/products/${productId}`;
  const url = `${ODOO_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-API-KEY': ODOO_API_KEY,
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetchWithRetry(url, { method: 'GET', headers });
  return parseOdooResponse<ProductDetailApiResponse>(response, endpoint);
}

export async function createProduct(
  payload: ProductWritePayload,
  authToken?: string
): Promise<ProductWriteApiResponse> {
  const endpoint = '/api/products';
  const url = `${ODOO_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-API-KEY': ODOO_API_KEY,
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  return parseOdooResponse<ProductWriteApiResponse>(response, endpoint);
}

export async function updateProduct(
  productId: number,
  payload: ProductWritePayload,
  authToken?: string
): Promise<ProductWriteApiResponse> {
  const endpoint = `/api/products/${productId}`;
  const url = `${ODOO_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-API-KEY': ODOO_API_KEY,
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetchWithRetry(url, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(payload),
  });
  return parseOdooResponse<ProductWriteApiResponse>(response, endpoint);
}

export async function deleteProduct(
  productId: number,
  authToken?: string
): Promise<ProductDeleteApiResponse> {
  const endpoint = `/api/products/${productId}`;
  const url = `${ODOO_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-API-KEY': ODOO_API_KEY,
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetchWithRetry(url, { method: 'DELETE', headers });
  return parseOdooResponse<ProductDeleteApiResponse>(response, endpoint);
}
