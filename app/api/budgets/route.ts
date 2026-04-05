import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));

  const { data: budgets, error } = await supabase
    .from("budgets")
    .select(`
      id, amount, month, year,
      category:categories(id, name, icon, color)
    `)
    .eq("user_id", user.id)
    .eq("month", month)
    .eq("year", year);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get spending per category for that month
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const end = new Date(year, month, 0).toISOString().split("T")[0];

  const { data: txs } = await supabase
    .from("transactions")
    .select("category_id, amount")
    .eq("user_id", user.id)
    .eq("type", "EXPENSE")
    .gte("date", start)
    .lte("date", end);

  const spentByCategory: Record<string, number> = {};
  for (const tx of txs ?? []) {
    if (tx.category_id) {
      spentByCategory[tx.category_id] = (spentByCategory[tx.category_id] ?? 0) + tx.amount;
    }
  }
  const totalSpent = (txs ?? []).reduce((s, t) => s + t.amount, 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enriched = (budgets ?? []).map((b: any) => ({
    ...b,
    spent: b.category ? (spentByCategory[(b.category as { id: string }).id] ?? 0) : totalSpent,
  }));

  return NextResponse.json({ budgets: enriched, totalSpent });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { category_id, amount, month, year } = body;

  if (!amount || !month || !year) {
    return NextResponse.json({ error: "amount, month, year required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("budgets")
    .upsert(
      { user_id: user.id, category_id: category_id || null, amount, month, year },
      { onConflict: "user_id,category_id,month,year" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
