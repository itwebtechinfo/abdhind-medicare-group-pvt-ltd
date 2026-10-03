"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { toast } from "@/src/lib/toast";
import type { NormalizedApiError } from "@/src/types/api";
import { APPT_UI } from "@/src/features/appointments/StatusBadge";
import { inboxService, type SavedReply } from "./inbox";

export const SAVED_REPLIES_KEY = ["inbox", "saved-replies"] as const;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  replies: SavedReply[];
  canManage: boolean;
  /** Start straight in edit mode for this reply (e.g. an unset Timings chip). */
  editing?: SavedReply | null;
  onPick: (text: string) => void;
}

/** Pick a saved reply to insert into the composer; reception/admin can add, edit and delete. */
export function SavedRepliesDialog({ open, onOpenChange, replies, canManage, editing: editingProp, onPick }: Props) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<SavedReply | "new" | null>(editingProp ?? null);
  const [title, setTitle] = useState(editingProp?.title ?? "");
  const [text, setText] = useState(editingProp?.text ?? "");

  const startEdit = (r: SavedReply | "new") => {
    setEditing(r);
    setTitle(r === "new" ? "" : r.title);
    setText(r === "new" ? "" : r.text);
  };
  const done = () => {
    queryClient.invalidateQueries({ queryKey: SAVED_REPLIES_KEY });
    setEditing(null);
  };
  const save = useMutation({
    mutationFn: () =>
      editing === "new"
        ? inboxService.createSavedReply(title.trim(), text.trim())
        : inboxService.updateSavedReply((editing as SavedReply).id, { title: title.trim(), text: text.trim() }),
    onSuccess: (res) => {
      toast.success(res.msg);
      done();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });
  const remove = useMutation({
    mutationFn: (id: string) => inboxService.deleteSavedReply(id),
    onSuccess: (res) => {
      toast.success(res.msg);
      done();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setEditing(null); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? (editing === "new" ? "New saved reply" : `Edit "${(editing as SavedReply).title}"`) : "Saved replies"}</DialogTitle>
          <DialogDescription>
            {editing ? "Inserted into the reply box - you can still edit before sending." : "Click one to insert it into your reply."}
          </DialogDescription>
        </DialogHeader>
        {editing ? (
          <div className="space-y-3">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (e.g. Parking)" maxLength={40} aria-label="Title"
              disabled={editing !== "new" && Boolean((editing as SavedReply).key)} />
            <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder="Message text" aria-label="Reply text" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>Back</Button>
              <Button className={APPT_UI.primaryButton} disabled={!title.trim() || !text.trim() || save.isPending} onClick={() => save.mutate()}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <ul className="max-h-[50vh] space-y-1 overflow-y-auto">
              {replies.map((r) => (
                <li key={r.id} className="group flex items-start gap-2 rounded-lg border border-[#E3E9E5] p-2.5 dark:border-border">
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left disabled:opacity-60"
                    disabled={r.needs_setup}
                    onClick={() => { onPick(r.text); onOpenChange(false); }}
                  >
                    <p className="font-medium">{r.icon} {r.title}</p>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{r.needs_setup ? "Not set up yet." : r.text}</p>
                  </button>
                  {canManage && (
                    <div className="flex shrink-0 gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" aria-label={`Edit ${r.title}`} onClick={() => startEdit(r)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {!r.key && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" aria-label={`Delete ${r.title}`} onClick={() => remove.mutate(r.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            {canManage && (
              <Button variant="outline" className="w-full" onClick={() => startEdit("new")}>
                <Plus className="mr-1 h-4 w-4" /> Add saved reply
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
