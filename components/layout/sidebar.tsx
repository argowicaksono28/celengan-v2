"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, ArrowLeftRight, Wallet, Target, User, CreditCard, Landmark, BarChart2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const PRIMARY_NAV = [
  { href: "/dashboard",    icon: Home,           label: "Beranda"       },
  { href: "/transaksi",    icon: ArrowLeftRight, label: "Transaksi"     },
  { href: "/akun",         icon: Wallet,         label: "Akun"          },
  { href: "/budget-goals", icon: Target,         label: "Budget & Goals"},
  { href: "/profil",       icon: User,           label: "Profil"        },
] as const;

const SECONDARY_NAV = [
  { href: "/kartu-kredit", icon: CreditCard, label: "Kartu Kredit" },
  { href: "/pinjaman",     icon: Landmark,   label: "Pinjaman"     },
  { href: "/insights",     icon: BarChart2,  label: "Insights"     },
] as const;

interface SidebarProps {
  userName?: string;
  userEmail?: string;
}

export function Sidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-60 z-30 bg-white border-r border-c-border">
      {/* Logo */}
      <div className="flex items-center h-16 px-5 border-b border-c-border">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-fab">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-primary">Celengan</span>
        </Link>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <ul className="space-y-0.5 px-3">
          {PRIMARY_NAV.map(({ href, icon: Icon, label }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer",
                    active
                      ? "bg-primary-light text-primary font-semibold"
                      : "text-[#64748B] hover:bg-surface-2 hover:text-[#0F172A]"
                  )}
                >
                  <Icon size={18} strokeWidth={active ? 2.5 : 1.8} className="flex-shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Separator + More */}
        <div className="mt-5 pt-4 border-t border-c-border mx-3">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest px-3 mb-2">Lainnya</p>
          <ul className="space-y-0.5">
            {SECONDARY_NAV.map(({ href, icon: Icon, label }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer",
                      active
                        ? "bg-primary-light text-primary font-semibold"
                        : "text-[#64748B] hover:bg-surface-2 hover:text-[#0F172A]"
                    )}
                  >
                    <Icon size={18} strokeWidth={active ? 2.5 : 1.8} className="flex-shrink-0" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* User + Logout */}
      <div className="border-t border-c-border px-3 py-4">
        {userName && (
          <div className="flex items-center gap-3 px-3 py-2 mb-1 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#0F172A] truncate">{userName}</p>
              {userEmail && <p className="text-xs text-[#64748B] truncate">{userEmail}</p>}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#64748B] hover:bg-danger-light hover:text-danger transition-colors"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </aside>
  );
}
