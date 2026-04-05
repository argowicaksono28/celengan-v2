"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { Search, X, ChevronLeft, ChevronRight, Trash2, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah, formatRelativeDate, getCurrentMonthYear } from "@/lib/format";
import { MONTH_NAMES_ID } from "@/lib/constants";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonList } from "@/components/ui/skeleton";
import { toast } from "sonner";
import * as Icons from "lucide-react";

function LucideIcon({ name, size = 16, className, style }: { name: string; size?: number; className?: string; style?: React.CSSProperties }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComp = (Icons as any)[name];
  if (!IconComp) return <span className={className} style={{ ...style, width: size, height: size, display: "inline-block" }} />;
  return <IconComp size={size} className={className} style={style} />;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  note: string | null;
  date: string;
  account: { id: string; name: string; icon: string } | null;
  category: { id: string; name: string; icon: string; color: string } | null;
}

interface GroupedTransactions {
  date: string;
  transactions: Transaction[];
}

function groupByDate(txs: Transaction[]): GroupedTransactions[] {
  const map = new Map<string, Transaction[]>();
  for (const tx of txs) {
    const list = map.get(tx.date) ?? [];
    list.push(tx);
    map.set(tx.date, list);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, transactions]) => ({ date, transactions }));
}

export default function TransaksiPage() {
  const now = getCurrentMonthYear();
  const [month, setMonth] = useState(now.month);
  const [year, setYear] = useState(now.year);
  const [typeFilter, setTypeFilter] = useState<"ALL" | "EXPENSE" | "INCOME">("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchTxs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        month: String(month),
        year: String(year),
        limit: "200",
      });
      if (typeFilter !== "ALL") params.set("type", typeFilter);
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await fetch(`/api/transactions?${params}`);
      const data = await res.json();
      setTxs(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [month, year, typeFilter, debouncedSearch]);

  useEffect(() => { fetchTxs(); }, [fetchTxs]);

  useEffect(() => {
    const handler = () => fetchTxs();
    window.addEventListener("transaction-added", handler);
    return () => window.removeEventListener("transaction-added", handler);
  }, [fetchTxs]);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    const n = getCurrentMonthYear();
    if (year === n.year && month === n.month) return;
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const isCurrentMonth = (() => {
    const n = getCurrentMonthYear();
    return month === n.month && year === n.year;
  })();

  async function handleDelete(tx: Transaction) {
    setDeletingId(tx.id);
    let undone = false;
    toast(`Transaksi dihapus`, {
      duration: 5000,
      action: {
        label: "Urungkan",
        onClick: () => { undone = true; setDeletingId(null); fetchTxs(); },
      },
      onDismiss: async () => {
        if (!undone) {
          await fetch(`/api/transactions/${tx.id}`, { method: "DELETE" });
          setDeletingId(null);
          fetchTxs();
        }
      },
    });
    // Optimistic remove
    setTxs((p) => p.filter((t) => t.id !== tx.id));
  }

  const grouped = groupByDate(txs);
  const totalExpense = txs.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  const totalIncome = txs.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-[#1A1A1A]">Transaksi</h1>

      {/* Month nav */}
      <div className="flex items-center justify-between bg-white rounded-card px-4 py-2 border border-[#E0E0E0] shadow-sm">
        <button onClick={prevMonth} className="p-1.5 rounded-full hover:bg-surface transition-colors">
          <ChevronLeft size={18} className="text-[#6B6B6B]" />
        </button>
        <span className="text-sm font-semibold text-[#1A1A1A]">{MONTH_NAMES_ID[month - 1]} {year}</span>
        <button
          onClick={nextMonth}
          disabled={isCurrentMonth}
          className="p-1.5 rounded-full hover:bg-surface transition-colors disabled:opacity-30"
        >
          <ChevronRight size={18} className="text-[#6B6B6B]" />
        </button>
      </div>

      {/* Summary chips */}
      <div className="flex gap-2">
        <div className="flex-1 bg-success-light rounded-card p-3 text-center">
          <p className="text-xs text-success font-medium mb-0.5">Pemasukan</p>
          <p className="text-sm font-bold text-success tabular-nums">{formatRupiah(totalIncome)}</p>
        </div>
        <div className="flex-1 bg-danger-light rounded-card p-3 text-center">
          <p className="text-xs text-danger font-medium mb-0.5">Pengeluaran</p>
          <p className="text-sm font-bold text-danger tabular-nums">{formatRupiah(totalExpense)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari catatan..."
          className="w-full pl-10 pr-9 py-2.5 bg-white border border-[#E0E0E0] rounded-btn text-sm text-[#1A1A1A] focus:outline-none focus:border-primary transition-colors"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X size={14} className="text-[#6B6B6B]" />
          </button>
        )}
      </div>

      {/* Type filter */}
      <div className="flex gap-2">
        {(["ALL", "EXPENSE", "INCOME"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={cn(
              "px-3 py-1.5 rounded-chip text-xs font-semibold border transition-all",
              typeFilter === t
                ? t === "EXPENSE"
                  ? "bg-danger text-white border-danger"
                  : t === "INCOME"
                  ? "bg-success text-white border-success"
                  : "bg-primary text-white border-primary"
                : "bg-white text-[#6B6B6B] border-[#E0E0E0] hover:border-primary/50"
            )}
          >
            {t === "ALL" ? "Semua" : t === "EXPENSE" ? "Pengeluaran" : "Pemasukan"}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      {loading ? (
        <SkeletonList count={5} />
      ) : grouped.length === 0 ? (
        <EmptyState
          icon="Receipt"
          title="Tidak ada transaksi"
          description={debouncedSearch ? "Coba kata kunci lain" : "Belum ada transaksi bulan ini"}
        />
      ) : (
        <div className="space-y-4">
          {grouped.map((group) => (
            <div key={group.date}>
              <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide mb-2 px-1">
                {formatRelativeDate(group.date)}
              </p>
              <div className="bg-white rounded-card border border-[#E0E0E0] shadow-sm divide-y divide-[#E0E0E0]">
                {group.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 transition-opacity",
                      deletingId === tx.id && "opacity-40"
                    )}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: tx.category?.color ? tx.category.color + "20" : "#F5F5F5" }}
                    >
                      {tx.category ? (
                        <LucideIcon name={tx.category.icon} size={16} style={{ color: tx.category.color }} />
                      ) : (
                        <Wallet size={16} className="text-[#6B6B6B]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A1A] truncate">
                        {tx.note ?? tx.category?.name ?? "Transaksi"}
                      </p>
                      <p className="text-xs text-[#6B6B6B]">{tx.account?.name}</p>
                    </div>
                    <p className={cn(
                      "text-sm font-semibold tabular-nums flex-shrink-0",
                      tx.type === "INCOME" ? "text-success" : "text-danger"
                    )}>
                      {tx.type === "INCOME" ? "+" : "-"}{formatRupiah(tx.amount)}
                    </p>
                    <button
                      onClick={() => handleDelete(tx)}
                      disabled={deletingId === tx.id}
                      className="p-1.5 rounded-full hover:bg-danger-light hover:text-danger transition-colors text-[#E0E0E0] ml-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
