import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabaseServer";

export async function DELETE(request: Request) {
  const body = await request.json();

  const { taskId } = body;

  const { error } = await supabaseServer
    .from("tasks")
    .delete()
    .eq("id", taskId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
  });
}
