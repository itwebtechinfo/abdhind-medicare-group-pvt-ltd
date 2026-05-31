"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, User, X } from "lucide-react";
import { memo, useMemo, useState } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { useErpLayout } from "@/src/contexts/ErpLayoutContext";
import { filterNavForUser } from "@/src/lib/rbac/access";
import { ROLE_LABELS } from "@/src/lib/rbac/roles";
import { AUTH_ROUTES } from "@/src/lib/auth/constants";
import { cn } from "@/src/lib/utils";
import { Badge } from "@/src/components/ui/badge";

function ErpSidebarComponent() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const {
    sidebarCollapsed,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  } = useErpLayout();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "Clinical Records": true,
  });

  const navSections = useMemo(
    () => filterNavForUser(user?.permissions ?? []),
    [user?.permissions]
  );

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex shrink-0 items-center border-b border-sidebar-border px-4 py-4",
          sidebarCollapsed && "justify-center px-2"
        )}
      >
        <Link
          href={AUTH_ROUTES.dashboard}
          onClick={() => setMobileSidebarOpen(false)}
          className="flex min-w-0 items-center gap-2.5"
        >
          <div className="relative h-9 w-9 shrink-0 rounded-lg bg-card p-0.5 shadow-sm">
            <Image
              src="/logo.png"
              alt="Abd Hind MediCare"
              fill
              className="object-contain"
              sizes="36px"
            />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-sidebar-foreground">
                Abd Hind MediCare
              </p>
              <Badge variant="secondary" className="mt-1 text-[10px]">
                Healthcare ERP
              </Badge>
            </div>
          )}
        </Link>
        {mobileSidebarOpen && (
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="ml-auto rounded-lg p-1.5 text-muted-foreground hover:bg-sidebar-accent lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
        {navSections.map((section) => (
          <div key={section.title || "main"} className="mb-4">
            {section.title && !sidebarCollapsed && (
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expanded[item.name];

                if (hasChildren && !sidebarCollapsed) {
                  return (
                    <li key={item.name}>
                      <button
                        type="button"
                        onClick={() =>
                          setExpanded((p) => ({
                            ...p,
                            [item.name]: !p[item.name],
                          }))
                        }
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                          active
                            ? "bg-sidebar-accent text-sidebar-primary shadow-sm"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        )}
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0 opacity-80" />
                        <span className="flex-1 text-left">{item.name}</span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </button>
                      {isExpanded && (
                        <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-3">
                          {item.children!.map((child) => (
                            <li key={child.name}>
                              <Link
                                href={child.href}
                                onClick={() => setMobileSidebarOpen(false)}
                                className={cn(
                                  "block rounded-lg px-3 py-2 text-sm transition-colors",
                                  pathname === child.href
                                    ? "font-semibold text-sidebar-primary"
                                    : "text-muted-foreground hover:text-sidebar-primary"
                                )}
                              >
                                {child.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                }

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileSidebarOpen(false)}
                      title={sidebarCollapsed ? item.name : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                        active
                          ? "bg-sidebar-primary/10 text-sidebar-primary shadow-sm ring-1 ring-sidebar-primary/20"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                        sidebarCollapsed && "justify-center px-2"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-[18px] w-[18px] shrink-0",
                          active && "text-sidebar-primary"
                        )}
                      />
                      {!sidebarCollapsed && <span>{item.name}</span>}
                      {!sidebarCollapsed && item.badge && (
                        <Badge variant="warning" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div
        className={cn(
          "shrink-0 border-t border-sidebar-border p-3",
          sidebarCollapsed && "flex flex-col items-center"
        )}
      >
        {!sidebarCollapsed && user && (
          <div className="mb-2 rounded-lg bg-sidebar-accent/80 px-3 py-2">
            <p className="truncate text-xs font-semibold text-sidebar-foreground">
              {user.displayName}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {ROLE_LABELS[user.role]}
            </p>
          </div>
        )}
        <Link
          href="/profile"
          onClick={() => setMobileSidebarOpen(false)}
          className={cn(
            "mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent",
            sidebarCollapsed && "justify-center px-2",
            pathname === "/profile" &&
              "bg-sidebar-primary/10 text-sidebar-primary"
          )}
        >
          <User className="h-[18px] w-[18px] shrink-0" />
          {!sidebarCollapsed && <span className="truncate">Profile</span>}
        </Link>
        <button
          type="button"
          onClick={() => {
            logout();
            setMobileSidebarOpen(false);
          }}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10",
            sidebarCollapsed && "w-auto justify-center px-2"
          )}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 hidden h-screen shrink-0 border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ease-out lg:flex lg:flex-col",
          sidebarCollapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        {sidebarContent}
      </aside>

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-[min(280px,88vw)] flex-col border-r border-sidebar-border bg-sidebar shadow-2xl transition-transform duration-300 ease-out lg:hidden",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {mobileSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden"
          aria-label="Close sidebar overlay"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
    </>
  );
}

export const ErpSidebar = memo(ErpSidebarComponent);
