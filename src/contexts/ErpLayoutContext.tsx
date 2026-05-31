"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ErpLayoutContextValue = {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  toggleSidebarCollapsed: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
};

const ErpLayoutContext = createContext<ErpLayoutContextValue | null>(null);

export function ErpLayoutProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((v) => !v);
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    setMobileSidebarOpen((v) => !v);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileSidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSidebarOpen]);

  const value = useMemo(
    () => ({
      sidebarCollapsed,
      mobileSidebarOpen,
      toggleSidebarCollapsed,
      setMobileSidebarOpen,
      toggleMobileSidebar,
    }),
    [
      sidebarCollapsed,
      mobileSidebarOpen,
      toggleSidebarCollapsed,
      toggleMobileSidebar,
    ]
  );

  return (
    <ErpLayoutContext.Provider value={value}>
      {children}
    </ErpLayoutContext.Provider>
  );
}

export function useErpLayout() {
  const ctx = useContext(ErpLayoutContext);
  if (!ctx) {
    throw new Error("useErpLayout must be used within ErpLayoutProvider");
  }
  return ctx;
}
