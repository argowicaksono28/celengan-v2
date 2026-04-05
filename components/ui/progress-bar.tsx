"use client";

import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/format";
import { useEffect, useState } from "react";

interface ProgressBarProps {
  value: number;    // spent
  max: number;      // budget
  label?: string;
  showValues?: boolean;
  className?: string;
  animated?: boolean;
}

function getBudgetColor(pct: number): { bar: string; text: string } {
  if (pct >= 0.9) return { bar: "bg-danger",  text: "text-danger" };
  if (pct >= 0.7) return { bar: "bg-warning", text: "text-warning" };
  return            { bar: "bg-success", text: "text-success" };
}

export function ProgressBar({
  value,
  max,
  label,
  showValues = true,
  className,
  animated = true,
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const { bar, text } = getBudgetColor(pct);
  const [width, setWidth] = useState(animated ? 0 : pct * 100);
  const overspent = value > max;

  useEffect(() => {
    if (!animated) return;
    const t = setTimeout(() => setWidth(pct * 100), 80);
    return () => clearTimeout(t);
  }, [pct, animated]);

  return (
    <div className={cn("space-y-1", className)}>
      {(label || showValues) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium text-[#3D3D3D] truncate">{label}</span>}
          {showValues && (
            <span className={cn("ml-auto tabular-nums text-xs", text)}>
              {Math.round(pct * 100)}%
            </span>
          )}
        </div>
      )}

      {/* Bar container */}
      <div className="h-2 bg-[#E0E0E0] rounded-chip overflow-hidden">
        <div
          className={cn(
            "h-full rounded-chip progress-fill",
            bar,
            overspent && "animate-pulse-overspend"
          )}
          style={{ width: `${width}%` }}
        />
      </div>

      {showValues && (
        <div className="flex items-center justify-between text-xs text-[#6B6B6B] tabular-nums">
          <span>{formatRupiah(value)}</span>
          {overspent ? (
            <span className="text-danger font-medium">
              +{formatRupiah(value - max)} melebihi budget
            </span>
          ) : (
            <span>Sisa {formatRupiah(max - value)}</span>
          )}
        </div>
      )}
    </div>
  );
}
