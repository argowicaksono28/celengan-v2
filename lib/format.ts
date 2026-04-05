/**
 * Format IDR currency per PRD §12.3.3:
 * Rp 1.250.000 (dot as thousand separator, no decimal, Rp prefix with space)
 */
export function formatRupiah(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "Rp 0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Math.round(num));
}

/**
 * Format as short Rupiah (abbreviate large amounts for chart labels only)
 * e.g., 1500000 → "1,5jt" — only use in chart axis labels
 */
export function formatRupiahShort(amount: number): string {
  if (amount >= 1_000_000) {
    const jt = amount / 1_000_000;
    return `${jt % 1 === 0 ? jt.toFixed(0) : jt.toFixed(1)}jt`.replace(".", ",");
  }
  if (amount >= 1_000) {
    const rb = amount / 1_000;
    return `${rb % 1 === 0 ? rb.toFixed(0) : rb.toFixed(1)}rb`.replace(".", ",");
  }
  return `${amount}`;
}

/**
 * Parse Indonesian shorthand input: "35k" → 35000, "8jt" → 8000000
 */
export function parseRupiahInput(input: string): number | null {
  const clean = input.trim().toLowerCase().replace(/[,\s]/g, "").replace(/\./g, "");
  const match = clean.match(/^(\d+(?:\.\d+)?)(jt|juta|rb|ribu|k)?$/);
  if (!match) return null;
  const num = parseFloat(match[1]);
  switch (match[2]) {
    case "jt": case "juta": return Math.round(num * 1_000_000);
    case "rb": case "ribu": case "k": return Math.round(num * 1_000);
    default: return Math.round(num);
  }
}

/**
 * Format date for display in Bahasa Indonesia
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export function formatDateFull(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

/** Returns 'Hari ini', 'Kemarin', or formatted date */
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date + "T00:00:00") : date;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const dMidnight = new Date(d); dMidnight.setHours(0, 0, 0, 0);

  if (dMidnight.getTime() === today.getTime()) return "Hari ini";
  if (dMidnight.getTime() === yesterday.getTime()) return "Kemarin";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export function formatMonthYear(month: number, year: number): string {
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

/**
 * Greeting based on time of day
 */
export function getDayGreeting(name?: string): string {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 18 ? "Selamat sore" : "Selamat malam";
  return name ? `${greeting}, ${name}!` : `${greeting}!`;
}

/**
 * Calculate days remaining until deadline
 */
export function daysUntil(date: string | Date): number {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = d.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Calculate monthly savings needed for a goal
 */
export function monthlySavingsNeeded(
  remainingAmount: number,
  deadline: string | Date
): number {
  const days = daysUntil(deadline);
  if (days <= 0) return remainingAmount;
  const months = Math.max(1, Math.ceil(days / 30));
  return Math.ceil(remainingAmount / months);
}

/**
 * Get current month/year
 */
export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}
