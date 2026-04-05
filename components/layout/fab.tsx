"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FabProps {
  onClick: () => void;
  className?: string;
}

export function Fab({ onClick, className }: FabProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Tambah transaksi"
      className={cn(
        "btn-press md:hidden fixed z-40 flex items-center justify-center",
        "w-14 h-14 rounded-full bg-primary text-white",
        "shadow-fab hover:bg-primary-dark transition-colors",
        "bottom-[88px] right-4",
        className
      )}
      style={{ boxShadow: "0 4px 12px rgba(104,182,132,0.30)" }}
    >
      <Plus size={24} strokeWidth={2.5} />
    </button>
  );
}
