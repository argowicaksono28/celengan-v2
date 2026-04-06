"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, TrendingUp, Wallet, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah, formatRelativeDate, getDayGreeting, getCurrentMonthYear } from "@/lib/format";
import { MONTH_NAMES_ID } from "@/lib/constants";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SkeletonDashboard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import * as Icons from "lucide-react";

function LucideIcon({ name, size = 16, className, style }: { name: string; size?: number; className?: string; style?: React.CSSProperties }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComp = (Icons as any)[name];
  if (!IconComp) return <span className={className} style={{ width: size, height: size, display: "inline-block" }} />;
  return <IconComp size={size} className={className} style={style} />;
}

interface DashboardData {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  accounts: Array<{ id: string; name: string; icon: string; color: string; balance: number; type: string }>;
  budgets: Array<{
    id: string;
    amount: number;
    spent: number;
    category: { id: string; name: string; icon: string; color: string } | null;
  }>;
  overallBudget: { amount: number; spent: number } | null;
  goals: Array<{ id: string; name: string; target_amount: number; saved_amount: number; icon: string; deadline: string | null }>;
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    note: string | null;
    date: string;
    account: { id: string; name: string; icon: string } | null;
    category: { id: string; name: string; icon: string; color: string } | null;
  }>;
  month: number;
  year: number;
}

export default function DashboardPage() {
  const now = getCurrentMonthYear();
  const [month, setMonth] = useState(now.month);
  const [year, setYear] = useState(now.year);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard?month=${month}&year=${year}`);
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handler = () => fetchData();
    window.addEventListener("transaction-added", handler);
    return () => window.removeEventListener("transaction-added", handler);
  }, [fetchData]);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    const nowM = getCurrentMonthYear();
    if (year === nowM.year && month === nowM.month) return;
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const isCurrentMonth = (() => {
    const n = getCurrentMonthYear();
    return month === n.month && year === n.year;
  })();

  if (loading) return <SkeletonDashboard />;
  if (!data) return <EmptyState icon="AlertCircle" title="Gagal memuat data" description="Coba refresh halaman" />;

  const { overallBudget } = data;
  const budgetPct = overallBudget ? overallBudget.spent / overallBudget.amount : 0;
  const overBudget = overallBudget && overallBudget.spent > overallBudget.amount;

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <p className="text-sm text-[#64748B]">{getDayGreeting()}</p>

      {/* Budget Alert Banner */}
      {overallBudget && budgetPct >= 0.8 && (
        <div className={cn(
          "rounded-card px-4 py-3 text-sm font-semibold flex items-center gap-2",
          overBudget
            ? "bg-danger-light text-danger"
            : "bg-warning-light text-warning"
        )}>
          <span>{overBudget ? "⚠️" : "💛"}</span>
          {overBudget
            ? `Budget habis! Kelebihan: ${formatRupiah(overallBudget.spent - overallBudget.amount)}`
            : `Sudah pakai ${Math.round(budgetPct * 100)}% budget bulan ini`
          }
        </div>
      )}

      {/* Hero Card */}
      <div className="hero-gradient rounded-xl2 p-5 text-white shadow-fab">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="cursor-pointer p-1.5 rounded-full hover:bg-white/20 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-semibold opacity-90 tracking-wide">
            {MONTH_NAMES_ID[month - 1]} {year}
          </span>
          <button
            onClick={nextMonth}
            disabled={isCurrentMonth}
            className="cursor-pointer p-1.5 rounded-full hover:bg-white/20 transition-colors disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Primary: Expense */}
        <div className="text-center mb-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest opacity-70 mb-1">Pengeluaran Bulan Ini</p>
          <p className="text-4xl font-bold tabular-nums">{formatRupiah(data.totalExpense)}</p>
        </div>

        {/* Secondary: Income */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <TrendingUp size={13} className="opacity-60" />
          <span className="text-xs opacity-70">Pemasukan:</span>
          <span className="text-sm font-bold tabular-nums">{formatRupiah(data.totalIncome)}</span>
        </div>

        {/* Sisa budget strip */}
        {overallBudget && overallBudget.amount > overallBudget.spent && (
          <div className="bg-success/20 rounded-xl px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs font-semibold opacity-90">Sisa budget</span>
            <span className="text-sm font-bold tabular-nums">{formatRupiah(overallBudget.amount - overallBudget.spent)}</span>
          </div>
        )}
        {overallBudget && overallBudget.spent >= overallBudget.amount && (
          <div className="bg-white/10 rounded-xl px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs font-semibold opacity-90">Budget habis</span>
            <span className="text-sm font-bold tabular-nums text-red-300">-{formatRupiah(overallBudget.spent - overallBudget.amount)}</span>
          </div>
        )}
      </div>

      {/* Account chips */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-sm font-bold text-[#0F172A]">Akun</h2>
          <Link href="/akun" className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:text-primary-dark transition-colors">
            Lihat semua <ArrowRight size={11} />
          </Link>
        </div>
        {data.accounts.length === 0 ? (
          <EmptyState icon="Wallet" title="Belum ada akun" description="Tambah akun pertamamu" compact />
        ) : (
          <div className="chips-row">
            {data.accounts.map((acc) => (
              <div key={acc.id} className="flex-shrink-0 bg-white rounded-card px-4 py-3 border border-c-border min-w-[140px] shadow-card cursor-default">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-primary-light flex items-center justify-center">
                    <LucideIcon name={acc.icon} size={14} className="text-primary" />
                  </div>
                  <span className="text-xs text-[#64748B] font-medium truncate">{acc.name}</span>
                </div>
                <p className="text-sm font-bold text-[#0F172A] tabular-nums">{formatRupiah(acc.balance)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Overall Budget */}
      {overallBudget && (
        <div className="bg-white rounded-card p-4 border border-c-border shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#0F172A]">Budget Bulan Ini</h2>
            <Link href="/budget-goals" className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:text-primary-dark transition-colors">
              Detail <ArrowRight size={11} />
            </Link>
          </div>
          <ProgressBar value={overallBudget.spent} max={overallBudget.amount} showValues />
        </div>
      )}

      {/* Category budgets (top 3) */}
      {data.budgets.filter((b) => b.category).length > 0 && (
        <div className="bg-white rounded-card p-4 border border-c-border shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#0F172A]">Budget Kategori</h2>
            <Link href="/budget-goals" className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:text-primary-dark transition-colors">
              Lihat semua <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-3">
            {data.budgets.filter((b) => b.category).slice(0, 3).map((b) => (
              <div key={b.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <LucideIcon name={b.category!.icon} size={13} className="text-[#64748B]" />
                    <span className="text-sm text-[#334155] font-medium">{b.category!.name}</span>
                  </div>
                  <span className="text-xs text-[#64748B] tabular-nums">{formatRupiah(b.spent)} / {formatRupiah(b.amount)}</span>
                </div>
                <ProgressBar value={b.spent} max={b.amount} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goals snapshot */}
      {data.goals.length > 0 && (
        <div className="bg-white rounded-card p-4 border border-c-border shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#0F172A]">Goals Tabungan</h2>
            <Link href="/budget-goals" className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:text-primary-dark transition-colors">
              Lihat semua <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-3">
            {data.goals.map((goal) => {
              const pct = Math.min(goal.saved_amount / goal.target_amount, 1);
              return (
                <div key={goal.id} className="flex items-center gap-3">
                  <span className="text-xl flex-shrink-0">{goal.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-[#0F172A] truncate">{goal.name}</span>
                      <span className="text-xs text-[#64748B] tabular-nums ml-2 flex-shrink-0">{Math.round(pct * 100)}%</span>
                    </div>
                    <ProgressBar value={goal.saved_amount} max={goal.target_amount} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-sm font-bold text-[#0F172A]">Transaksi Terakhir</h2>
          <Link href="/transaksi" className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:text-primary-dark transition-colors">
            Lihat semua <ArrowRight size={11} />
          </Link>
        </div>
        {data.recentTransactions.length === 0 ? (
          <EmptyState
            icon="Receipt"
            title="Belum ada transaksi"
            description="Tap tombol + untuk catat transaksi pertamamu"
            compact
          />
        ) : (
          <div className="bg-white rounded-card border border-c-border shadow-card divide-y divide-c-border">
            {data.recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: tx.category?.color ? tx.category.color + "18" : "#F1F5F9" }}
                >
                  {tx.category ? (
                    <LucideIcon name={tx.category.icon} size={16} style={{ color: tx.category.color }} />
                  ) : (
                    <Wallet size={16} className="text-[#94A3B8]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0F172A] truncate">
                    {tx.note ?? tx.category?.name ?? "Transaksi"}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    {tx.account?.name} · {formatRelativeDate(tx.date)}
                  </p>
                </div>
                <p className={cn(
                  "text-sm font-bold tabular-nums flex-shrink-0",
                  tx.type === "INCOME" ? "text-success" : "text-danger"
                )}>
                  {tx.type === "INCOME" ? "+" : "-"}{formatRupiah(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
