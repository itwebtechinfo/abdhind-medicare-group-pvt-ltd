"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Megaphone } from "lucide-react";
import { BroadcastFormCard } from "@/src/features/whatsapp/BroadcastFormCard";
import { BroadcastJobCard } from "@/src/features/whatsapp/BroadcastJobCard";
import { WhatsAppPageHeader } from "@/src/features/whatsapp/WhatsAppPageHeader";
import { whatsappService } from "@/src/features/whatsapp/whatsapp";

export default function WhatsappBroadcastPage() {
  const [sessionJobIds, setSessionJobIds] = useState<string[]>([]);

  const { data: templatesData } = useQuery({
    queryKey: ["whatsapp", "templates"],
    queryFn: () => whatsappService.listTemplates("approved"),
  });
  const approvedCount = templatesData?.data.count ?? 0;

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ["whatsapp", "broadcast", "history"],
    queryFn: () => whatsappService.listBroadcastJobs(),
  });
  const historyJobIds = (historyData?.data.jobs ?? []).map((j) => j.id);

  // Session-created jobs surface immediately (no need to wait for a
  // refetch); persisted history fills in the rest, already newest-first.
  const jobIds = [...sessionJobIds, ...historyJobIds.filter((id) => !sessionJobIds.includes(id))];

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <WhatsAppPageHeader
        icon={Megaphone}
        title="WhatsApp Broadcast"
        badges={[{ label: `${approvedCount} template${approvedCount === 1 ? "" : "s"} ready`, variant: approvedCount > 0 ? "success" : "secondary" }]}
        backHref="/whatsapp"
        backLabel="Back to Inbox"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BroadcastFormCard onCreated={(jobId) => setSessionJobIds((prev) => [jobId, ...prev])} />

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Broadcasts</h2>
          {!historyLoading && jobIds.length === 0 && (
            <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Broadcast jobs you create will show live progress here.
            </p>
          )}
          {jobIds.map((jobId) => (
            <BroadcastJobCard key={jobId} jobId={jobId} />
          ))}
        </div>
      </div>
    </div>
  );
}
