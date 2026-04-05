import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "Celengan — Catat Keuanganmu",
  description: "Aplikasi manajemen keuangan pribadi untuk Indonesia. Catat pengeluaran, atur budget, dan capai goals keuanganmu.",
  keywords: ["keuangan", "personal finance", "indonesia", "budget", "tabungan", "celengan"],
  authors: [{ name: "Celengan" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#68B684",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-surface text-[#1A1A1A] antialiased`}>
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#1A1A1A",
              color: "#FFFFFF",
              borderRadius: "12px",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
