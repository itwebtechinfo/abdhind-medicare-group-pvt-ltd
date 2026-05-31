"use client";

import Link from "next/link";
import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";

export const RevenueChart = memo(function RevenueChart() {
  const points = "20,80 60,70 100,55 140,60 180,40 220,45 260,30 300,35";
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">Revenue Overview</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/reports">View Details</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative h-48 w-full sm:h-56">
          <svg
            viewBox="0 0 320 100"
            className="h-full w-full text-primary"
            preserveAspectRatio="none"
            aria-hidden
          >
            {[20, 40, 60, 80].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="320"
                y2={y}
                className="stroke-border"
                strokeWidth="0.5"
              />
            ))}
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
              className="text-primary opacity-90"
            />
          </svg>
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 text-[10px] text-muted-foreground">
            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export const AppointmentDonut = memo(function AppointmentDonut() {
  const segments = [
    { label: "Confirmed", value: 45, color: "hsl(var(--primary))" },
    { label: "Pending", value: 30, color: "hsl(var(--primary) / 0.5)" },
    { label: "Completed", value: 25, color: "hsl(var(--muted-foreground) / 0.35)" },
  ];
  let offset = 0;
  const r = 40;
  const c = 2 * Math.PI * r;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Appointment Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <svg viewBox="0 0 100 100" className="h-40 w-40 shrink-0">
            {segments.map((seg) => {
              const dash = (seg.value / 100) * c;
              const circle = (
                <circle
                  key={seg.label}
                  cx="50"
                  cy="50"
                  r={r}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="18"
                  strokeDasharray={`${dash} ${c - dash}`}
                  strokeDashoffset={-offset}
                  transform="rotate(-90 50 50)"
                />
              );
              offset += dash;
              return circle;
            })}
            <text
              x="50"
              y="50"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground text-[11px] font-bold"
              style={{ fontSize: 11 }}
            >
              24
            </text>
            <text
              x="50"
              y="58"
              textAnchor="middle"
              className="fill-muted-foreground"
              style={{ fontSize: 7 }}
            >
              Total
            </text>
          </svg>
          <ul className="space-y-2 text-sm">
            {segments.map((seg) => (
              <li key={seg.label} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-muted-foreground">{seg.label}</span>
                <span className="font-semibold">{seg.value}%</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
});
