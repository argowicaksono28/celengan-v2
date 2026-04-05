import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { FREE_GOAL_LIMIT } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const includeCompleted = searchParams.get("include_completed") === "true";

  let query = supabase
    .from("goals")
    .select(`
      *,
      linked_account:accounts(id, name, icon, balance)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!includeCompleted) query = query.eq("is_completed", false);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Enforce free limit
  const { count } = await supabase
    .from("goals")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_completed", false);

  if ((count ?? 0) >= FREE_GOAL_LIMIT) {
    return NextResponse.json({ error: "GOAL_LIMIT_REACHED", limit: FREE_GOAL_LIMIT }, { status: 403 });
  }

  const body = await req.json();
  const { name, target_amount, saved_amount, deadline, linked_account_id, icon } = body;

  if (!name || !target_amount) {
    return NextResponse.json({ error: "name and target_amount required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("goals")
    .insert({
      user_id: user.id,
      name,
      target_amount,
      saved_amount: saved_amount ?? 0,
      deadline: deadline || null,
      linked_account_id: linked_account_id || null,
      icon: icon ?? "🎯",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
