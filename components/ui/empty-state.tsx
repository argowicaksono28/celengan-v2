import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  compact?: boolean;
  action?: { label: string; onClick: () => void };
  className?: string;
}

function LucideIcon({ name, size = 28 }: { name: string; size?: number }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComp = (Icons as any)[name];
  if (!IconComp) return null;
  return <IconComp size={size} />;
}

export function EmptyState({ title, description, icon, compact, action, className }: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center",
      compact ? "px-4 py-8 space-y-2" : "px-8 py-16 space-y-4",
      className
    )}>
      <div className={cn(
        "rounded-full bg-surface flex items-center justify-center text-[#C0C0C0]",
        compact ? "w-12 h-12 mb-1" : "w-20 h-20 mb-2"
      )}>
        {icon ? (
          <LucideIcon name={icon} size={compact ? 20 : 32} />
        ) : (
          <svg width={compact ? 20 : 40} height={compact ? 20 : 40} viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="16" stroke="#E0E0E0" strokeWidth="2.5"/>
            <path d="M20 14v8M20 26v.5" stroke="#E0E0E0" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        )}
      </div>
      <div>
        <h3 className={cn("font-semibold text-[#1A1A1A]", compact ? "text-base mb-0.5" : "text-xl mb-1")}>{title}</h3>
        {description && <p className={cn("text-[#6B6B6B]", compact ? "text-xs" : "text-sm max-w-xs")}>{description}</p>}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-btn text-sm hover:bg-primary-dark transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
