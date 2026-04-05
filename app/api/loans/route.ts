import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("loans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { person_name, direction, original_amount, due_date, note } = body;

  if (!person_name || !direction || !original_amount) {
    return NextResponse.json({ error: "person_name, direction, original_amount required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("loans")
    .insert({
      user_id: user.id,
      person_name,
      direction,
      original_amount,
      remaining_amount: original_amount,
      status: "ACTIVE",
      due_date: due_date || null,
      note: note || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
