import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("credit_cards")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, bank, limit_amount, balance, billing_date, due_date } = body;

  if (!name || !limit_amount) {
    return NextResponse.json({ error: "name and limit_amount required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("credit_cards")
    .insert({ user_id: user.id, name, bank: bank || null, limit_amount, balance: balance ?? 0, billing_date: billing_date || null, due_date: due_date || null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
