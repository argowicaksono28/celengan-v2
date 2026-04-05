import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/format";

interface CurrencyProps {
  amount: number | null | undefined;
  className?: string;
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  colored?: boolean; // use green for positive, red for negative
  showSign?: boolean;
}

const sizeMap = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl font-bold",
  "3xl": "text-3xl font-bold",
};

export function Currency({ amount, className, size = "base", colored, showSign }: CurrencyProps) {
  const num = amount ?? 0;
  const formatted = formatRupiah(Math.abs(num));
  const sign = showSign ? (num >= 0 ? "+" : "-") : num < 0 ? "-" : "";

  return (
    <span
      className={cn(
        "tabular-nums font-medium",
        sizeMap[size],
        colored && num > 0 && "text-success",
        colored && num < 0 && "text-danger",
        colored && num === 0 && "text-[#6B6B6B]",
        className
      )}
    >
      {sign}
      {formatted}
    </span>
  );
}
