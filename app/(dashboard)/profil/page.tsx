"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Trash2, BarChart2, LogOut, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import * as Icons from "lucide-react";
import { CATEGORY_COLORS, CUSTOM_CATEGORY_ICONS } from "@/lib/constants";

function LucideIcon({ name, size = 16, className, style }: { name: string; size?: number; className?: string; style?: React.CSSProperties }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComp = (Icons as any)[name];
  if (!IconComp) return <span style={{ width: size, height: size, display: "inline-block" }} />;
  return <IconComp size={size} className={className} style={style} />;
}

interface Profile {
  name: string;
  plan: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  tx_type: string;
  is_default: boolean;
  user_id: string | null;
}

export default function ProfilPage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile edit
  const [editName, setEditName] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Category form
  const [showCatForm, setShowCatForm] = useState(false);
  const [catName, setCatName] = useState("");
  const [catIcon, setCatIcon] = useState("Tag");
  const [catColor, setCatColor] = useState("#68B684");
  const [catType, setCatType] = useState<"EXPENSE" | "INCOME" | "BOTH">("EXPENSE");
  const [savingCat, setSavingCat] = useState(false);

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setEmail(user.email ?? "");
    const [profileRes, catRes] = await Promise.all([
      supabase.from("profiles").select("name, plan").eq("id", user.id).single(),
      fetch("/api/categories"),
    ]);
    if (profileRes.data) {
      setProfile(profileRes.data);
      setEditName(profileRes.data.name ?? "");
    }
    const catData = await catRes.json();
    setCategories(Array.isArray(catData) ? catData : []);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleSaveName() {
    if (!editName.trim()) return;
    setSavingName(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").update({ name: editName.trim() }).eq("id", user.id);
    setProfile((p) => p ? { ...p, name: editName.trim() } : p);
    toast.success("Nama diperbarui!");
    setSavingName(false);
  }

  async function handleSaveCategory() {
    if (!catName.trim()) { toast.error("Masukkan nama kategori"); return; }
    setSavingCat(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: catName, icon: catIcon, color: catColor, tx_type: catType }),
    });
    setSavingCat(false);
    if (res.ok) {
      toast.success("Kategori ditambahkan!");
      setShowCatForm(false);
      setCatName(""); setCatIcon("Tag"); setCatColor("#68B684"); setCatType("EXPENSE");
      fetchData();
    } else {
      toast.error("Gagal menyimpan kategori");
    }
  }

  async function handleDeleteCategory(id: string) {
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    toast.success("Kategori dihapus");
    fetchData();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const userCategories = categories.filter((c) => !c.is_default);
  const defaultCategories = categories.filter((c) => c.is_default);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-[#1A1A1A]">Profil</h1>

      {/* Profile card */}
      <div className="bg-white rounded-card border border-[#E0E0E0] shadow-sm p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-bold text-lg">
              {profile?.name?.charAt(0)?.toUpperCase() ?? email.charAt(0)?.toUpperCase() ?? "?"}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1A1A1A]">{profile?.name ?? "—"}</p>
            <p className="text-xs text-[#6B6B6B]">{email}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div>
            <label className="text-xs font-medium text-[#6B6B6B] mb-1 block">Nama</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value.slice(0, 50))}
                className="flex-1 px-3 py-2 border border-[#E0E0E0] rounded-btn text-sm text-[#1A1A1A] focus:outline-none focus:border-primary"
              />
              <button
                onClick={handleSaveName}
                disabled={savingName || editName === profile?.name}
                className="px-3 py-2 bg-primary text-white text-sm font-medium rounded-btn hover:bg-primary-dark disabled:bg-[#E0E0E0] disabled:text-[#6B6B6B] transition-colors"
              >
                {savingName ? "..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="space-y-2">
        <Link href="/insights" className="flex items-center justify-between bg-white rounded-card border border-[#E0E0E0] shadow-sm px-4 py-3 hover:bg-surface transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
              <BarChart2 size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#1A1A1A]">Insights</p>
              <p className="text-xs text-[#6B6B6B]">Analisa pola pengeluaran</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#6B6B6B]" />
        </Link>
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-[#1A1A1A]">Kategori Kustom</h2>
          <button
            onClick={() => setShowCatForm(true)}
            className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
          >
            <Plus size={13} /> Tambah
          </button>
        </div>

        {showCatForm && (
          <div className="bg-white rounded-card border border-[#E0E0E0] p-4 mb-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#1A1A1A]">Kategori Baru</p>
              <button onClick={() => setShowCatForm(false)}><X size={16} className="text-[#6B6B6B]" /></button>
            </div>
            <input
              type="text"
              value={catName}
              onChange={(e) => setCatName(e.target.value.slice(0, 30))}
              placeholder="Nama kategori"
              className="w-full px-3 py-2 border border-[#E0E0E0] rounded-btn text-sm focus:outline-none focus:border-primary"
              autoFocus
            />
            <div>
              <label className="text-xs text-[#6B6B6B] mb-1 block">Tipe</label>
              <div className="flex gap-2">
                {(["EXPENSE","INCOME","BOTH"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setCatType(t)}
                    className={cn(
                      "flex-1 py-1.5 rounded-chip text-xs font-medium border transition-all",
                      catType === t ? "bg-primary text-white border-primary" : "bg-white border-[#E0E0E0] text-[#6B6B6B]"
                    )}
                  >
                    {t === "EXPENSE" ? "Keluar" : t === "INCOME" ? "Masuk" : "Keduanya"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-[#6B6B6B] mb-1 block">Ikon</label>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                {CUSTOM_CATEGORY_ICONS.slice(0, 24).map((ic) => (
                  <button
                    key={ic}
                    onClick={() => setCatIcon(ic)}
                    className={cn(
                      "w-8 h-8 rounded-btn flex items-center justify-center border transition-all",
                      catIcon === ic ? "bg-primary-light border-primary" : "bg-white border-[#E0E0E0]"
                    )}
                  >
                    <LucideIcon name={ic} size={14} className={catIcon === ic ? "text-primary" : "text-[#6B6B6B]"} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-[#6B6B6B] mb-1 block">Warna</label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORY_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCatColor(c)}
                    style={{ backgroundColor: c }}
                    className={cn("w-7 h-7 rounded-full border-2 transition-all", catColor === c ? "border-[#1A1A1A] scale-110" : "border-transparent")}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={handleSaveCategory}
              disabled={savingCat || !catName}
              className="w-full py-2.5 bg-primary rounded-btn text-sm font-semibold text-white hover:bg-primary-dark disabled:bg-[#E0E0E0] disabled:text-[#6B6B6B] transition-colors"
            >
              {savingCat ? "Menyimpan..." : "Simpan Kategori"}
            </button>
          </div>
        )}

        {/* User categories */}
        {loading ? (
          <div className="h-12 bg-white rounded-card border border-[#E0E0E0] animate-pulse" />
        ) : userCategories.length === 0 ? (
          <p className="text-sm text-[#6B6B6B] px-1">Belum ada kategori kustom.</p>
        ) : (
          <div className="bg-white rounded-card border border-[#E0E0E0] shadow-sm divide-y divide-[#E0E0E0]">
            {userCategories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-3 px-4 py-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: cat.color + "20" }}
                >
                  <LucideIcon name={cat.icon} size={14} style={{ color: cat.color }} />
                </div>
                <span className="flex-1 text-sm text-[#1A1A1A]">{cat.name}</span>
                <span className="text-xs text-[#6B6B6B]">
                  {cat.tx_type === "EXPENSE" ? "Keluar" : cat.tx_type === "INCOME" ? "Masuk" : "Keduanya"}
                </span>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="p-1.5 text-[#E0E0E0] hover:text-danger transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Default categories (read-only) */}
        <p className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wide mt-4 mb-2 px-1">Kategori Default</p>
        <div className="bg-white rounded-card border border-[#E0E0E0] shadow-sm divide-y divide-[#E0E0E0]">
          {defaultCategories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3 px-4 py-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: cat.color + "20" }}
              >
                <LucideIcon name={cat.icon} size={14} style={{ color: cat.color }} />
              </div>
              <span className="flex-1 text-sm text-[#3D3D3D]">{cat.name}</span>
              <span className="text-xs text-[#6B6B6B]">
                {cat.tx_type === "EXPENSE" ? "Keluar" : cat.tx_type === "INCOME" ? "Masuk" : "Keduanya"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 border border-danger rounded-btn text-danger text-sm font-semibold hover:bg-danger-light transition-colors"
      >
        <LogOut size={16} />
        Keluar
      </button>
    </div>
  );
}
