"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/format";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import * as Icons from "lucide-react";

type TxType = "EXPENSE" | "INCOME";

interface Account {
  id: string;
  name: string;
  icon: string;
  balance: number;
  type: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  tx_type: string;
}

interface TransactionSheetProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accounts: Account[];
  categories: Category[];
  defaultAccountId?: string;
}

function LucideIcon({ name, size = 16, className }: { name: string; size?: number; className?: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComp = (Icons as any)[name];
  if (!IconComp) return <span className={className} />;
  return <IconComp size={size} className={className} />;
}

export function TransactionSheet({
  open,
  onClose,
  onSuccess,
  accounts,
  categories,
  defaultAccountId,
}: TransactionSheetProps) {
  const supabase = createClient();
  const amountRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<TxType>("EXPENSE");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState(defaultAccountId ?? accounts[0]?.id ?? "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredCats = categories.filter(
    (c) => c.tx_type === type || c.tx_type === "BOTH"
  );

  // Reset on open
  useEffect(() => {
    if (open) {
      setType("EXPENSE");
      setAmount("");
      setCategoryId(filteredCats[0]?.id ?? "");
      setAccountId(defaultAccountId ?? accounts[0]?.id ?? "");
      setDate(new Date().toISOString().split("T")[0]);
      setNote("");
      setTimeout(() => amountRef.current?.focus(), 200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Update category when type changes
  useEffect(() => {
    const cats = categories.filter((c) => c.tx_type === type || c.tx_type === "BOTH");
    if (cats.length > 0 && !cats.find((c) => c.id === categoryId)) {
      setCategoryId(cats[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const numericAmount = parseInt(amount.replace(/\D/g, "")) || 0;

  async function handleSave() {
    if (!numericAmount || !accountId) {
      toast.error("Masukkan jumlah dan pilih akun");
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        account_id: accountId,
        category_id: categoryId || null,
        type,
        amount: numericAmount,
        note: note.trim() || null,
        date,
      });

      if (error) throw error;

      // Update account balance
      const account = accounts.find((a) => a.id === accountId);
      if (account) {
        const delta = type === "EXPENSE" ? -numericAmount : numericAmount;
        await supabase
          .from("accounts")
          .update({ balance: account.balance + delta })
          .eq("id", accountId);
      }

      toast.success(type === "EXPENSE" ? "Pengeluaran dicatat!" : "Pemasukan dicatat!");
      onSuccess();
      onClose();
    } catch {
      toast.error("Gagal menyimpan transaksi");
    } finally {
      setLoading(false);
    }
  }

  function handleAmountInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "");
    setAmount(raw);
  }

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 sheet-overlay"
        onClick={onClose}
      />

      {/* Sheet — Mobile: bottom sheet, Desktop: right panel */}
      <div
        className={cn(
          "fixed z-50 bg-white overflow-y-auto",
          // Mobile
          "md:hidden bottom-0 left-0 right-0 rounded-t-[20px] max-h-[85vh] sheet-content",
          // Desktop
          "hidden md:flex md:flex-col md:top-0 md:right-0 md:bottom-0 md:w-96 md:rounded-none md:max-h-full md:shadow-modal animate-slide-up"
        )}
      >
        {/* Handle bar (mobile only) */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-8 h-1 rounded-chip bg-[#E0E0E0]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E0E0E0]">
          <h2 className="text-xl font-semibold text-[#1A1A1A]">Tambah Transaksi</h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="p-2 rounded-full hover:bg-surface transition-colors text-[#6B6B6B]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 pb-6">
          {/* 1. Type Toggle */}
          <div className="flex rounded-btn bg-surface p-1">
            {(["EXPENSE", "INCOME"] as TxType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  "flex-1 py-2 text-sm font-semibold rounded-[10px] transition-all",
                  type === t
                    ? t === "EXPENSE"
                      ? "bg-danger text-white shadow-sm"
                      : "bg-success text-white shadow-sm"
                    : "text-[#6B6B6B] hover:text-[#1A1A1A]"
                )}
              >
                {t === "EXPENSE" ? "Pengeluaran" : "Pemasukan"}
              </button>
            ))}
          </div>

          {/* 2. Amount */}
          <div>
            <label className="block text-sm font-medium text-[#3D3D3D] mb-2">Jumlah</label>
            <div className="flex items-center border border-[#E0E0E0] rounded-btn bg-white focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(104,182,132,0.15)] transition-all px-4 py-3 gap-2">
              <span className="text-[#6B6B6B] font-medium text-2xl flex-shrink-0">Rp</span>
              <input
                ref={amountRef}
                type="text"
                inputMode="numeric"
                value={numericAmount > 0 ? numericAmount.toLocaleString("id-ID") : ""}
                onChange={handleAmountInput}
                placeholder="0"
                className="flex-1 text-2xl font-bold text-[#1A1A1A] tabular-nums outline-none bg-transparent"
              />
            </div>
            {numericAmount > 0 && (
              <p className="text-xs text-[#6B6B6B] mt-1 px-1">{formatRupiah(numericAmount)}</p>
            )}
          </div>

          {/* 3. Category Chips */}
          <div>
            <label className="block text-sm font-medium text-[#3D3D3D] mb-2">Kategori</label>
            <div className="chips-row">
              {filteredCats.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={cn(
                    "btn-press flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-chip text-sm font-medium transition-all border",
                    categoryId === cat.id
                      ? "border-primary bg-primary-light text-primary"
                      : "border-[#E0E0E0] bg-white text-[#3D3D3D] hover:border-primary/50"
                  )}
                >
                  <LucideIcon name={cat.icon} size={14} />
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Account Selector */}
          <div>
            <label className="block text-sm font-medium text-[#3D3D3D] mb-2">Akun</label>
            <div className="chips-row">
              {accounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => setAccountId(acc.id)}
                  className={cn(
                    "btn-press flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-chip text-sm font-medium transition-all border",
                    accountId === acc.id
                      ? "border-primary bg-primary-light text-primary"
                      : "border-[#E0E0E0] bg-white text-[#3D3D3D] hover:border-primary/50"
                  )}
                >
                  <LucideIcon name={acc.icon} size={14} />
                  {acc.name}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Date */}
          <div>
            <label className="block text-sm font-medium text-[#3D3D3D] mb-2">Tanggal</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 border border-[#E0E0E0] rounded-btn text-[#1A1A1A] text-base focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(104,182,132,0.15)] transition-all bg-white"
            />
          </div>

          {/* 6. Note (optional) */}
          <div>
            <label className="block text-sm font-medium text-[#3D3D3D] mb-2">
              Catatan <span className="text-[#6B6B6B] font-normal">(opsional)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 100))}
              placeholder="Tambah catatan..."
              maxLength={100}
              className="w-full px-4 py-3 border border-[#E0E0E0] rounded-btn text-[#1A1A1A] text-base focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(104,182,132,0.15)] transition-all bg-white placeholder-[#6B6B6B]"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="sticky bottom-0 px-5 py-4 bg-white border-t border-[#E0E0E0]">
          <button
            onClick={handleSave}
            disabled={loading || !numericAmount}
            className="btn-press w-full py-3.5 bg-primary text-white font-semibold rounded-btn text-base hover:bg-primary-dark disabled:bg-[#E0E0E0] disabled:text-[#6B6B6B] disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </>
  );
}
