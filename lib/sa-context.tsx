"use client";
import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  ReactNode,
} from "react";
import type { ServiceAccount } from "@/lib/sa-types";
import {
  saveSelectedSA,
  clearSelectedSA,
  getSelectedSA as readSAFromStorage,
  getSalesToken,
} from "@/lib/odoo-auth";
import { fetchMyServiceAccounts } from "@/lib/sa-api";

interface SAContextType {
  currentSA: ServiceAccount | null;
  serviceAccounts: ServiceAccount[];
  selectSA: (sa: ServiceAccount) => void;
  clearSA: () => void;
  refreshSAs: () => Promise<ServiceAccount[]>;
  isAdmin: boolean;
  isStaff: boolean;
  isAgent: boolean;
  hasSA: boolean;
  setServiceAccounts: (sas: ServiceAccount[]) => void;
}

const SAContext = createContext<SAContextType | undefined>(undefined);

export const SAProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentSA, setCurrentSA] = useState<ServiceAccount | null>(
    () => readSAFromStorage()
  );
  const [serviceAccounts, setServiceAccounts] = useState<ServiceAccount[]>([]);
  const fetchedRef = useRef(false);

  // Re-read from localStorage after hydration — the useState initializer runs
  // during SSR where window is undefined (returns null), and React reuses that
  // server state during client hydration without re-running the initializer.
  useEffect(() => {
    const stored = readSAFromStorage();
    if (stored && !currentSA) {
      setCurrentSA(stored);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectSA = useCallback((sa: ServiceAccount) => {
    saveSelectedSA(sa);
    setCurrentSA(sa);
  }, []);

  const clearSA = useCallback(() => {
    clearSelectedSA();
    setCurrentSA(null);
    setServiceAccounts([]);
    fetchedRef.current = false;
  }, []);

  const refreshSAs = useCallback(async (): Promise<ServiceAccount[]> => {
    const token = getSalesToken();
    if (!token) return [];
    try {
      const res = await fetchMyServiceAccounts(token);
      setServiceAccounts(res.service_accounts);
      return res.service_accounts;
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    if (currentSA && serviceAccounts.length === 0 && !fetchedRef.current) {
      fetchedRef.current = true;
      refreshSAs();
    }
  }, [currentSA, serviceAccounts.length, refreshSAs]);

  const value = useMemo<SAContextType>(() => {
    const role = currentSA?.my_role ?? null;
    return {
      currentSA,
      serviceAccounts,
      selectSA,
      clearSA,
      refreshSAs,
      isAdmin: role === "admin",
      isStaff: role === "staff",
      isAgent: role === "agent",
      hasSA: currentSA !== null,
      setServiceAccounts,
    };
  }, [currentSA, serviceAccounts, selectSA, clearSA, refreshSAs]);

  return <SAContext.Provider value={value}>{children}</SAContext.Provider>;
};

export const useSA = (): SAContextType => {
  const ctx = useContext(SAContext);
  if (!ctx) {
    throw new Error("useSA must be used within an SAProvider");
  }
  return ctx;
};
