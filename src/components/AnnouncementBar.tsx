"use client";

import { useState } from "react";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[1001] flex items-center
        justify-center gap-2 px-4 py-2.5 text-white overflow-hidden"
      style={{
        background: "linear-gradient(90deg,#6366f1,#8b5cf6,#a855f7,#6366f1)",
        backgroundSize: "300% 100%",
        animation: "gradShift 4s linear infinite",
      }}
    >
      <span className="animate-bounce">✨</span>
      <span className="whitespace-nowrap text-xs sm:text-sm font-semibold">
        Summer Special — 30% Off All Consultations!
      </span>
      <span
        className="hidden sm:inline px-2 py-0.5 rounded-full border
          border-white/30 bg-white/20 text-[11px] font-bold tracking-wider"
      >
        LIMITED
      </span>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 text-white/70 hover:text-white text-base"
      >
        ✕
      </button>
    </div>
  );
}