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
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E0E0E0] safe-bottom"
      style={{ boxShadow: "0 -1px 8px rgba(0,0,0,0.06)" }}
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
                  "flex flex-col items-center justify-center gap-0.5 h-16 text-xs font-medium w-full",
                  "transition-colors relative",
                  active ? "text-primary" : "text-[#6B6B6B]"
                )}
              >
                {/* Active indicator dot */}
                {active && (
                  <span className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
