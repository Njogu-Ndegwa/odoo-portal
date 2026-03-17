"use client";
import React, { createContext, useState, useContext, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  employeeLogin,
  getSalesUser,
  clearSalesLogin,
  type EmployeeUser,
} from "@/lib/odoo-auth";
import { fetchMyServiceAccounts } from "@/lib/sa-api";
import { useSA } from "@/lib/sa-context";
import type { ServiceAccount } from "@/lib/sa-types";

interface AuthContextType {
  user: EmployeeUser | null;
  distributorId: string | undefined;
  loading: boolean;
  error: string | null;
  signIn: (credentials: { email: string; password: string }) => void;
  signOut: () => void;
  pendingSAs: ServiceAccount[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<EmployeeUser | null>(() => getSalesUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingSAs, setPendingSAs] = useState<ServiceAccount[]>([]);
  const router = useRouter();
  const { selectSA, clearSA, setServiceAccounts } = useSA();

  const signIn = async (credentials: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    clearSA();
    try {
      const result = await employeeLogin(credentials.email, credentials.password);
      if (!result.success || !result.user) {
        setError(result.error || "Login failed. Please check your credentials.");
        return;
      }

      setUser(result.user);

      const token = result.user.accessToken;
      if (!token) {
        router.push("/portal");
        return;
      }

      try {
        const saRes = await fetchMyServiceAccounts(token);
        const accounts = saRes.service_accounts ?? [];

        if (accounts.length === 0) {
          router.push("/portal/select-sa");
          return;
        }

        setServiceAccounts(accounts);

        if (accounts.length === 1 && saRes.auto_selected) {
          selectSA(accounts[0]);
          router.push("/portal");
        } else {
          setPendingSAs(accounts);
          router.push("/portal/select-sa");
        }
      } catch {
        router.push("/portal/select-sa");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    clearSalesLogin();
    clearSA();
    setUser(null);
    setPendingSAs([]);
    router.push("/signin");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        distributorId: user?.companyId?.toString(),
        loading,
        error,
        signIn,
        signOut,
        pendingSAs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
