"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { toast } from "@/src/lib/toast";
import type { NormalizedApiError } from "@/src/types/api";
import { displayTimeOnly, whatsappService, type ApiMessage } from "./whatsapp";

interface MessageSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phone: string;
}

export function MessageSearchDialog({ open, onOpenChange, phone }: MessageSearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ApiMessage[] | null>(null);

  const searchMutation = useMutation({
    mutationFn: (q: string) => whatsappService.searchMessages(phone, q),
    onSuccess: (res) => setResults(res.data.messages),
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const runSearch = () => {
    const q = query.trim();
    if (!q) return;
    searchMutation.mutate(q);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setQuery("");
          setResults(null);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Search Messages</DialogTitle>
          <DialogDescription>Searches text content within this conversation only.</DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                runSearch();
              }
            }}
            placeholder="Search text…"
          />
          <Button type="button" onClick={runSearch} disabled={!query.trim() || searchMutation.isPending}>
            {searchMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        <div className="max-h-[50vh] space-y-2 overflow-y-auto">
          {results !== null && results.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">No matches found.</p>
          )}
          {results?.map((message) => (
            <div key={message.id} className="rounded-lg border border-border px-3 py-2 text-sm">
              <p className="whitespace-pre-wrap break-words">{message.content.text}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {message.direction === "outbound" ? "Sent" : "Received"} · {displayTimeOnly(message.created_at)}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
