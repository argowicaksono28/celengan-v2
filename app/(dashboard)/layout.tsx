"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Fab } from "@/components/layout/fab";
import { TransactionSheet } from "@/components/layout/transaction-sheet";
import { createClient } from "@/lib/supabase/client";

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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const router = useRouter();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userName, setUserName] = useState<string>();
  const [userEmail, setUserEmail] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      setUserEmail(user.email);

      // Fetch profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, onboarding_completed")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserName(profile.name ?? user.email?.split("@")[0]);
        if (!profile.onboarding_completed) {
          router.push("/onboarding");
          return;
        }
      }

      // Fetch accounts
      const { data: accs } = await supabase
        .from("accounts")
        .select("id, name, icon, balance, type")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at");
      setAccounts(accs ?? []);

      // Fetch categories (user + defaults)
      const { data: cats } = await supabase
        .from("categories")
        .select("id, name, icon, color, tx_type")
        .or(`user_id.eq.${user.id},is_default.eq.true`)
        .order("is_default", { ascending: false });
      setCategories(cats ?? []);

      setLoading(false);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSheetSuccess() {
    // Pages listen to realtime, but we also dispatch a custom event
    window.dispatchEvent(new CustomEvent("transaction-added"));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar userName={userName} userEmail={userEmail} />

      {/* Main content — offset for sidebar on desktop */}
      <main className="md:ml-60 min-h-screen">
        <div className="max-w-[960px] mx-auto px-4 py-6 pb-24 md:pb-8">
          {children}
        </div>
      </main>

      <BottomNav />

      <Fab onClick={() => setSheetOpen(true)} />

      <TransactionSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSuccess={handleSheetSuccess}
        accounts={accounts}
        categories={categories}
      />
    </div>
  );
}
