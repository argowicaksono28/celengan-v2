// ──────────────────────────────────────────────────────────────
// Account Types
// ──────────────────────────────────────────────────────────────
export const ACCOUNT_TYPES = [
  { value: "CASH",          label: "Dompet (Cash)",    icon: "Wallet",    color: "#68B684" },
  { value: "BANK",          label: "Rekening Bank",    icon: "Building2", color: "#3B82F6" },
  { value: "EWALLET",       label: "Dompet Digital",   icon: "Smartphone", color: "#8B5CF6" },
  { value: "SAVINGS_POCKET",label: "Tabungan",         icon: "PiggyBank", color: "#F97316" },
  { value: "CUSTOM",        label: "Lainnya",          icon: "MoreHorizontal", color: "#9CA3AF" },
] as const;

// Quick-add account chips for onboarding
export const QUICK_ACCOUNT_CHIPS = [
  { name: "Dompet Cash", type: "CASH",    icon: "Wallet",    color: "#68B684" },
  { name: "BCA",         type: "BANK",    icon: "Building2", color: "#3B82F6" },
  { name: "Mandiri",     type: "BANK",    icon: "Building2", color: "#F59E0B" },
  { name: "GoPay",       type: "EWALLET", icon: "Smartphone", color: "#00AED6" },
  { name: "OVO",         type: "EWALLET", icon: "Smartphone", color: "#4C3494" },
  { name: "ShopeePay",   type: "EWALLET", icon: "Smartphone", color: "#EE4D2D" },
  { name: "DANA",        type: "EWALLET", icon: "Smartphone", color: "#118EEA" },
  { name: "Lainnya",     type: "CUSTOM",  icon: "MoreHorizontal", color: "#9CA3AF" },
] as const;

// ──────────────────────────────────────────────────────────────
// Default Category Icons (Lucide names)
// ──────────────────────────────────────────────────────────────
export const EXPENSE_CATEGORIES_DEFAULT = [
  { name: "Makan",       icon: "UtensilsCrossed", color: "#3B82F6" },
  { name: "Transport",   icon: "Car",             color: "#F97316" },
  { name: "Belanja",     icon: "ShoppingBag",     color: "#8B5CF6" },
  { name: "Tagihan",     icon: "FileText",        color: "#EF4444" },
  { name: "Hiburan",     icon: "Tv",              color: "#EC4899" },
  { name: "Kesehatan",   icon: "Heart",           color: "#10B981" },
  { name: "Pendidikan",  icon: "BookOpen",        color: "#14B8A6" },
  { name: "Lainnya",     icon: "MoreHorizontal",  color: "#9CA3AF" },
] as const;

export const INCOME_CATEGORIES_DEFAULT = [
  { name: "Gaji",              icon: "Briefcase",      color: "#10B981" },
  { name: "Freelance",         icon: "Laptop",         color: "#14B8A6" },
  { name: "Bonus",             icon: "Gift",           color: "#EAB308" },
  { name: "Investasi",         icon: "TrendingUp",     color: "#3B82F6" },
  { name: "Hadiah",            icon: "Package",        color: "#8B5CF6" },
  { name: "Pemasukan Lainnya", icon: "MoreHorizontal", color: "#9CA3AF" },
] as const;

// ──────────────────────────────────────────────────────────────
// Category Color Palette (for custom categories — fixed 8 colors)
// ──────────────────────────────────────────────────────────────
export const CATEGORY_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F97316", // Orange
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#EF4444", // Red
  "#EAB308", // Yellow
] as const;

// ──────────────────────────────────────────────────────────────
// Custom Category Icon Options (Lucide names)
// ──────────────────────────────────────────────────────────────
export const CUSTOM_CATEGORY_ICONS = [
  "ShoppingBag", "Coffee", "Pizza", "Car", "Fuel", "Bus",
  "Plane", "Hotel", "Home", "Zap", "Wifi", "Phone",
  "Monitor", "Gamepad2", "Music", "Film", "Book", "GraduationCap",
  "Heart", "Baby", "PawPrint", "Dumbbell", "Scissors", "Shirt",
  "Gift", "Party", "Ticket", "Camera", "Bicycle", "Leaf",
  "Wrench", "Briefcase", "DollarSign", "TrendingUp", "PiggyBank", "CreditCard",
  "Landmark", "Building2", "Store", "Package", "Box", "Archive",
  "MoreHorizontal",
] as const;

// ──────────────────────────────────────────────────────────────
// Goal Icons (emoji)
// ──────────────────────────────────────────────────────────────
export const GOAL_ICONS = [
  "🎯", "🏠", "🚗", "✈️", "💍", "🎓", "💻", "📱",
  "🏋️", "🌴", "💰", "🏦", "🛡️", "🎸", "🐶", "👶",
] as const;

// ──────────────────────────────────────────────────────────────
// Budget thresholds
// ──────────────────────────────────────────────────────────────
export const BUDGET_THRESHOLDS = {
  WARN:  0.7,  // 70% — start amber
  ALERT: 0.8,  // 80% — show alert banner
  DANGER: 0.9, // 90% — red
} as const;

// ──────────────────────────────────────────────────────────────
// Plans
// ──────────────────────────────────────────────────────────────
export const FREE_GOAL_LIMIT = 5;
export const FREE_GOAL_WARN_AT = 4;  // Show upgrade prompt at 4/5

// ──────────────────────────────────────────────────────────────
// Months in Bahasa Indonesia
// ──────────────────────────────────────────────────────────────
export const MONTH_NAMES_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
] as const;
