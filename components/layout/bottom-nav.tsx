"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ArrowLeftRight, Wallet, Target, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard",    icon: Home,            label: "Beranda"  },
  { href: "/transaksi",    icon: ArrowLeftRight,  label: "Transaksi" },
  { href: "/akun",         icon: Wallet,          label: "Akun"     },
  { href: "/budget-goals", icon: Target,          label: "Budget"   },
  { href: "/profil",       icon: User,            label: "Profil"   },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-c-border safe-bottom"
      style={{ boxShadow: "0 -4px 20px rgba(99,102,241,0.06)" }}
    >
      <ul className="flex items-center h-16">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/profil" && pathname.startsWith(href + "/"));
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-label={label}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 h-16 w-full",
                  "transition-colors relative cursor-pointer",
                  active ? "text-primary" : "text-[#94A3B8]"
                )}
              >
                {/* Active pill indicator */}
                {active && (
                  <span className="absolute top-1.5 left-1/2 -translate-x-1/2 w-5 h-1 rounded-chip bg-primary opacity-70" />
                )}
                <Icon
                  size={22}
                  strokeWidth={active ? 2.5 : 1.8}
                  className={cn(active && "drop-shadow-[0_0_6px_rgba(99,102,241,0.4)]")}
                />
                <span className={cn("text-[10px] font-semibold tracking-tight", active && "font-bold")}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
