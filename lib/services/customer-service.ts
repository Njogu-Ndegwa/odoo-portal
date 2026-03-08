import {
  getEmployees as apiGetEmployees,
  type OdooEmployee,
} from '@/lib/odoo-api';

// ============================================================================
// Types
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

// ============================================================================
// Mapping helper
// ============================================================================

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

// ============================================================================
// API Functions (employees only -- REST, no GraphQL equivalent yet)
// ============================================================================

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
