import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // 1-12
  const year = searchParams.get("year");
  const accountId = searchParams.get("account_id");
  const type = searchParams.get("type");
  const search = searchParams.get("search");
  const limit = parseInt(searchParams.get("limit") ?? "100");

  let query = supabase
    .from("transactions")
    .select(`
      id, type, amount, note, date, created_at,
      account:accounts(id, name, icon, color),
      category:categories(id, name, icon, color)
    `)
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (month && year) {
    const y = parseInt(year);
    const m = parseInt(month);
    const start = `${y}-${String(m).padStart(2, "0")}-01`;
    const end = new Date(y, m, 0).toISOString().split("T")[0];
    query = query.gte("date", start).lte("date", end);
  }

  if (accountId) query = query.eq("account_id", accountId);
  if (type) query = query.eq("type", type);
  if (search) query = query.ilike("note", `%${search}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { account_id, category_id, type, amount, note, date } = body;

  if (!account_id || !type || !amount) {
    return NextResponse.json({ error: "account_id, type, amount required" }, { status: 400 });
  }

  // Insert transaction
  const { data: tx, error: txError } = await supabase
    .from("transactions")
    .insert({ user_id: user.id, account_id, category_id: category_id || null, type, amount, note: note || null, date })
    .select()
    .single();

  if (txError) return NextResponse.json({ error: txError.message }, { status: 500 });

  // Update account balance
  const { data: account } = await supabase
    .from("accounts")
    .select("balance")
    .eq("id", account_id)
    .single();

  if (account) {
    const delta = type === "EXPENSE" ? -amount : amount;
    await supabase
      .from("accounts")
      .update({ balance: account.balance + delta })
      .eq("id", account_id);
  }

  return NextResponse.json(tx, { status: 201 });
}
