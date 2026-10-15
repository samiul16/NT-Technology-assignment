import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const { taskId, newStatus, newOrder, userName } = body;

    // 1️⃣ Update Database

    const { error } = await supabaseServer
      .from("tasks")
      .update({
        status: newStatus,

        order_index: newOrder,

        updated_by: userName,

        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 2️⃣ Broadcast Notification

    const message = `${userName} moved task`;

    const channel = supabaseServer.channel("board-notifications");

    await channel.send({
      type: "broadcast",

      event: "task-moved",

      payload: {
        message,

        sender: userName,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
