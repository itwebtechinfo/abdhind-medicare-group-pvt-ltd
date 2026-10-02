"use client";

import { useState } from "react";
import { AlertTriangle, Check, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { toast } from "@/src/lib/toast";
import { formatPatientPhone } from "@/src/features/patients/patient";

interface TempPasswordDialogProps {
  /** The temporary password lives only in this component's props — never stored or logged. */
  reveal: { name: string; phone: string; password: string; mode: "invite" | "reset" } | null;
  onClose: () => void;
}

/** Shows a temporary password exactly once, with a copy button. */
export function TempPasswordDialog({ reveal, onClose }: TempPasswordDialogProps) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!reveal) return;
    try {
      await navigator.clipboard.writeText(reveal.password);
      setCopied(true);
    } catch {
      toast.error("Couldn't copy — select the password and copy it manually.");
    }
  };

  return (
    <Dialog open={Boolean(reveal)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-md"
        // A stray click outside must not throw the password away.
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{reveal?.mode === "invite" ? "Staff member added" : "Password reset"}</DialogTitle>
          <DialogDescription>
            Give {reveal?.name} this temporary password. They sign in with their phone number (
            {formatPatientPhone(reveal?.phone)}) and will be asked to set their own password straight away.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 rounded-xl border border-[#E3E9E5] bg-muted/40 p-3 dark:border-border">
          <code className="min-w-0 flex-1 select-all break-all font-mono text-lg font-semibold tracking-wider">
            {reveal?.password}
          </code>
          <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1.5 shadow-none" onClick={copy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>

        <p className="flex gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          This password won&apos;t be shown again. If it&apos;s lost, reset the password to get a new one.
        </p>

        <DialogFooter>
          <Button type="button" onClick={onClose}>
            I&apos;ve copied it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
