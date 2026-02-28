const EMPLOYEE_API = {
  BASE_URL: 'https://crm-omnivoltaic.odoo.com/api',
  LOGIN_ENDPOINT: '/employee/login',
  API_KEY: 'abs_connector_secret_key_2024',
} as const;

export const STORAGE_KEYS = {
  SALES_USER_EMAIL: 'oves-sales-email',
  SALES_USER_DATA: 'oves-sales-data',
  SALES_ACCESS_TOKEN: 'oves-sales-token',
  SALES_TOKEN_EXPIRES: 'oves-sales-token-expires',
} as const;

// ============================================================================
// Types
// ============================================================================

export type BackendRole = 'salesattendant' | 'salesrep';

export interface EmployeeUser {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  accessToken?: string;
  tokenExpiresAt?: string;
  userType: 'attendant' | 'sales';
  backendRole?: BackendRole;
  employeeId?: number;
  companyId?: number;
  odooUserType?: string;
}

interface EmployeeLoginResponse {
  success: boolean;
  message?: string;
  session?: {
    token: string;
    expires_at: string;
    employee: {
      id: number;
      name: string;
      email: string;
      company_id: number;
      role: BackendRole;
      user_type: string;
    };
  };
  error?: string;
}

// ============================================================================
// JWT helpers
// ============================================================================

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function isJwtTokenExpired(token?: string | null): boolean {
  if (!token) return true;
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  const bufferMs = 60 * 1000;
  return Date.now() >= (payload.exp as number) * 1000 - bufferMs;
}

// ============================================================================
// Login
// ============================================================================

export async function employeeLogin(
  email: string,
  password: string
): Promise<{ success: boolean; user?: EmployeeUser; error?: string }> {
  try {
    const response = await fetch(`${EMPLOYEE_API.BASE_URL}${EMPLOYEE_API.LOGIN_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': EMPLOYEE_API.API_KEY,
      },
      body: JSON.stringify({ email: email.trim(), password }),
    });

    const data = (await response.json()) as EmployeeLoginResponse;

    if (response.ok && data.success && data.session) {
      const { token, expires_at, employee } = data.session;

      if (!employee) {
        throw new Error('No employee data in response');
      }

      const user: EmployeeUser = {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        accessToken: token,
        tokenExpiresAt: expires_at,
        userType: employee.role === 'salesattendant' ? 'attendant' : 'sales',
        backendRole: employee.role,
        employeeId: employee.id,
        companyId: employee.company_id,
        odooUserType: employee.user_type,
      };

      saveSalesLogin(user);
      return { success: true, user };
    } else {
      return {
        success: false,
        error: data.error || data.message || 'Login failed. Please check your credentials.',
      };
    }
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error. Please try again.',
    };
  }
}

// ============================================================================
// Token / session management
// ============================================================================

export function saveSalesLogin(user: EmployeeUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SALES_USER_EMAIL, user.email);
  localStorage.setItem(STORAGE_KEYS.SALES_USER_DATA, JSON.stringify(user));
  if (user.accessToken) localStorage.setItem(STORAGE_KEYS.SALES_ACCESS_TOKEN, user.accessToken);
  if (user.tokenExpiresAt) localStorage.setItem(STORAGE_KEYS.SALES_TOKEN_EXPIRES, user.tokenExpiresAt);
}

export function clearSalesLogin(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.SALES_USER_EMAIL);
  localStorage.removeItem(STORAGE_KEYS.SALES_USER_DATA);
  localStorage.removeItem(STORAGE_KEYS.SALES_ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.SALES_TOKEN_EXPIRES);
}

export function isSalesLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem(STORAGE_KEYS.SALES_ACCESS_TOKEN);
  if (!token) return false;
  if (isJwtTokenExpired(token)) {
    clearSalesLogin();
    return false;
  }
  return true;
}

export function getSalesToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(STORAGE_KEYS.SALES_ACCESS_TOKEN);
  if (isJwtTokenExpired(token)) {
    clearSalesLogin();
    return null;
  }
  return token;
}

export function getSalesUser(): EmployeeUser | null {
  if (typeof window === 'undefined') return null;
  if (!isSalesLoggedIn()) return null;
  const data = localStorage.getItem(STORAGE_KEYS.SALES_USER_DATA);
  if (!data) return null;
  try {
    return JSON.parse(data) as EmployeeUser;
  } catch {
    return null;
  }
}
