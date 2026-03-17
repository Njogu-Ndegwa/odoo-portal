import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { STORAGE_KEYS, isJwtTokenExpired } from '@/lib/odoo-auth';

export const getDecodedToken = (): Record<string, unknown> | null => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(STORAGE_KEYS.SALES_ACCESS_TOKEN);
    if (token && !isJwtTokenExpired(token)) {
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
  }
  return null;
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(STORAGE_KEYS.SALES_ACCESS_TOKEN);
    if (token && !isJwtTokenExpired(token)) return token;
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  return getDecodedToken() !== null;
};

export const hasSASelected = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(STORAGE_KEYS.SA_ID);
};

const SA_EXEMPT_PATHS = ['/portal/select-sa', '/signin', '/signup', '/reset-password'];

function isExemptFromSA(): boolean {
  if (typeof window === 'undefined') return true;
  return SA_EXEMPT_PATHS.some((p) => window.location.pathname.startsWith(p));
}

export function withAuth(Component: React.ComponentType) {
  return function ProtectedRoute(props: Record<string, unknown>) {
    if (typeof window !== 'undefined') {
      const decoded = getDecodedToken();
      if (!decoded) {
        redirect('/signin');
        return null;
      }
      if (!hasSASelected() && !isExemptFromSA()) {
        redirect('/portal/select-sa');
        return null;
      }
      return <Component {...props} />;
    }
    return null;
  };
}

export function isAuth<P extends Record<string, unknown>>(Component: React.ComponentType<P>) {
  return function IsAuth(props: P) {
    useEffect(() => {
      if (!getDecodedToken()) {
        redirect('/signin');
        return;
      }
      if (!hasSASelected() && !isExemptFromSA()) {
        redirect('/portal/select-sa');
      }
    }, []);

    return <Component {...props} />;
  };
}

export const useMenuVisibility = () => {
  const decoded = getDecodedToken();
  const jwtRole = (decoded?.role as string) || '';

  let saRole: string | null = null;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SA_DATA);
      if (raw) {
        const sa = JSON.parse(raw);
        saRole = sa?.my_role ?? null;
      }
    } catch { /* ignore */ }
  }

  const effectiveRole = saRole || jwtRole;

  const menuPermissions: Record<string, string[]> = {
    admin: ['dashboard', 'accounts', 'thing', 'staff', 'service-accounts'],
    staff: ['dashboard', 'accounts', 'thing', 'staff', 'service-accounts'],
    agent: ['dashboard', 'accounts', 'thing', 'service-accounts'],
    salesrep: ['dashboard', 'accounts', 'thing', 'staff', 'service-accounts'],
    salesattendant: ['dashboard', 'accounts', 'thing', 'staff', 'service-accounts'],
  };

  const canViewMenu = (menuId: string): boolean => {
    if (!effectiveRole) return true;
    return menuPermissions[effectiveRole]?.includes(menuId) ?? true;
  };

  return { canViewMenu, userType: effectiveRole };
};
