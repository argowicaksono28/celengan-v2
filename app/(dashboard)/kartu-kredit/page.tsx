"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressBar } from "@/components/ui/progress-bar";
import { toast } from "sonner";

interface CreditCard {
  id: string;
  name: string;
  bank: string | null;
  limit_amount: number;
  balance: number;
  billing_date: number | null;
  due_date: number | null;
}

function CardForm({ initial, onSave, onCancel }: {
  initial?: Partial<CreditCard>;
  onSave: (data: Omit<CreditCard, "id">) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [bank, setBank] = useState(initial?.bank ?? "");
  const [limit, setLimit] = useState(initial?.limit_amount != null ? String(initial.limit_amount) : "");
  const [balance, setBalance] = useState(initial?.balance != null ? String(initial.balance) : "");
  const [billingDate, setBillingDate] = useState(initial?.billing_date != null ? String(initial.billing_date) : "");
  const [dueDate, setDueDate] = useState(initial?.due_date != null ? String(initial.due_date) : "");

  return (
    <div className="bg-white rounded-card border border-[#E0E0E0] p-4 space-y-3">
      <input
        type="text" value={name} onChange={(e) => setName(e.target.value.slice(0, 40))}
        placeholder="Nama kartu (contoh: BCA Platinum)"
        className="w-full px-3 py-2 border border-[#E0E0E0] rounded-btn text-sm focus:outline-none focus:border-primary"
        autoFocus
      />
      <input
        type="text" value={bank} onChange={(e) => setBank(e.target.value.slice(0, 30))}
        placeholder="Bank (opsional)"
        className="w-full px-3 py-2 border border-[#E0E0E0] rounded-btn text-sm focus:outline-none focus:border-primary"
      />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-[#6B6B6B] mb-1 block">Limit</label>
          <div className="flex items-center border border-[#E0E0E0] rounded-btn px-2 py-2 gap-1 focus-within:border-primary">
            <span className="text-xs text-[#6B6B6B]">Rp</span>
            <input type="text" inputMode="numeric"
              value={limit ? parseInt(limit.replace(/\D/g,"")).toLocaleString("id-ID") : ""}
              onChange={(e) => setLimit(e.target.value.replace(/\D/g,""))}
              placeholder="0"
              className="flex-1 text-sm font-bold tabular-nums outline-none bg-transparent"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-[#6B6B6B] mb-1 block">Tagihan saat ini</label>
          <div className="flex items-center border border-[#E0E0E0] rounded-btn px-2 py-2 gap-1 focus-within:border-primary">
            <span className="text-xs text-[#6B6B6B]">Rp</span>
            <input type="text" inputMode="numeric"
              value={balance ? parseInt(balance.replace(/\D/g,"")).toLocaleString("id-ID") : ""}
              onChange={(e) => setBalance(e.target.value.replace(/\D/g,""))}
              placeholder="0"
              className="flex-1 text-sm font-bold tabular-nums outline-none bg-transparent"
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-[#6B6B6B] mb-1 block">Tgl Billing</label>
          <input type="number" min="1" max="31" value={billingDate}
            onChange={(e) => setBillingDate(e.target.value)}
            placeholder="1-31"
            className="w-full px-3 py-2 border border-[#E0E0E0] rounded-btn text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs text-[#6B6B6B] mb-1 block">Tgl Jatuh Tempo</label>
          <input type="number" min="1" max="31" value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            placeholder="1-31"
            className="w-full px-3 py-2 border border-[#E0E0E0] rounded-btn text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-2.5 border border-[#E0E0E0] rounded-btn text-sm text-[#6B6B6B] hover:bg-surface">Batal</button>
        <button
          onClick={() => name && limit && onSave({
            name, bank: bank || null, limit_amount: parseInt(limit.replace(/\D/g,"")),
            balance: parseInt(balance.replace(/\D/g,"") || "0"),
            billing_date: billingDate ? parseInt(billingDate) : null,
            due_date: dueDate ? parseInt(dueDate) : null,
          })}
          disabled={!name || !limit}
          className="flex-1 py-2.5 bg-primary rounded-btn text-sm font-semibold text-white hover:bg-primary-dark disabled:bg-[#E0E0E0] disabled:text-[#6B6B6B]"
        >
          Simpan
        </button>
      </div>
    </div>
  );
}

export default function KartuKreditPage() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/credit-cards");
    const data = await res.json();
    setCards(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  async function handleCreate(data: Omit<CreditCard, "id">) {
    const res = await fetch("/api/credit-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) { toast.success("Kartu ditambahkan!"); setShowForm(false); fetchCards(); }
    else toast.error("Gagal menyimpan kartu");
  }

  async function handleEdit(id: string, data: Omit<CreditCard, "id">) {
    const res = await fetch(`/api/credit-cards/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) { toast.success("Kartu diperbarui!"); setEditingId(null); fetchCards(); }
    else toast.error("Gagal memperbarui kartu");
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus kartu ini?")) return;
    await fetch(`/api/credit-cards/${id}`, { method: "DELETE" });
    toast.success("Kartu dihapus");
    fetchCards();
  }

  const totalUsage = cards.reduce((s, c) => s + c.balance, 0);
  const totalLimit = cards.reduce((s, c) => s + c.limit_amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1A1A1A]">Kartu Kredit</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-sm font-semibold rounded-btn hover:bg-primary-dark"
        >
          <Plus size={16} /> Tambah
        </button>
      </div>

      {/* Summary */}
      {cards.length > 0 && (
        <div className="bg-white rounded-card border border-[#E0E0E0] shadow-sm p-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-[#1A1A1A]">Total Tagihan</span>
            <span className="text-sm font-bold text-danger tabular-nums">{formatRupiah(totalUsage)}</span>
          </div>
          <ProgressBar value={totalUsage} max={totalLimit} showValues />
          <p className="text-xs text-[#6B6B6B] mt-1">Limit total: {formatRupiah(totalLimit)}</p>
        </div>
      )}

      {showForm && <CardForm onSave={handleCreate} onCancel={() => setShowForm(false)} />}

      {loading ? (
        <div className="space-y-3">{[1,2].map((i) => <div key={i} className="h-24 bg-white rounded-card border border-[#E0E0E0] animate-pulse" />)}</div>
      ) : cards.length === 0 && !showForm ? (
        <EmptyState icon="CreditCard" title="Belum ada kartu kredit" description="Tambah kartu kredit untuk memantau tagihanmu" action={{ label: "Tambah Kartu", onClick: () => setShowForm(true) }} />
      ) : (
        <div className="space-y-3">
          {cards.map((card) => (
            <div key={card.id}>
              {editingId === card.id ? (
                <CardForm initial={card} onSave={(d) => handleEdit(card.id, d)} onCancel={() => setEditingId(null)} />
              ) : (
                <div className="bg-white rounded-card border border-[#E0E0E0] shadow-sm p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A1A]">{card.name}</p>
                      {card.bank && <p className="text-xs text-[#6B6B6B]">{card.bank}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setEditingId(card.id)} className="p-1.5 rounded-full hover:bg-surface text-[#6B6B6B]"><Edit2 size={13} /></button>
                      <button onClick={() => handleDelete(card.id)} className="p-1.5 rounded-full hover:bg-danger-light hover:text-danger text-[#6B6B6B]"><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-[#6B6B6B] mb-1">
                    <span>Tagihan: <span className="font-semibold text-danger tabular-nums">{formatRupiah(card.balance)}</span></span>
                    <span>Limit: <span className="tabular-nums">{formatRupiah(card.limit_amount)}</span></span>
                  </div>
                  <ProgressBar value={card.balance} max={card.limit_amount} />
                  {(card.billing_date || card.due_date) && (
                    <div className="flex gap-3 mt-2 text-xs text-[#6B6B6B]">
                      {card.billing_date && <span>Billing: tgl {card.billing_date}</span>}
                      {card.due_date && <span>Jatuh tempo: tgl {card.due_date}</span>}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
