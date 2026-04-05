"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, CreditCard, Landmark, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/format";
import { ACCOUNT_TYPES } from "@/lib/constants";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import * as Icons from "lucide-react";

function LucideIcon({ name, size = 16, className, style }: { name: string; size?: number; className?: string; style?: React.CSSProperties }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComp = (Icons as any)[name];
  if (!IconComp) return <span className={className} style={{ width: size, height: size, display: "inline-block" }} />;
  return <IconComp size={size} className={className} style={style} />;
}

interface Account {
  id: string;
  name: string;
  type: string;
  icon: string;
  color: string;
  balance: number;
}

const ICON_OPTIONS = ["Wallet", "CreditCard", "Banknote", "PiggyBank", "Building2", "Smartphone", "ShoppingBag", "Briefcase"];
const COLOR_OPTIONS = ["#68B684", "#3D8A57", "#C97C2A", "#C94040", "#4A90D9", "#9B59B6", "#E67E22", "#1ABC9C"];

function AccountForm({ initial, onSave, onCancel }: {
  initial?: Partial<Account>;
  onSave: (data: Omit<Account, "id">) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState(initial?.type ?? "CASH");
  const [icon, setIcon] = useState(initial?.icon ?? "Wallet");
  const [color, setColor] = useState(initial?.color ?? "#68B684");
  const [balance, setBalance] = useState(initial?.balance != null ? String(initial.balance) : "");

  return (
    <div className="bg-white rounded-card border border-[#E0E0E0] p-4 space-y-3">
      <div>
        <label className="text-xs font-medium text-[#6B6B6B] mb-1 block">Nama Akun</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 30))}
          placeholder="Contoh: BCA Tabungan"
          className="w-full px-3 py-2 border border-[#E0E0E0] rounded-btn text-sm text-[#1A1A1A] focus:outline-none focus:border-primary"
          autoFocus
        />
      </div>
      <div>
        <label className="text-xs font-medium text-[#6B6B6B] mb-1 block">Tipe</label>
        <div className="flex flex-wrap gap-1.5">
          {ACCOUNT_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={cn(
                "px-2.5 py-1 rounded-chip text-xs font-medium border transition-all",
                type === t.value ? "bg-primary text-white border-primary" : "bg-white border-[#E0E0E0] text-[#3D3D3D]"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-[#6B6B6B] mb-1 block">Ikon</label>
        <div className="flex flex-wrap gap-1.5">
          {ICON_OPTIONS.map((ic) => (
            <button
              key={ic}
              onClick={() => setIcon(ic)}
              className={cn(
                "w-9 h-9 rounded-btn flex items-center justify-center border transition-all",
                icon === ic ? "bg-primary-light border-primary" : "bg-white border-[#E0E0E0]"
              )}
            >
              <LucideIcon name={ic} size={16} className={icon === ic ? "text-primary" : "text-[#6B6B6B]"} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-[#6B6B6B] mb-1 block">Warna</label>
        <div className="flex gap-1.5">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{ backgroundColor: c }}
              className={cn(
                "w-7 h-7 rounded-full border-2 transition-all",
                color === c ? "border-[#1A1A1A] scale-110" : "border-transparent"
              )}
            />
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-[#6B6B6B] mb-1 block">Saldo</label>
        <div className="flex items-center border border-[#E0E0E0] rounded-btn px-3 py-2 gap-1.5 focus-within:border-primary">
          <span className="text-sm text-[#6B6B6B]">Rp</span>
          <input
            type="text"
            inputMode="numeric"
            value={balance ? parseInt(balance.replace(/\D/g,"")).toLocaleString("id-ID") : ""}
            onChange={(e) => setBalance(e.target.value.replace(/\D/g,""))}
            placeholder="0"
            className="flex-1 text-sm font-semibold text-[#1A1A1A] outline-none bg-transparent tabular-nums"
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={onCancel} className="flex-1 py-2.5 border border-[#E0E0E0] rounded-btn text-sm font-medium text-[#6B6B6B] hover:bg-surface transition-colors">
          Batal
        </button>
        <button
          onClick={() => name && onSave({ name, type, icon, color, balance: parseInt(balance.replace(/\D/g,"") || "0") })}
          disabled={!name}
          className="flex-1 py-2.5 bg-primary rounded-btn text-sm font-semibold text-white hover:bg-primary-dark disabled:bg-[#E0E0E0] disabled:text-[#6B6B6B] transition-colors"
        >
          Simpan
        </button>
      </div>
    </div>
  );
}

export default function AkunPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/accounts");
    const data = await res.json();
    setAccounts(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  async function handleCreate(data: Omit<Account, "id">) {
    const res = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("Akun ditambahkan!");
      setShowForm(false);
      fetchAccounts();
    } else {
      toast.error("Gagal menyimpan akun");
    }
  }

  async function handleEdit(id: string, data: Omit<Account, "id">) {
    const res = await fetch(`/api/accounts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("Akun diperbarui!");
      setEditingId(null);
      fetchAccounts();
    } else {
      toast.error("Gagal memperbarui akun");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus akun ini? Transaksi terkait tidak akan dihapus.")) return;
    await fetch(`/api/accounts/${id}`, { method: "DELETE" });
    toast.success("Akun dihapus");
    fetchAccounts();
  }

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1A1A1A]">Akun</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-sm font-semibold rounded-btn hover:bg-primary-dark transition-colors"
        >
          <Plus size={16} />
          Tambah
        </button>
      </div>

      {/* Total balance */}
      <div className="bg-primary rounded-card p-4 text-white">
        <p className="text-sm opacity-80 mb-1">Total Saldo</p>
        <p className="text-3xl font-bold tabular-nums">{formatRupiah(totalBalance)}</p>
        <p className="text-xs opacity-70 mt-1">{accounts.length} akun aktif</p>
      </div>

      {/* Add form */}
      {showForm && (
        <AccountForm
          onSave={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Account list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="h-20 bg-white rounded-card border border-[#E0E0E0] animate-pulse" />
          ))}
        </div>
      ) : accounts.length === 0 && !showForm ? (
        <EmptyState
          icon="Wallet"
          title="Belum ada akun"
          description="Tambah akun untuk mulai melacak keuanganmu"
          action={{ label: "Tambah Akun", onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="space-y-3">
          {accounts.map((acc) => (
            <div key={acc.id}>
              {editingId === acc.id ? (
                <AccountForm
                  initial={acc}
                  onSave={(data) => handleEdit(acc.id, data)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="bg-white rounded-card border border-[#E0E0E0] shadow-sm p-4 flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: acc.color + "20" }}
                  >
                    <LucideIcon name={acc.icon} size={22} style={{ color: acc.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A]">{acc.name}</p>
                    <p className="text-xs text-[#6B6B6B]">
                      {ACCOUNT_TYPES.find((t) => t.value === acc.type)?.label ?? acc.type}
                    </p>
                    <p className="text-base font-bold text-[#1A1A1A] tabular-nums mt-0.5">{formatRupiah(acc.balance)}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingId(acc.id)}
                      className="p-2 rounded-full hover:bg-surface transition-colors text-[#6B6B6B]"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(acc.id)}
                      className="p-2 rounded-full hover:bg-danger-light hover:text-danger transition-colors text-[#6B6B6B]"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Links to sub-pages */}
      <div className="space-y-2 pt-2">
        <Link href="/kartu-kredit" className="flex items-center justify-between bg-white rounded-card border border-[#E0E0E0] shadow-sm px-4 py-3 hover:bg-surface transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
              <CreditCard size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#1A1A1A]">Kartu Kredit</p>
              <p className="text-xs text-[#6B6B6B]">Kelola kartu kredit & limit</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-[#6B6B6B]" />
        </Link>
        <Link href="/pinjaman" className="flex items-center justify-between bg-white rounded-card border border-[#E0E0E0] shadow-sm px-4 py-3 hover:bg-surface transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-warning-light flex items-center justify-center">
              <Landmark size={18} className="text-warning" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#1A1A1A]">Pinjaman</p>
              <p className="text-xs text-[#6B6B6B]">Hutang & piutang</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-[#6B6B6B]" />
        </Link>
      </div>
    </div>
  );
}
