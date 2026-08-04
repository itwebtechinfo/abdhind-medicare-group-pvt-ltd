"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, MessageCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Can } from "@/src/components/rbac/PermissionGate";
import { whatsappService } from "./whatsapp";

function WhatsAppConfigStatusInner() {
  const { data, isLoading } = useQuery({
    queryKey: ["whatsapp", "config-status"],
    queryFn: () => whatsappService.getConfigStatus(),
  });
  const config = data?.data.config ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="h-4 w-4" /> WhatsApp Integration
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        <ul className="divide-y divide-border text-sm">
          {config.map((item) => (
            <li key={item.key} className="flex items-start gap-2.5 py-2">
              {item.configured ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              )}
              <div>
                <p className="font-mono text-xs font-medium">{item.key}</p>
                <p className="text-xs text-muted-foreground">{item.purpose}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

/** Gated separately from the Settings page itself — Settings is reachable
 * by roles (e.g. "account") that have settings:view but no whatsapp_inbox
 * access, and /whatsapp/config-status is broadcast-tier, so it'd 403 for
 * them without this. Never shows the actual secret values, just which env
 * vars are set — see get_whatsapp_config_status in routes/whatsapp.py. */
export function WhatsAppConfigStatusCard() {
  return (
    <Can module="whatsapp_inbox" action="broadcast">
      <WhatsAppConfigStatusInner />
    </Can>
  );
}
