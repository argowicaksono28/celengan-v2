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
        "btn-press md:hidden fixed z-40 flex items-center justify-center cursor-pointer",
        "w-14 h-14 rounded-full shadow-fab hover:shadow-card-hover transition-all",
        "bottom-[88px] right-4",
        "hero-gradient text-white",
        className
      )}
    >
      <Plus size={24} strokeWidth={2.5} />
    </button>
  );
}
