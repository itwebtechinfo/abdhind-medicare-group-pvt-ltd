"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LogOut,
  Maximize2,
  Menu,
  PanelLeftClose,
  PanelLeft,
  Search,
  User,
} from "lucide-react";
import { memo, useRef, useState, useEffect } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { useErpLayout } from "@/src/contexts/ErpLayoutContext";
import { AUTH_ROUTES } from "@/src/lib/auth/constants";
import { ROLE_LABELS } from "@/src/lib/rbac/roles";
import { ThemeToggle } from "@/src/components/theme/ThemeToggle";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { cn } from "@/src/lib/utils";

function ErpTopBarComponent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const {
    sidebarCollapsed,
    toggleSidebarCollapsed,
    toggleMobileSidebar,
  } = useErpLayout();
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleLogout = () => {
    logout();
    router.replace(AUTH_ROUTES.login);
  };

  const initials =
    user?.displayName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "AH";

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full min-w-0 items-center justify-between gap-2 border-b border-border bg-card/95 px-3 shadow-sm backdrop-blur-md sm:h-16 sm:gap-4 sm:px-4 lg:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleMobileSidebar}
          className="lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleSidebarCollapsed}
          className="hidden lg:inline-flex"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </Button>

        <div
          className={cn(
            "hidden min-w-0 flex-1 sm:block",
            searchOpen ? "block max-w-md" : "max-w-sm"
          )}
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchRef}
              placeholder="Search patients, appointments…"
              className="h-9 bg-muted/50 pl-9"
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
            />
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="sm:hidden"
          aria-label="Search"
          onClick={() => setSearchOpen((v) => !v)}
        >
          <Search className="h-[18px] w-[18px]" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
        </Button>

        <ThemeToggle />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden lg:inline-flex"
          aria-label="Fullscreen"
          onClick={() => {
            if (document.fullscreenElement) {
              document.exitFullscreen();
            } else {
              document.documentElement.requestFullscreen();
            }
          }}
        >
          <Maximize2 className="h-[18px] w-[18px]" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-2 transition-colors hover:bg-muted/50 sm:pr-3"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[100px] truncate text-sm font-semibold md:inline">
                {user?.displayName?.split(" ")[0] ?? "User"}
              </span>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="truncate font-semibold">{user?.displayName}</p>
              <p className="text-xs font-normal text-muted-foreground">
                {user ? ROLE_LABELS[user.role] : ""}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export const ErpTopBar = memo(ErpTopBarComponent);
