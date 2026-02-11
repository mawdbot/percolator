"use client";

import { useMemo } from "react";
import type { OhlcvPoint } from "@/lib/birdeye";

export function MawdMiniChart({ data }: { data: OhlcvPoint[] }) {
  const path = useMemo(() => {
    if (!data.length) return "";
    const prices = data.map((d) => d.c);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    const width = 100;
    const height = 40;

    return data
      .map((d, i) => {
        const x = (i / (data.length - 1 || 1)) * width;
        const y = height - ((d.c - min) / range) * height;
        return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");
  }, [data]);

  if (!path) {
    return (
      <div className="h-20 flex items-center justify-center text-[10px] text-slate-600">
        No chart data
      </div>
    );
  }

  const first = data[0]?.c ?? 0;
  const last = data[data.length - 1]?.c ?? 0;
  const up = last >= first;

  return (
    <svg viewBox="0 0 100 40" className="w-full h-20">
      <path
        d={path}
        fill="none"
        stroke={up ? "#22c55e" : "#fb7185"}
        strokeWidth="1.5"
      />
    </svg>
  );
}
