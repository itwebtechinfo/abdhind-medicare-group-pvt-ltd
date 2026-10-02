"use client";

import { useMemo, useRef, useState } from "react";
import { keepPreviousData, useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Loader2, Search, UserPlus, Users } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { ConfirmDialog } from "@/src/components/ui/confirm-dialog";
import { Input } from "@/src/components/ui/input";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useAuth } from "@/src/hooks/useAuth";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { useMinuteClock } from "@/src/hooks/useMinuteClock";
import { usePermission } from "@/src/hooks/usePermission";
import { toast } from "@/src/lib/toast";
import { cn } from "@/src/lib/utils";
import type { NormalizedApiError } from "@/src/types/api";
import { formatCreatedAt } from "@/src/features/appointments/appointment";
import { APPT_UI } from "@/src/features/appointments/StatusBadge";
import { formatPatientPhone } from "@/src/features/patients/patient";
import {
  ROLE_TAB_LABELS,
  STAFF_ROLES,
  describeLastActive,
  firstName,
  formatDayTime,
  userService,
  type ApiUser,
  type StaffRole,
  type UpdateStaffPayload,
  type UserTab,
} from "./user";
import { AddStaffDialog } from "./AddStaffDialog";
import { ChangeRoleDialog } from "./ChangeRoleDialog";
import { EditStaffDialog } from "./EditStaffDialog";
import { StaffDrawer } from "./StaffDrawer";
import { STAFF_ROW_GRID, StaffRow } from "./StaffRow";
import { TempPasswordDialog } from "./TempPasswordDialog";

const USERS_QUERY_KEY = ["users"] as const;
const PAGE_SIZE = 50;
const TABS: UserTab[] = ["all", ...STAFF_ROLES, "deactivated"];

type Reveal = { name: string; phone: string; password: string; mode: "invite" | "reset" };

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Staff & access: DB-counted tabs, server-side search/paging, drawer and every account action. */
export function StaffBoard() {
  const queryClient = useQueryClient();
  const { user: me } = useAuth();
  const { can } = usePermission();
  const canManageUsers = can("users:manage");
  const nowMs = useMinuteClock();

  const [tab, setTab] = useState<UserTab>("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const [selected, setSelected] = useState<ApiUser | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addKey, setAddKey] = useState(0);
  const [editing, setEditing] = useState<ApiUser | null>(null);
  const [roleFor, setRoleFor] = useState<ApiUser | null>(null);
  const [confirm, setConfirm] = useState<{ user: ApiUser; kind: "deactivate" | "reset" } | null>(null);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [exporting, setExporting] = useState(false);

  const busyRef = useRef(new Set<string>());
  const [busyIds, setBusyIds] = useState<ReadonlySet<string>>(new Set());
  const [creating, setCreating] = useState(false);

  // Counts come from the DB, never from loaded rows.
  const { data: stats } = useQuery({
    queryKey: [...USERS_QUERY_KEY, "stats"],
    queryFn: async () => (await userService.stats()).data,
  });
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => (await userService.roles()).data.roles,
    staleTime: 10 * 60 * 1000,
  });
  const rolesByKey = useMemo(() => Object.fromEntries(roles.map((r) => [r.role, r])), [roles]);

  const listParams = { tab, search: debouncedSearch || undefined };
  const listQuery = useInfiniteQuery({
    queryKey: [...USERS_QUERY_KEY, "board", listParams],
    queryFn: async ({ pageParam }) => (await userService.listPage({ ...listParams, limit: PAGE_SIZE, offset: pageParam })).data,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((n, page) => n + page.users.length, 0);
      return loaded < lastPage.count ? loaded : undefined;
    },
    placeholderData: keepPreviousData,
  });
  const rows = useMemo(() => listQuery.data?.pages.flatMap((p) => p.users) ?? [], [listQuery.data]);
  const isLoading = listQuery.isLoading || nowMs === null;
  const drawerUser = useMemo(() => (selected ? (rows.find((r) => r.id === selected.id) ?? selected) : null), [rows, selected]);

  const canManage = (u: ApiUser) => canManageUsers && Boolean(rolesByKey[u.role]?.assignable);
  const isSelf = (u: ApiUser) => u.id === me?.id;

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: ["doctors"] }),
    ]);

  /** One guarded action: no double submits, toast either way, refresh list + stats + drawer. */
  const run = async <T extends { user: ApiUser }>(u: ApiUser, request: () => Promise<{ msg: string; data: T }>) => {
    if (busyRef.current.has(u.id)) return null;
    busyRef.current.add(u.id);
    setBusyIds(new Set(busyRef.current));
    try {
      const res = await request();
      toast.success(res.msg);
      setSelected((prev) => (prev && prev.id === u.id ? res.data.user : prev));
      await refresh();
      return res.data;
    } catch (err) {
      const e = err as NormalizedApiError;
      toast.error(e.error ?? "Something went wrong", e.msg);
      return null;
    } finally {
      busyRef.current.delete(u.id);
      setBusyIds(new Set(busyRef.current));
    }
  };

  const actions = {
    onOpen: (u: ApiUser) => setSelected(u),
    onEdit: (u: ApiUser) => setEditing(u),
    onChangeRole: (u: ApiUser) => setRoleFor(u),
    onResetPassword: (u: ApiUser) => setConfirm({ user: u, kind: "reset" }),
    onDeactivate: (u: ApiUser) => setConfirm({ user: u, kind: "deactivate" }),
    onReactivate: (u: ApiUser) => run(u, () => userService.reactivate(u.id)),
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      // Every row of the current tab/search, straight from the backend.
      const all = (await userService.listPage({ tab, search: debouncedSearch || undefined })).data.users;
      const now = Date.now();
      const header = ["Name", "Email", "Phone", "Role", "Linked doctor", "Status", "Last login", "Last active", "Added", "Added by"];
      const lines = all.map((u) =>
        [
          u.full_name,
          u.email,
          formatPatientPhone(u.phone_number),
          rolesByKey[u.role]?.label ?? u.role,
          u.linked_doctor?.full_name,
          u.status === "invite_sent" ? "Invite sent" : u.status === "deactivated" ? "Deactivated" : "Active",
          u.last_login_at ? formatDayTime(u.last_login_at, now) : "",
          describeLastActive(u, now).primary,
          formatCreatedAt(u.created_at),
          u.created_by?.name,
        ]
          .map(csvCell)
          .join(",")
      );
      const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `staff-${tab}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Export failed", (err as NormalizedApiError).msg);
    } finally {
      setExporting(false);
    }
  };

  const total = stats?.tabs.all;
  const subtitle =
    stats && total !== undefined
      ? `${total} staff account${total === 1 ? "" : "s"}, ${stats.active} active. Each person's role decides which pages they can open.`
      : null;

  return (
    <div className="-m-4 min-h-full bg-[#F5F7F6] p-4 dark:bg-background sm:-m-5 sm:p-5 lg:-m-6 lg:p-6 xl:-m-8 xl:p-8">
      <div className="mx-auto w-full max-w-[1600px] space-y-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className={cn("text-3xl font-semibold tracking-tight", APPT_UI.ink)}>Staff &amp; access</h1>
            {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : <Skeleton className="mt-2 h-4 w-80" />}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2 bg-card shadow-none" disabled={exporting || !total} onClick={exportCsv}>
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Export
            </Button>
            {canManageUsers && (
              <Button
                className={cn("gap-2", APPT_UI.primaryButton)}
                onClick={() => {
                  setAddKey((k) => k + 1);
                  setAddOpen(true);
                }}
              >
                <UserPlus className="h-4 w-4" />
                Add staff member
              </Button>
            )}
          </div>
        </header>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div role="tablist" aria-label="Staff by role" className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-[#E3E9E5] bg-card p-1 dark:border-border">
            {TABS.map((t) => {
              const active = t === tab;
              const count = stats?.tabs[t];
              return (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(t)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active ? "bg-[#17261F] text-white dark:bg-foreground dark:text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {ROLE_TAB_LABELS[t]}
                  <span
                    className={cn(
                      "min-w-5 rounded-full px-1.5 text-center text-xs tabular-nums",
                      active
                        ? "bg-white/20 text-white dark:bg-background/20 dark:text-background"
                        : t === "deactivated" && (count ?? 0) > 0
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count ?? "–"}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="relative xl:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email or phone"
              aria-label="Search staff"
              className="h-9 bg-card pl-9 shadow-none"
            />
          </div>
        </div>

        <section className={cn(APPT_UI.card, "overflow-hidden")}>
          <div className={cn("hidden border-b border-[#E3E9E5] bg-muted/30 px-5 py-3 text-xs font-medium text-muted-foreground dark:border-border", STAFF_ROW_GRID)}>
            <span>Staff member</span>
            <span>Phone</span>
            <span>Role</span>
            <span>Last active</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          {isLoading ? (
            <div>
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className={cn("flex flex-col gap-3 border-b border-[#E3E9E5] px-5 py-4 last:border-b-0 dark:border-border", STAFF_ROW_GRID)}>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-8 w-24 md:ml-auto" />
                </div>
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <Users className="h-9 w-9 text-muted-foreground/60" />
              <p className={cn("mt-3 font-medium", APPT_UI.ink)}>
                {debouncedSearch ? `No staff match “${debouncedSearch}”` : tab === "deactivated" ? "No deactivated accounts" : "No staff accounts here yet"}
              </p>
            </div>
          ) : (
            <div aria-busy={listQuery.isPlaceholderData} className={cn("transition-opacity", listQuery.isPlaceholderData && "opacity-50")}>
              {rows.map((u) => (
                <StaffRow
                  key={u.id}
                  user={u}
                  role={rolesByKey[u.role]}
                  isSelf={isSelf(u)}
                  canManage={canManage(u)}
                  busy={busyIds.has(u.id)}
                  nowMs={nowMs as number}
                  {...actions}
                />
              ))}
              {listQuery.hasNextPage && (
                <div className="flex justify-center border-t border-[#E3E9E5] p-3 dark:border-border">
                  <Button variant="ghost" size="sm" disabled={listQuery.isFetchingNextPage} onClick={() => listQuery.fetchNextPage()}>
                    {listQuery.isFetchingNextPage ? "Loading…" : "Load more"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {nowMs !== null && (
        <StaffDrawer
          user={drawerUser}
          role={drawerUser ? rolesByKey[drawerUser.role] : undefined}
          rolesLoading={rolesLoading}
          isSelf={drawerUser ? isSelf(drawerUser) : false}
          canManage={drawerUser ? canManage(drawerUser) : false}
          busy={drawerUser ? busyIds.has(drawerUser.id) : false}
          nowMs={nowMs}
          onClose={() => setSelected(null)}
          {...actions}
        />
      )}

      <AddStaffDialog
        key={`add-${addKey}`}
        open={addOpen}
        onOpenChange={setAddOpen}
        roles={roles}
        isSubmitting={creating}
        onSubmit={async (payload) => {
          setCreating(true);
          try {
            const res = await userService.create(payload);
            toast.success(res.msg);
            setAddOpen(false);
            setReveal({ name: res.data.user.full_name, phone: res.data.user.phone_number, password: res.data.temporary_password, mode: "invite" });
            await refresh();
          } catch (err) {
            const e = err as NormalizedApiError;
            toast.error(e.error ?? "Couldn't add staff member", e.msg);
          } finally {
            setCreating(false);
          }
        }}
      />

      <EditStaffDialog
        key={`edit-${editing?.id ?? "none"}`}
        user={editing}
        isSubmitting={editing ? busyIds.has(editing.id) : false}
        onOpenChange={(open) => !open && setEditing(null)}
        onSubmit={async (changes: UpdateStaffPayload) => {
          if (!editing) return;
          if (await run(editing, () => userService.update(editing.id, changes))) setEditing(null);
        }}
      />

      <ChangeRoleDialog
        key={`role-${roleFor?.id ?? "none"}`}
        user={roleFor}
        roles={roles}
        isSubmitting={roleFor ? busyIds.has(roleFor.id) : false}
        onOpenChange={(open) => !open && setRoleFor(null)}
        onSubmit={async (role: StaffRole, doctorId?: string) => {
          if (!roleFor) return;
          if (await run(roleFor, () => userService.changeRole(roleFor.id, role, doctorId))) setRoleFor(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={
          confirm?.kind === "deactivate"
            ? `Deactivate ${firstName(confirm.user.full_name)}?`
            : confirm?.user.status === "invite_sent"
              ? `Resend invite to ${confirm ? firstName(confirm.user.full_name) : ""}?`
              : `Reset ${confirm ? firstName(confirm.user.full_name) : ""}'s password?`
        }
        description={
          confirm?.kind === "deactivate"
            ? `${firstName(confirm.user.full_name)} will be logged out immediately and won't be able to sign in. You can reactivate them later.`
            : confirm
              ? `A new temporary password will be created and shown to you once. ${firstName(confirm.user.full_name)} will be signed out everywhere and must set a new password at next sign-in.`
              : undefined
        }
        confirmLabel={confirm?.kind === "deactivate" ? "Deactivate" : confirm?.user.status === "invite_sent" ? "Create new invite" : "Reset password"}
        variant={confirm?.kind === "deactivate" ? "destructive" : "default"}
        isLoading={confirm ? busyIds.has(confirm.user.id) : false}
        onConfirm={async () => {
          if (!confirm) return;
          const { user: u, kind } = confirm;
          if (kind === "deactivate") {
            if (await run(u, () => userService.deactivate(u.id))) setConfirm(null);
            return;
          }
          const data = await run(u, () => userService.resetPassword(u.id));
          if (data) {
            setConfirm(null);
            setReveal({ name: u.full_name, phone: u.phone_number, password: data.temporary_password, mode: "reset" });
          }
        }}
      />

      <TempPasswordDialog key={reveal?.password ?? "none"} reveal={reveal} onClose={() => setReveal(null)} />
    </div>
  );
}
