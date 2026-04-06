import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "Celengan — Catat Keuanganmu",
  description: "Aplikasi manajemen keuangan pribadi untuk Indonesia. Catat pengeluaran, atur budget, dan capai goals keuanganmu.",
  keywords: ["keuangan", "personal finance", "indonesia", "budget", "tabungan", "celengan"],
  authors: [{ name: "Celengan" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6366F1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${plusJakartaSans.className} bg-surface text-[#0F172A] antialiased`}>
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#0F172A",
              color: "#F8FAFC",
              borderRadius: "14px",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
