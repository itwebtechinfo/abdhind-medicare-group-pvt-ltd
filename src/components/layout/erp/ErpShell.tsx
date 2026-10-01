"use client";

import { ErpLayoutProvider, useErpLayout } from "@/src/contexts/ErpLayoutContext";
import { ErpSidebar } from "@/src/components/layout/erp/ErpSidebar";
import { ErpTopBar } from "@/src/components/layout/erp/ErpTopBar";
import { cn } from "@/src/lib/utils";

function ErpShellInner({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useErpLayout();

  return (
    <div className="min-h-screen w-full min-w-0 bg-erp-canvas">
      <ErpSidebar />
      <div
        className={cn(
          "flex min-h-screen min-w-0 flex-1 flex-col transition-[margin] duration-300 ease-out",
          "lg:ml-[260px]",
          sidebarCollapsed && "lg:ml-[72px]"
        )}
      >
        <ErpTopBar />
        <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-5 lg:p-6 xl:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function ErpShell({ children }: { children: React.ReactNode }) {
  return (
    <ErpLayoutProvider>
      <ErpShellInner>{children}</ErpShellInner>
    </ErpLayoutProvider>
  );
}
