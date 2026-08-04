"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileStack } from "lucide-react";
import { CreateTemplateFormCard } from "@/src/features/whatsapp/CreateTemplateFormCard";
import { TemplateRequestsPanel, TEMPLATE_REQUESTS_QUERY_KEY } from "@/src/features/whatsapp/TemplateRequestsPanel";
import { TemplatesPanel, TEMPLATES_QUERY_KEY } from "@/src/features/whatsapp/TemplatesPanel";
import { WhatsAppActivityFeed } from "@/src/features/whatsapp/WhatsAppActivityFeed";
import { WhatsAppPageHeader } from "@/src/features/whatsapp/WhatsAppPageHeader";
import { whatsappService } from "@/src/features/whatsapp/whatsapp";

const PENDING_STATUSES = new Set(["SUBMITTING", "PENDING"]);

export default function WhatsappTemplatesPage() {
  const queryClient = useQueryClient();

  // Same query keys TemplatesPanel/TemplateRequestsPanel use below — React
  // Query dedupes these into the panels' own fetch, so the header badges
  // don't cost a second network round trip.
  const { data: templatesData } = useQuery({
    queryKey: TEMPLATES_QUERY_KEY,
    queryFn: () => whatsappService.listTemplates(),
  });
  const { data: requestsData } = useQuery({
    queryKey: TEMPLATE_REQUESTS_QUERY_KEY,
    queryFn: () => whatsappService.listTemplateRequests(),
  });

  const approvedCount = (templatesData?.data.templates ?? []).filter((t) => t.status === "APPROVED").length;
  const pendingCount = (requestsData?.data.requests ?? []).filter((r) => PENDING_STATUSES.has(r.status)).length;

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <WhatsAppPageHeader
        icon={FileStack}
        title="WhatsApp Templates"
        badges={[
          { label: `${approvedCount} approved`, variant: approvedCount > 0 ? "success" : "secondary" },
          ...(pendingCount > 0 ? [{ label: `${pendingCount} pending`, variant: "warning" as const }] : []),
        ]}
        backHref="/whatsapp/broadcast"
        backLabel="Back to Broadcast"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CreateTemplateFormCard
          onCreated={() => queryClient.invalidateQueries({ queryKey: TEMPLATE_REQUESTS_QUERY_KEY })}
        />
        <div className="space-y-6">
          <TemplatesPanel />
          <TemplateRequestsPanel />
        </div>
      </div>

      <div className="mt-6">
        <WhatsAppActivityFeed />
      </div>
    </div>
  );
}
