"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatRupiah, getCurrentMonthYear } from "@/lib/format";
import { MONTH_NAMES_ID } from "@/lib/constants";
import { EmptyState } from "@/components/ui/empty-state";
import * as Icons from "lucide-react";
import {
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie,
} from "recharts";

function LucideIcon({ name, size = 14, className, style }: { name: string; size?: number; className?: string; style?: React.CSSProperties }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComp = (Icons as any)[name];
  if (!IconComp) return <span style={{ width: size, height: size, display: "inline-block" }} />;
  return <IconComp size={size} className={className} style={style} />;
}

interface CategorySpend {
  name: string;
  icon: string;
  color: string;
  amount: number;
  pct: number;
}

interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
}

export default function InsightsPage() {
  const now = getCurrentMonthYear();
  const [month, setMonth] = useState(now.month);
  const [year, setYear] = useState(now.year);
  const [loading, setLoading] = useState(true);
  const [categorySpend, setCategorySpend] = useState<CategorySpend[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch current month transactions
      const res = await fetch(`/api/transactions?month=${month}&year=${year}&limit=500`);
      const txs: Array<{ type: string; amount: number; category: { name: string; icon: string; color: string } | null }> = await res.json();

      const income = txs.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
      const expense = txs.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
      setTotalIncome(income);
      setTotalExpense(expense);

      // Category breakdown
      const catMap: Record<string, { name: string; icon: string; color: string; amount: number }> = {};
      for (const tx of txs.filter((t) => t.type === "EXPENSE")) {
        const key = tx.category?.name ?? "Lainnya";
        if (!catMap[key]) {
          catMap[key] = { name: key, icon: tx.category?.icon ?? "MoreHorizontal", color: tx.category?.color ?? "#94A3B8", amount: 0 };
        }
        catMap[key].amount += tx.amount;
      }
      const cats = Object.values(catMap).sort((a, b) => b.amount - a.amount);
      setCategorySpend(cats.map((c) => ({ ...c, pct: expense > 0 ? c.amount / expense : 0 })));

      // Monthly trend (last 6 months)
      const trend: MonthlyTrend[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(year, month - 1 - i, 1);
        const m = d.getMonth() + 1;
        const y = d.getFullYear();
        const r = await fetch(`/api/transactions?month=${m}&year=${y}&limit=500`);
        const data: Array<{ type: string; amount: number }> = await r.json();
        trend.push({
          month: MONTH_NAMES_ID[m - 1].slice(0, 3),
          income: data.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0),
          expense: data.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0),
        });
      }
      setMonthlyTrend(trend);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { fetchInsights(); }, [fetchInsights]);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); } else setMonth((m) => m - 1);
  }
  function nextMonth() {
    const n = getCurrentMonthYear();
    if (year === n.year && month === n.month) return;
    if (month === 12) { setMonth(1); setYear((y) => y + 1); } else setMonth((m) => m + 1);
  }
  const isCurrentMonth = (() => {
    const n = getCurrentMonthYear();
    return month === n.month && year === n.year;
  })();

  const COLORS = categorySpend.map((c) => c.color);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-[#0F172A]">Insights</h1>

      {/* Month nav */}
      <div className="flex items-center justify-between bg-white rounded-card px-4 py-2 border border-c-border shadow-card">
        <button onClick={prevMonth} className="p-1.5 rounded-full hover:bg-surface-2">
          <ChevronLeft size={18} className="text-[#64748B]" />
        </button>
        <span className="text-sm font-semibold text-[#0F172A]">{MONTH_NAMES_ID[month - 1]} {year}</span>
        <button onClick={nextMonth} disabled={isCurrentMonth} className="p-1.5 rounded-full hover:bg-surface-2 disabled:opacity-30">
          <ChevronRight size={18} className="text-[#64748B]" />
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-success-light rounded-card p-4">
          <p className="text-xs text-success font-medium mb-1">Pemasukan</p>
          <p className="text-lg font-bold text-success tabular-nums">{formatRupiah(totalIncome)}</p>
        </div>
        <div className="bg-danger-light rounded-card p-4">
          <p className="text-xs text-danger font-medium mb-1">Pengeluaran</p>
          <p className="text-lg font-bold text-danger tabular-nums">{formatRupiah(totalExpense)}</p>
        </div>
      </div>

      {/* Net */}
      <div className={`rounded-card p-4 ${totalIncome - totalExpense >= 0 ? "bg-primary-light" : "bg-danger-light"}`}>
        <p className="text-xs font-medium mb-1" style={{ color: totalIncome - totalExpense >= 0 ? "#10B981" : "#EF4444" }}>Selisih (Tabungan)</p>
        <p className="text-xl font-bold tabular-nums" style={{ color: totalIncome - totalExpense >= 0 ? "#10B981" : "#EF4444" }}>
          {formatRupiah(Math.abs(totalIncome - totalExpense))}
          <span className="text-sm font-normal ml-1">{totalIncome - totalExpense >= 0 ? "surplus" : "defisit"}</span>
        </p>
      </div>

      {/* Trend chart */}
      {!loading && monthlyTrend.length > 0 && (
        <div className="bg-white rounded-card border border-c-border shadow-card p-4">
          <p className="text-sm font-semibold text-[#0F172A] mb-4">Tren 6 Bulan</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={monthlyTrend} barGap={2}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B6B6B" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                formatter={(v) => formatRupiah((v as number) ?? 0)}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E0E0E0" }}
              />
              <Bar dataKey="income" name="Pemasukan" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Pengeluaran" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category breakdown */}
      {!loading && categorySpend.length > 0 ? (
        <div className="bg-white rounded-card border border-c-border shadow-card p-4">
          <p className="text-sm font-semibold text-[#0F172A] mb-4">Pengeluaran per Kategori</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categorySpend}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="amount"
                nameKey="name"
              >
                {categorySpend.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatRupiah((v as number) ?? 0)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {categorySpend.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: cat.color + "20" }}
                >
                  <LucideIcon name={cat.icon} size={13} style={{ color: cat.color }} />
                </div>
                <span className="flex-1 text-sm text-[#334155]">{cat.name}</span>
                <span className="text-xs text-[#64748B] tabular-nums">{Math.round(cat.pct * 100)}%</span>
                <span className="text-sm font-semibold text-[#0F172A] tabular-nums w-28 text-right">{formatRupiah(cat.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : !loading ? (
        <EmptyState icon="BarChart2" title="Tidak ada data" description="Belum ada pengeluaran bulan ini" compact />
      ) : (
        <div className="h-48 bg-white rounded-card border border-c-border animate-pulse" />
      )}
    </div>
  );
}
