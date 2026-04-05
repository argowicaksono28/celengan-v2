"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { Plus, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/format";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Loan {
  id: string;
  person_name: string;
  direction: "LENT" | "BORROWED";
  original_amount: number;
  remaining_amount: number;
  status: "ACTIVE" | "CLEARED";
  due_date: string | null;
  note: string | null;
}

function LoanForm({ onSave, onCancel }: {
  onSave: (data: { person_name: string; direction: string; original_amount: number; due_date: string | null; note: string | null }) => void;
  onCancel: () => void;
}) {
  const [personName, setPersonName] = useState("");
  const [direction, setDirection] = useState<"LENT" | "BORROWED">("LENT");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");

  return (
    <div className="bg-white rounded-card border border-[#E0E0E0] p-4 space-y-3">
      <div className="flex gap-2">
        {(["LENT","BORROWED"] as const).map((d) => (
          <button
            key={d}
            onClick={() => setDirection(d)}
            className={cn(
              "flex-1 py-2 rounded-chip text-sm font-medium border transition-all",
              direction === d
                ? d === "LENT" ? "bg-success text-white border-success" : "bg-danger text-white border-danger"
                : "bg-white border-[#E0E0E0] text-[#6B6B6B]"
            )}
          >
            {d === "LENT" ? "Dipinjamkan" : "Dipinjam"}
          </button>
        ))}
      </div>
      <input
        type="text" value={personName} onChange={(e) => setPersonName(e.target.value.slice(0, 50))}
        placeholder={direction === "LENT" ? "Nama peminjam" : "Nama pemberi pinjaman"}
        className="w-full px-3 py-2 border border-[#E0E0E0] rounded-btn text-sm focus:outline-none focus:border-primary"
        autoFocus
      />
      <div>
        <label className="text-xs text-[#6B6B6B] mb-1 block">Jumlah</label>
        <div className="flex items-center border border-[#E0E0E0] rounded-btn px-3 py-2 gap-1.5 focus-within:border-primary">
          <span className="text-sm text-[#6B6B6B]">Rp</span>
          <input type="text" inputMode="numeric"
            value={amount ? parseInt(amount.replace(/\D/g,"")).toLocaleString("id-ID") : ""}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g,""))}
            placeholder="0"
            className="flex-1 text-sm font-bold tabular-nums outline-none bg-transparent"
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-[#6B6B6B] mb-1 block">Jatuh tempo (opsional)</label>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
          className="w-full px-3 py-2 border border-[#E0E0E0] rounded-btn text-sm focus:outline-none focus:border-primary"
        />
      </div>
      <textarea
        value={note} onChange={(e) => setNote(e.target.value.slice(0, 100))}
        placeholder="Catatan (opsional)"
        rows={2}
        className="w-full px-3 py-2 border border-[#E0E0E0] rounded-btn text-sm focus:outline-none focus:border-primary resize-none"
      />
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-2.5 border border-[#E0E0E0] rounded-btn text-sm text-[#6B6B6B] hover:bg-surface">Batal</button>
        <button
          onClick={() => personName && amount && onSave({
            person_name: personName, direction, original_amount: parseInt(amount.replace(/\D/g,"")),
            due_date: dueDate || null, note: note.trim() || null,
          })}
          disabled={!personName || !amount}
          className="flex-1 py-2.5 bg-primary rounded-btn text-sm font-semibold text-white hover:bg-primary-dark disabled:bg-[#E0E0E0] disabled:text-[#6B6B6B]"
        >
          Simpan
        </button>
      </div>
    </div>
  );
}

export default function PinjamanPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<"ACTIVE" | "CLEARED">("ACTIVE");

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/loans");
    const data = await res.json();
    setLoans(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLoans(); }, [fetchLoans]);

  async function handleCreate(data: Parameters<React.ComponentProps<typeof LoanForm>["onSave"]>[0]) {
    const res = await fetch("/api/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) { toast.success("Pinjaman dicatat!"); setShowForm(false); fetchLoans(); }
    else toast.error("Gagal menyimpan pinjaman");
  }

  async function handleClear(loan: Loan) {
    await fetch(`/api/loans/${loan.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CLEARED", remaining_amount: 0 }),
    });
    toast.success("Pinjaman ditandai lunas!");
    fetchLoans();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus catatan pinjaman ini?")) return;
    await fetch(`/api/loans/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "CLEARED" }) });
    toast.success("Dihapus");
    fetchLoans();
  }

  const filtered = loans.filter((l) => l.status === tab);
  const totalLent = loans.filter((l) => l.direction === "LENT" && l.status === "ACTIVE").reduce((s, l) => s + l.remaining_amount, 0);
  const totalBorrowed = loans.filter((l) => l.direction === "BORROWED" && l.status === "ACTIVE").reduce((s, l) => s + l.remaining_amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1A1A1A]">Pinjaman</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-sm font-semibold rounded-btn hover:bg-primary-dark"
        >
          <Plus size={16} /> Catat
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-success-light rounded-card p-3 text-center">
          <p className="text-xs text-success font-medium mb-0.5">Piutang</p>
          <p className="text-base font-bold text-success tabular-nums">{formatRupiah(totalLent)}</p>
          <p className="text-xs text-success/70">dipinjamkan</p>
        </div>
        <div className="bg-danger-light rounded-card p-3 text-center">
          <p className="text-xs text-danger font-medium mb-0.5">Hutang</p>
          <p className="text-base font-bold text-danger tabular-nums">{formatRupiah(totalBorrowed)}</p>
          <p className="text-xs text-danger/70">dipinjam</p>
        </div>
      </div>

      {showForm && <LoanForm onSave={handleCreate} onCancel={() => setShowForm(false)} />}

      {/* Tabs */}
      <div className="flex gap-2">
        {(["ACTIVE","CLEARED"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2 rounded-chip text-sm font-medium border transition-all",
              tab === t ? "bg-primary text-white border-primary" : "bg-white border-[#E0E0E0] text-[#6B6B6B]"
            )}
          >
            {t === "ACTIVE" ? "Aktif" : "Lunas"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-20 bg-white rounded-card border border-[#E0E0E0] animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="Landmark"
          title={tab === "ACTIVE" ? "Tidak ada pinjaman aktif" : "Belum ada pinjaman lunas"}
          description={tab === "ACTIVE" ? "Catat pinjaman atau hutangmu di sini" : ""}
          compact
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((loan) => (
            <div key={loan.id} className="bg-white rounded-card border border-[#E0E0E0] shadow-sm p-4">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#1A1A1A]">{loan.person_name}</p>
                    <Badge variant={loan.direction === "LENT" ? "success" : "danger"}>
                      {loan.direction === "LENT" ? "Piutang" : "Hutang"}
                    </Badge>
                  </div>
                  {loan.note && <p className="text-xs text-[#6B6B6B] mt-0.5">{loan.note}</p>}
                </div>
                <div className="flex gap-1 ml-2">
                  {tab === "ACTIVE" && (
                    <button onClick={() => handleClear(loan)} className="p-1.5 rounded-full bg-success-light text-success hover:bg-success hover:text-white transition-colors" title="Tandai lunas">
                      <Check size={13} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(loan.id)} className="p-1.5 rounded-full text-[#E0E0E0] hover:text-danger hover:bg-danger-light transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <p className={cn("text-base font-bold tabular-nums", loan.direction === "LENT" ? "text-success" : "text-danger")}>
                {formatRupiah(loan.remaining_amount)}
              </p>
              {loan.original_amount !== loan.remaining_amount && (
                <p className="text-xs text-[#6B6B6B]">Asli: {formatRupiah(loan.original_amount)}</p>
              )}
              {loan.due_date && (
                <p className="text-xs text-[#6B6B6B] mt-1">Jatuh tempo: {new Date(loan.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
