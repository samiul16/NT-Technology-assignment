import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabaseServer";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const { taskId, title, description, userName } = body;

    const { error } = await supabaseServer
      .from("tasks")
      .update({
        title,

        description,

        updated_by: userName,

        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
