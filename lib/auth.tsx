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

export function withAuth(Component: React.ComponentType) {
  return function ProtectedRoute(props: Record<string, unknown>) {
    if (typeof window !== 'undefined') {
      const decoded = getDecodedToken();
      if (!decoded) {
        redirect('/signin');
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
      }
    }, []);

    return <Component {...props} />;
  };
}

export const useMenuVisibility = () => {
  const decoded = getDecodedToken();
  const role = (decoded?.role as string) || '';

  const menuPermissions: Record<string, string[]> = {
    salesrep: ['dashboard', 'accounts', 'thing', 'staff'],
    salesattendant: ['dashboard', 'accounts', 'thing', 'staff'],
  };

  const canViewMenu = (menuId: string): boolean => {
    if (!role) return true;
    return menuPermissions[role]?.includes(menuId) ?? true;
  };

  return { canViewMenu, userType: role };
};
