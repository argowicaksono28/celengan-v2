"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Tab = "masuk" | "daftar";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>("masuk");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) { setError(error.message); return; }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (signupPassword !== signupConfirm) {
      setError("Password tidak cocok");
      return;
    }
    if (signupPassword.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: { name: signupName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) { setError(error.message); return; }
      router.push("/onboarding");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setLoading(false); }
  }

  const inputClass =
    "w-full px-4 py-3 border border-c-border rounded-btn bg-white text-[#0F172A] placeholder:text-[#94A3B8] text-base focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] transition-all";

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-[0_4px_12px_rgba(99,102,241,0.25)]">
            <span className="text-white text-2xl font-bold">C</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Celengan</h1>
          <p className="text-[#64748B] text-sm mt-1">Catat keuanganmu dengan mudah</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-card shadow-card p-6">
          {/* Tabs */}
          <div className="flex rounded-btn bg-surface p-1 mb-6">
            {(["masuk", "daftar"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={`flex-1 py-2 text-sm font-medium rounded-[10px] transition-all ${
                  tab === t
                    ? "bg-primary text-white shadow-sm"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                {t === "masuk" ? "Masuk" : "Daftar"}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-danger-light border border-danger/20 rounded-btn text-danger text-sm">
              {error}
            </div>
          )}

          {tab === "masuk" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#334155] mb-1.5">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className={inputClass}
                  placeholder="kamu@email.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#334155] mb-1.5">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Masukkan password"
                  required
                  autoComplete="current-password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-press w-full py-3 bg-primary text-white font-semibold rounded-btn text-base hover:bg-primary-dark disabled:bg-[#E2E8F0] disabled:text-[#64748B] disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Memuat..." : "Masuk"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#334155] mb-1.5">Nama</label>
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className={inputClass}
                  placeholder="Nama kamu"
                  required
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#334155] mb-1.5">Email</label>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className={inputClass}
                  placeholder="kamu@email.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#334155] mb-1.5">Password</label>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Min. 6 karakter"
                  required
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#334155] mb-1.5">Konfirmasi Password</label>
                <input
                  type="password"
                  value={signupConfirm}
                  onChange={(e) => setSignupConfirm(e.target.value)}
                  className={inputClass}
                  placeholder="Ulangi password"
                  required
                  autoComplete="new-password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-press w-full py-3 bg-primary text-white font-semibold rounded-btn text-base hover:bg-primary-dark disabled:bg-[#E2E8F0] disabled:text-[#64748B] disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Memuat..." : "Buat Akun"}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-c-border" />
            <span className="text-xs text-[#64748B]">atau</span>
            <div className="flex-1 h-px bg-c-border" />
          </div>

          {/* Google OAuth */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn-press w-full py-3 border border-c-border bg-white text-[#334155] font-medium rounded-btn text-base flex items-center justify-center gap-3 hover:bg-surface disabled:opacity-50 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
            </svg>
            Lanjut dengan Google
          </button>
        </div>

        <p className="text-center text-xs text-[#64748B] mt-6">
          Dengan mendaftar, kamu menyetujui syarat & ketentuan Celengan.
        </p>
      </div>
    </div>
  );
}
