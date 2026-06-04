import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";

interface ErpPageShellProps {
  title: string;
  description: string;
  icon: LucideIcon;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

export function ErpPageShell({
  title,
  description,
  icon: Icon,
  children,
  actions,
}: ErpPageShellProps) {
  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <Card className="mb-6 overflow-hidden border-border/80 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                {title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </CardContent>
      </Card>

      
    </div>
  );
}
