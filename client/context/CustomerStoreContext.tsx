import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface CustomerRecord {
  id: string;
  name: string;
  type: "Personal" | "Government" | "NGO" | "Private" | string;
  subType?: string;
  phone?: string;
  email?: string;
  location?: string;
  registeredDate?: string;
  lastVisit?: string;
  totalOrders?: number;
  status?: string;
}

interface CustomerStoreContextValue {
  customers: CustomerRecord[];
  addCustomer: (c: CustomerRecord) => void;
  clearAll: () => void;
}

const CustomerStoreContext = createContext<CustomerStoreContextValue | null>(null);

const STORAGE_KEY = "customerStore.v1";

export const CustomerStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<CustomerRecord[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CustomerRecord[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    } catch {}
  }, [customers]);

  const addCustomer = useCallback((c: CustomerRecord) => {
    setCustomers((prev) => [c, ...prev]);
  }, []);

  const clearAll = useCallback(() => setCustomers([]), []);

  const value = useMemo(() => ({ customers, addCustomer, clearAll }), [customers, addCustomer, clearAll]);

  return <CustomerStoreContext.Provider value={value}>{children}</CustomerStoreContext.Provider>;
};

export const useCustomerStore = () => {
  const ctx = useContext(CustomerStoreContext);
  if (!ctx) throw new Error("useCustomerStore must be used within CustomerStoreProvider");
  return ctx;
};
