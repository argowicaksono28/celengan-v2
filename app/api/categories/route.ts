import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .or(`user_id.eq.${user.id},is_default.eq.true`)
    .order("is_default", { ascending: false })
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, icon, color, tx_type } = body;

  if (!name || !tx_type) {
    return NextResponse.json({ error: "name and tx_type required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({ user_id: user.id, name, icon: icon ?? "Tag", color: color ?? "#68B684", tx_type, is_default: false })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
