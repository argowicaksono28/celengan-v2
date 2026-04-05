import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "primary";

const variantMap: Record<BadgeVariant, string> = {
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  danger:  "bg-danger-light text-danger",
  neutral: "bg-surface text-[#6B6B6B]",
  primary: "bg-primary-light text-primary",
};

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

export function Badge({ variant = "neutral", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-chip text-xs font-medium",
        variantMap[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
