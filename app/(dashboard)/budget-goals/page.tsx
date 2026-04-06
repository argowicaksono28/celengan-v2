"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { Plus, X, ChevronLeft, ChevronRight, Trash2, Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah, getCurrentMonthYear, daysUntil, monthlySavingsNeeded } from "@/lib/format";
import { MONTH_NAMES_ID, FREE_GOAL_LIMIT, FREE_GOAL_WARN_AT } from "@/lib/constants";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import * as Icons from "lucide-react";

function LucideIcon({ name, size = 16, className }: { name: string; size?: number; className?: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComp = (Icons as any)[name];
  if (!IconComp) return <span className={className} style={{ width: size, height: size, display: "inline-block" }} />;
  return <IconComp size={size} className={className} />;
}

interface BudgetItem {
  id: string;
  amount: number;
  spent: number;
  category: { id: string; name: string; icon: string; color: string } | null;
}

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  icon: string;
  deadline: string | null;
  is_completed: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

const GOAL_ICON_OPTIONS = ["🎯", "🏠", "✈️", "🚗", "📱", "💍", "🎓", "🏋️", "🎸", "💻", "🌴", "💰"];

export default function BudgetGoalsPage() {
  const now = getCurrentMonthYear();
  const [month, setMonth] = useState(now.month);
  const [year, setYear] = useState(now.year);

  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [overallBudget, setOverallBudget] = useState<{ amount: number; spent: number } | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetCategoryId, setBudgetCategoryId] = useState<string | null>(null);

  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalSaved, setGoalSaved] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");
  const [goalIcon, setGoalIcon] = useState("🎯");
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [budgetRes, goalRes, catRes] = await Promise.all([
      fetch(`/api/budgets?month=${month}&year=${year}`),
      fetch("/api/goals"),
      fetch("/api/categories"),
    ]);
    const budgetData = await budgetRes.json();
    const goalData = await goalRes.json();
    const catData = await catRes.json();

    setBudgets(budgetData.budgets?.filter((b: BudgetItem) => b.category) ?? []);
    setOverallBudget(budgetData.overallBudget ?? null);
    if (budgetData.budgets) {
      const ob = budgetData.budgets.find((b: BudgetItem) => !b.category);
      if (ob) setOverallBudget({ amount: ob.amount, spent: ob.spent });
    }
    setGoals(Array.isArray(goalData) ? goalData : []);
    setCategories(Array.isArray(catData) ? catData.filter((c: Category & { tx_type: string }) => c.tx_type === "EXPENSE" || c.tx_type === "BOTH") : []);
    setLoading(false);
  }, [month, year]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

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

  async function handleSaveBudget() {
    const amount = parseInt(budgetAmount.replace(/\D/g, ""));
    if (!amount) { toast.error("Masukkan jumlah budget"); return; }
    setSaving(true);
    const res = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, category_id: budgetCategoryId, month, year }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Budget disimpan!");
      setShowBudgetForm(false);
      setBudgetAmount("");
      setBudgetCategoryId(null);
      fetchAll();
    } else {
      toast.error("Gagal menyimpan budget");
    }
  }

  async function handleDeleteBudget(id: string) {
    await fetch(`/api/budgets/${id}`, { method: "DELETE" });
    toast.success("Budget dihapus");
    fetchAll();
  }

  async function handleSaveGoal() {
    const target = parseInt(goalTarget.replace(/\D/g, ""));
    const saved = parseInt(goalSaved.replace(/\D/g, "") || "0");
    if (!goalName || !target) { toast.error("Isi nama dan target"); return; }
    setSaving(true);
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: goalName,
        target_amount: target,
        saved_amount: saved,
        deadline: goalDeadline || null,
        icon: goalIcon,
      }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Goal ditambahkan!");
      setShowGoalForm(false);
      setGoalName(""); setGoalTarget(""); setGoalSaved(""); setGoalDeadline(""); setGoalIcon("🎯");
      fetchAll();
    } else {
      const err = await res.json();
      if (err.error === "GOAL_LIMIT_REACHED") {
        toast.error(`Kamu sudah mencapai batas ${FREE_GOAL_LIMIT} goals. Upgrade ke Pro untuk lebih.`);
      } else {
        toast.error("Gagal menyimpan goal");
      }
    }
  }

  async function handleMarkGoalDone(id: string) {
    await fetch(`/api/goals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_completed: true }),
    });
    toast.success("Goal selesai! 🎉");
    fetchAll();
  }

  async function handleDeleteGoal(id: string) {
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
    toast.success("Goal dihapus");
    fetchAll();
  }

  const activeGoalCount = goals.filter((g) => !g.is_completed).length;
  const atLimit = activeGoalCount >= FREE_GOAL_LIMIT;
  const nearLimit = activeGoalCount >= FREE_GOAL_WARN_AT;

  return (
    <div className="space-y-5 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#0F172A]">Budget & Goals</h1>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between bg-white rounded-card px-4 py-2 border border-c-border shadow-card">
        <button onClick={prevMonth} className="p-1.5 rounded-full hover:bg-surface-2 transition-colors">
          <ChevronLeft size={18} className="text-[#64748B]" />
        </button>
        <span className="text-sm font-semibold text-[#0F172A]">{MONTH_NAMES_ID[month - 1]} {year}</span>
        <button onClick={nextMonth} disabled={isCurrentMonth} className="p-1.5 rounded-full hover:bg-surface-2 transition-colors disabled:opacity-30">
          <ChevronRight size={18} className="text-[#64748B]" />
        </button>
      </div>

      {/* === BUDGET SECTION === */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-[#0F172A]">Budget</h2>
          <button
            onClick={() => setShowBudgetForm(true)}
            className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
          >
            <Plus size={13} /> Tambah
          </button>
        </div>

        {/* Overall budget alert */}
        {overallBudget && (() => {
          const pct = overallBudget.spent / overallBudget.amount;
          if (pct < 0.8) return null;
          return (
            <div className={cn(
              "rounded-card px-4 py-2.5 mb-3 text-sm flex items-center gap-2",
              pct >= 1 ? "bg-danger-light text-danger" : "bg-warning-light text-warning"
            )}>
              <AlertTriangle size={14} />
              {pct >= 1
                ? `Budget habis! Kelebihan ${formatRupiah(overallBudget.spent - overallBudget.amount)}`
                : `${Math.round(pct * 100)}% budget terpakai. Hati-hati!`
              }
            </div>
          );
        })()}

        {showBudgetForm && (
          <div className="bg-white rounded-card border border-c-border p-4 mb-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#0F172A]">Budget Baru</p>
              <button onClick={() => setShowBudgetForm(false)}><X size={16} className="text-[#64748B]" /></button>
            </div>
            <div>
              <label className="text-xs font-medium text-[#64748B] mb-1 block">Kategori (kosongkan = keseluruhan)</label>
              <select
                value={budgetCategoryId ?? ""}
                onChange={(e) => setBudgetCategoryId(e.target.value || null)}
                className="w-full px-3 py-2 border border-c-border rounded-btn text-sm text-[#0F172A] focus:outline-none focus:border-primary bg-white"
              >
                <option value="">Keseluruhan</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#64748B] mb-1 block">Jumlah Budget</label>
              <div className="flex items-center border border-c-border rounded-btn px-3 py-2 gap-1 focus-within:border-primary">
                <span className="text-sm text-[#64748B]">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={budgetAmount ? parseInt(budgetAmount.replace(/\D/g,"")).toLocaleString("id-ID") : ""}
                  onChange={(e) => setBudgetAmount(e.target.value.replace(/\D/g,""))}
                  placeholder="0"
                  className="flex-1 text-sm font-bold text-[#0F172A] tabular-nums outline-none bg-transparent"
                  autoFocus
                />
              </div>
            </div>
            <button
              onClick={handleSaveBudget}
              disabled={saving}
              className="w-full py-2.5 bg-primary rounded-btn text-sm font-semibold text-white hover:bg-primary-dark disabled:bg-[#E0E0E0] transition-colors"
            >
              {saving ? "Menyimpan..." : "Simpan Budget"}
            </button>
          </div>
        )}

        {/* Overall budget progress */}
        {overallBudget && (
          <div className="bg-white rounded-card border border-c-border shadow-card p-4 mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#0F172A]">Keseluruhan</span>
              <span className="text-xs text-[#64748B] tabular-nums">
                {formatRupiah(overallBudget.spent)} / {formatRupiah(overallBudget.amount)}
              </span>
            </div>
            <ProgressBar value={overallBudget.spent} max={overallBudget.amount} showValues />
          </div>
        )}

        {/* Category budgets */}
        {loading ? (
          <div className="space-y-2">
            {[1,2].map((i) => <div key={i} className="h-16 bg-white rounded-card border border-c-border animate-pulse" />)}
          </div>
        ) : budgets.length === 0 && !overallBudget ? (
          <EmptyState icon="Target" title="Belum ada budget" description="Buat budget untuk mengontrol pengeluaran" compact />
        ) : (
          <div className="space-y-2">
            {budgets.map((b) => (
              <div key={b.id} className="bg-white rounded-card border border-c-border shadow-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <LucideIcon name={b.category!.icon} size={14} className="text-[#64748B]" />
                    <span className="text-sm font-medium text-[#0F172A]">{b.category!.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#64748B] tabular-nums">{formatRupiah(b.spent)} / {formatRupiah(b.amount)}</span>
                    <button onClick={() => handleDeleteBudget(b.id)} className="text-[#CBD5E1] hover:text-danger transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <ProgressBar value={b.spent} max={b.amount} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* === GOALS SECTION === */}
      <div id="goals-section">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#0F172A]">Goals Tabungan</h2>
            <Badge variant="neutral">{activeGoalCount}/{FREE_GOAL_LIMIT}</Badge>
          </div>
          {!atLimit && (
            <button
              onClick={() => setShowGoalForm(true)}
              className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
            >
              <Plus size={13} /> Tambah
            </button>
          )}
        </div>

        {/* Upgrade prompt */}
        {nearLimit && !atLimit && (
          <div className="bg-warning-light rounded-card px-4 py-3 mb-3 text-sm text-warning">
            Kamu sudah punya {activeGoalCount} dari {FREE_GOAL_LIMIT} goals. Upgrade ke Pro untuk goals tak terbatas.
          </div>
        )}
        {atLimit && (
          <div className="bg-warning-light rounded-card px-4 py-3 mb-3">
            <p className="text-sm font-semibold text-warning mb-1">Batas goals tercapai</p>
            <p className="text-xs text-warning">Kamu sudah punya {FREE_GOAL_LIMIT} goals aktif. Selesaikan goal yang ada atau upgrade ke Pro.</p>
          </div>
        )}

        {showGoalForm && (
          <div className="bg-white rounded-card border border-c-border p-4 mb-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#0F172A]">Goal Baru</p>
              <button onClick={() => setShowGoalForm(false)}><X size={16} className="text-[#64748B]" /></button>
            </div>
            {/* Icon picker */}
            <div className="flex flex-wrap gap-2">
              {GOAL_ICON_OPTIONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setGoalIcon(ic)}
                  className={cn(
                    "w-9 h-9 rounded-btn text-xl flex items-center justify-center border-2 transition-all",
                    goalIcon === ic ? "border-primary bg-primary-light" : "border-transparent hover:border-c-border"
                  )}
                >
                  {ic}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value.slice(0, 40))}
              placeholder="Nama goal (contoh: Beli iPhone)"
              className="w-full px-3 py-2 border border-c-border rounded-btn text-sm focus:outline-none focus:border-primary"
              autoFocus
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-[#64748B] mb-1 block">Target</label>
                <div className="flex items-center border border-c-border rounded-btn px-3 py-2 gap-1 focus-within:border-primary">
                  <span className="text-xs text-[#64748B]">Rp</span>
                  <input
                    type="text" inputMode="numeric"
                    value={goalTarget ? parseInt(goalTarget.replace(/\D/g,"")).toLocaleString("id-ID") : ""}
                    onChange={(e) => setGoalTarget(e.target.value.replace(/\D/g,""))}
                    placeholder="0"
                    className="flex-1 text-sm font-bold text-[#0F172A] tabular-nums outline-none bg-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-[#64748B] mb-1 block">Sudah ditabung</label>
                <div className="flex items-center border border-c-border rounded-btn px-3 py-2 gap-1 focus-within:border-primary">
                  <span className="text-xs text-[#64748B]">Rp</span>
                  <input
                    type="text" inputMode="numeric"
                    value={goalSaved ? parseInt(goalSaved.replace(/\D/g,"")).toLocaleString("id-ID") : ""}
                    onChange={(e) => setGoalSaved(e.target.value.replace(/\D/g,""))}
                    placeholder="0"
                    className="flex-1 text-sm font-bold text-[#0F172A] tabular-nums outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs text-[#64748B] mb-1 block">Deadline (opsional)</label>
              <input
                type="date"
                value={goalDeadline}
                onChange={(e) => setGoalDeadline(e.target.value)}
                className="w-full px-3 py-2 border border-c-border rounded-btn text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <button
              onClick={handleSaveGoal}
              disabled={saving || !goalName || !goalTarget}
              className="w-full py-2.5 bg-primary rounded-btn text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50 transition-colors"
            >
              {saving ? "Menyimpan..." : "Buat Goal"}
            </button>
          </div>
        )}

        {goals.length === 0 ? (
          <EmptyState
            icon="Target"
            title="Belum ada goals"
            description="Buat goals tabungan untuk capai impianmu"
            action={atLimit ? undefined : { label: "Buat Goal", onClick: () => setShowGoalForm(true) }}
            compact
          />
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => {
              const pct = Math.min(goal.saved_amount / goal.target_amount, 1);
              const remaining = goal.target_amount - goal.saved_amount;
              const days = goal.deadline ? daysUntil(goal.deadline) : null;
              const monthly = (goal.deadline && remaining > 0) ? monthlySavingsNeeded(remaining, goal.deadline) : null;

              return (
                <div key={goal.id} className="bg-white rounded-card border border-c-border shadow-card p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0 mt-0.5">{goal.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-[#0F172A] truncate">{goal.name}</p>
                        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                          {pct >= 1 && (
                            <button
                              onClick={() => handleMarkGoalDone(goal.id)}
                              className="p-1.5 rounded-full bg-success-light text-success hover:bg-success hover:text-white transition-colors"
                            >
                              <Check size={12} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="p-1.5 rounded-full text-[#CBD5E1] hover:text-danger hover:bg-danger-light transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-[#64748B] tabular-nums">
                          {formatRupiah(goal.saved_amount)} / {formatRupiah(goal.target_amount)}
                        </span>
                        <span className="inline-flex items-center rounded-chip bg-primary-light text-primary text-xs font-bold px-2 py-0.5">
                          {Math.round(pct * 100)}%
                        </span>
                      </div>
                      <ProgressBar value={goal.saved_amount} max={goal.target_amount} />
                      {(days !== null || monthly !== null) && (
                        <div className="flex gap-3 mt-2">
                          {days !== null && (
                            <span className="text-xs text-[#64748B]">
                              {days > 0 ? `${days} hari lagi` : days === 0 ? "Hari ini!" : "Sudah lewat"}
                            </span>
                          )}
                          {monthly !== null && monthly > 0 && (
                            <span className="text-xs text-[#64748B]">
                              Nabung {formatRupiah(monthly)}/bln
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Fixed bottom action bar */}
      {!showGoalForm && (
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-c-border px-4 py-3 flex gap-3 md:hidden">
          <button
            onClick={() => {
              const el = document.getElementById("goals-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex-1 py-3 border border-primary text-primary font-semibold rounded-btn text-sm hover:bg-primary-light transition-colors"
          >
            Lihat Goals
          </button>
          <button
            onClick={() => { setShowGoalForm(true); }}
            disabled={atLimit}
            className="flex-1 py-3 hero-gradient text-white font-semibold rounded-btn text-sm hover:opacity-90 disabled:opacity-40 transition-opacity shadow-fab"
          >
            + Tambah Goal
          </button>
        </div>
      )}
    </div>
  );
}
