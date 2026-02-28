"use client";
import React, { createContext, useState, useContext, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  employeeLogin,
  getSalesUser,
  clearSalesLogin,
  type EmployeeUser,
} from "@/lib/odoo-auth";

interface AuthContextType {
  user: EmployeeUser | null;
  distributorId: string | undefined;
  loading: boolean;
  error: string | null;
  signIn: (credentials: { email: string; password: string }) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<EmployeeUser | null>(() => getSalesUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const signIn = async (credentials: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await employeeLogin(credentials.email, credentials.password);
      if (result.success && result.user) {
        setUser(result.user);
        router.push("/portal");
      } else {
        setError(result.error || "Login failed. Please check your credentials.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    clearSalesLogin();
    setUser(null);
    router.push("/signin");
  };

  return (
    <AuthContext.Provider value={{ user, distributorId: user?.companyId?.toString(), loading, error, signIn, signOut }}>
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
