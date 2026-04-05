import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const now = new Date();
  const month = parseInt(searchParams.get("month") ?? String(now.getMonth() + 1));
  const year = parseInt(searchParams.get("year") ?? String(now.getFullYear()));

  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const end = new Date(year, month, 0).toISOString().split("T")[0];

  // Run all queries in parallel
  const [accountsRes, txRes, budgetsRes, goalsRes, recentRes] = await Promise.all([
    supabase
      .from("accounts")
      .select("id, name, icon, color, balance, type")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at"),

    supabase
      .from("transactions")
      .select("type, amount, category_id, category:categories(id, name, icon, color)")
      .eq("user_id", user.id)
      .gte("date", start)
      .lte("date", end)
      .neq("type", "TRANSFER"),

    supabase
      .from("budgets")
      .select("id, amount, category_id, category:categories(id, name, icon, color)")
      .eq("user_id", user.id)
      .eq("month", month)
      .eq("year", year),

    supabase
      .from("goals")
      .select("id, name, target_amount, saved_amount, icon, deadline")
      .eq("user_id", user.id)
      .eq("is_completed", false)
      .order("created_at")
      .limit(3),

    supabase
      .from("transactions")
      .select(`
        id, type, amount, note, date,
        account:accounts(id, name, icon, color),
        category:categories(id, name, icon, color)
      `)
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const accounts = accountsRes.data ?? [];
  const txs = txRes.data ?? [];
  const budgets = budgetsRes.data ?? [];
  const goals = goalsRes.data ?? [];
  const recentTxs = recentRes.data ?? [];

  // Aggregate
  const totalBalance = accounts.reduce((s, a) => s + (a.balance ?? 0), 0);
  const totalIncome = txs.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const totalExpense = txs.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

  // Spending by category
  const spentByCategory: Record<string, number> = {};
  for (const tx of txs) {
    if (tx.type === "EXPENSE" && tx.category_id) {
      spentByCategory[tx.category_id] = (spentByCategory[tx.category_id] ?? 0) + tx.amount;
    }
  }

  // Enrich budgets with spent
  const enrichedBudgets = budgets.map((b) => ({
    ...b,
    spent: b.category_id ? (spentByCategory[b.category_id] ?? 0) : totalExpense,
  }));

  // Overall budget (null category_id = overall)
  const overallBudget = budgets.find((b) => !b.category_id);

  return NextResponse.json({
    totalBalance,
    totalIncome,
    totalExpense,
    accounts,
    budgets: enrichedBudgets,
    overallBudget: overallBudget
      ? { amount: overallBudget.amount, spent: totalExpense }
      : null,
    goals,
    recentTransactions: recentTxs,
    month,
    year,
  });
}
