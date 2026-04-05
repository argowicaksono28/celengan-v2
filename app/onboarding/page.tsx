"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, Sparkles, Wallet, Target, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah, parseRupiahInput } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { QUICK_ACCOUNT_CHIPS } from "@/lib/constants";
import { toast } from "sonner";

interface AccountDraft {
  chipName: string;
  name: string;
  type: string;
  icon: string;
  balance: string;
}

export default function OnboardingPage() {
  const supabase = createClient();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState("");

  // Step 1 — accounts
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [accountDrafts, setAccountDrafts] = useState<AccountDraft[]>([]);
  const [totalAnimated, setTotalAnimated] = useState(0);

  // Step 2 — budget
  const [budgetInput, setBudgetInput] = useState("");

  // Step 3 — first expense (done inline)
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      supabase.from("profiles").select("name").eq("id", user.id).single()
        .then(({ data }) => setUserName(data?.name ?? user.email?.split("@")[0] ?? ""));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animate total balance when accounts change
  useEffect(() => {
    const total = accountDrafts.reduce((s, a) => s + (parseRupiahInput(a.balance) ?? 0), 0);
    const start = totalAnimated;
    const diff = total - start;
    if (diff === 0) return;
    const steps = 20;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTotalAnimated(start + Math.round((diff * i) / steps));
      if (i >= steps) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountDrafts]);

  function toggleChip(chip: typeof QUICK_ACCOUNT_CHIPS[number]) {
    if (selectedChips.includes(chip.name)) {
      setSelectedChips((p) => p.filter((k) => k !== chip.name));
      setAccountDrafts((p) => p.filter((a) => a.chipName !== chip.name));
    } else {
      setSelectedChips((p) => [...p, chip.name]);
      setAccountDrafts((p) => [...p, { chipName: chip.name, name: chip.name, type: chip.type, icon: chip.icon, balance: "" }]);
    }
  }

  function updateDraft(chipName: string, field: keyof AccountDraft, value: string) {
    setAccountDrafts((p) => p.map((a) => a.chipName === chipName ? { ...a, [field]: value } : a));
  }

  async function handleSaveAccounts() {
    if (accountDrafts.length === 0) {
      toast.error("Tambahkan minimal 1 akun");
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      for (const draft of accountDrafts) {
        await supabase.from("accounts").insert({
          user_id: user.id,
          name: draft.name,
          type: draft.type,
          icon: draft.icon,
          balance: parseRupiahInput(draft.balance) ?? 0,
          color: "#68B684",
        });
      }
      setStep(2);
    } catch {
      toast.error("Gagal menyimpan akun");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveBudget() {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const amount = parseRupiahInput(budgetInput);
      if (amount && amount > 0) {
        const now = new Date();
        await supabase.from("budgets").insert({
          user_id: user.id,
          category_id: null,
          amount,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        });
      }
      setStep(3);
    } catch {
      toast.error("Gagal menyimpan budget");
    } finally {
      setSaving(false);
    }
  }

  async function handleComplete() {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", user.id);
      router.push("/dashboard");
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-fab">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="text-primary font-bold text-2xl tracking-tight">Celengan</span>
        </div>

        {/* Step indicators (steps 1-3 only) */}
        {step > 0 && step < 3 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className={cn(
                "w-2 h-2 rounded-full transition-all",
                step === s ? "bg-primary w-6" : step > s ? "bg-primary" : "bg-[#E0E0E0]"
              )} />
            ))}
          </div>
        )}

        {/* Step 0 — Welcome */}
        {step === 0 && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-3xl bg-primary-light flex items-center justify-center mx-auto mb-6">
              <Sparkles size={40} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-3">
              Halo, {userName || "Teman"}! 👋
            </h1>
            <p className="text-[#6B6B6B] text-base mb-8 leading-relaxed">
              Celengan membantu kamu melacak keuangan dengan mudah. Yuk, kita mulai setup akun kamu sekarang!
            </p>
            <button
              onClick={() => setStep(1)}
              className="w-full py-4 bg-primary text-white font-semibold rounded-btn text-base hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
            >
              Mulai sekarang
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Step 1 — Add Accounts */}
        {step === 1 && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                <Wallet size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1A1A1A]">Akun kamu</h2>
                <p className="text-sm text-[#6B6B6B]">Pilih akun yang kamu punya</p>
              </div>
            </div>

            {/* Total balance animated */}
            {selectedChips.length >= 2 && (
              <div className="my-4 p-4 bg-primary-light rounded-card text-center animate-fade-in">
                <p className="text-xs text-primary font-medium uppercase tracking-wide mb-1">Total Saldo</p>
                <p className="text-2xl font-bold text-primary tabular-nums">{formatRupiah(totalAnimated)}</p>
              </div>
            )}

            {/* Quick chips */}
            <div className="flex flex-wrap gap-2 my-4">
              {QUICK_ACCOUNT_CHIPS.map((chip) => {
                const selected = selectedChips.includes(chip.name);
                return (
                  <button
                    key={chip.name}
                    onClick={() => toggleChip(chip)}
                    className={cn(
                      "px-4 py-2 rounded-chip text-sm font-medium transition-all border",
                      selected
                        ? "bg-primary text-white border-primary"
                        : "bg-white border-[#E0E0E0] text-[#3D3D3D] hover:border-primary/50"
                    )}
                  >
                    {selected && <Check size={12} className="inline mr-1" />}
                    {chip.name}
                  </button>
                );
              })}
            </div>

            {/* Balance inputs for selected accounts */}
            {accountDrafts.length > 0 && (
              <div className="space-y-3 mb-4">
                <p className="text-sm font-medium text-[#3D3D3D]">Masukkan saldo awal (opsional):</p>
                {accountDrafts.map((draft) => (
                  <div key={draft.chipName} className="flex items-center gap-3 p-3 bg-white rounded-btn border border-[#E0E0E0]">
                    <span className="text-sm font-medium text-[#1A1A1A] w-20 flex-shrink-0">{draft.name}</span>
                    <div className="flex items-center gap-1 flex-1 border-l border-[#E0E0E0] pl-3">
                      <span className="text-[#6B6B6B] text-sm">Rp</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={draft.balance}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "");
                          updateDraft(draft.chipName, "balance", raw);
                        }}
                        placeholder="0"
                        className="flex-1 text-sm font-semibold text-[#1A1A1A] outline-none bg-transparent tabular-nums"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleSaveAccounts}
              disabled={saving || accountDrafts.length === 0}
              className="w-full py-3.5 bg-primary text-white font-semibold rounded-btn text-base hover:bg-primary-dark disabled:bg-[#E0E0E0] disabled:text-[#6B6B6B] transition-colors"
            >
              {saving ? "Menyimpan..." : "Lanjut"}
            </button>
          </div>
        )}

        {/* Step 2 — Monthly Budget */}
        {step === 2 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-warning-light flex items-center justify-center flex-shrink-0">
                <Target size={20} className="text-warning" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1A1A1A]">Budget bulanan</h2>
                <p className="text-sm text-[#6B6B6B]">Batas pengeluaran per bulan ini</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center border border-[#E0E0E0] rounded-btn bg-white focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(104,182,132,0.15)] px-4 py-3 gap-2 transition-all">
                <span className="text-[#6B6B6B] font-medium text-2xl">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={budgetInput ? parseInt(budgetInput.replace(/\D/g,"")).toLocaleString("id-ID") : ""}
                  onChange={(e) => setBudgetInput(e.target.value.replace(/\D/g,""))}
                  placeholder="5.000.000"
                  className="flex-1 text-2xl font-bold text-[#1A1A1A] tabular-nums outline-none bg-transparent"
                  autoFocus
                />
              </div>
              {budgetInput && (
                <p className="text-xs text-[#6B6B6B] mt-1 px-1">{formatRupiah(parseInt(budgetInput) || 0)}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3.5 border border-[#E0E0E0] text-[#6B6B6B] font-semibold rounded-btn text-base hover:bg-surface transition-colors"
              >
                Lewati
              </button>
              <button
                onClick={handleSaveBudget}
                disabled={saving}
                className="flex-1 py-3.5 bg-primary text-white font-semibold rounded-btn text-base hover:bg-primary-dark disabled:bg-[#E0E0E0] disabled:text-[#6B6B6B] transition-colors"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Done */}
        {step === 3 && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-success-light flex items-center justify-center mx-auto mb-6">
              <Check size={40} className="text-success" strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-3">Semua siap! 🎉</h2>
            <p className="text-[#6B6B6B] text-base mb-8 leading-relaxed">
              Sekarang kamu bisa lihat semua uangmu di satu tempat. Yuk mulai catat transaksi pertamamu!
            </p>

            <div className="bg-primary-light rounded-card p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-primary mb-2">Tips memulai:</p>
              <ul className="space-y-1">
                <li className="text-sm text-[#3D3D3D] flex items-start gap-2">
                  <Receipt size={14} className="text-primary mt-0.5 flex-shrink-0" />
                  Tap tombol + untuk catat pengeluaran
                </li>
                <li className="text-sm text-[#3D3D3D] flex items-start gap-2">
                  <Target size={14} className="text-primary mt-0.5 flex-shrink-0" />
                  Buat goals tabungan di tab Budget & Goals
                </li>
                <li className="text-sm text-[#3D3D3D] flex items-start gap-2">
                  <Sparkles size={14} className="text-primary mt-0.5 flex-shrink-0" />
                  Lihat insights pengeluaranmu setiap bulan
                </li>
              </ul>
            </div>

            <button
              onClick={handleComplete}
              disabled={saving}
              className="w-full py-4 bg-primary text-white font-semibold rounded-btn text-base hover:bg-primary-dark disabled:bg-[#E0E0E0] transition-colors"
            >
              {saving ? "Memuat..." : "Ke Beranda →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
