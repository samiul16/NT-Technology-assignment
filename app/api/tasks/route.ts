import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("tasks")
      .select("*")
      .order("order_index", {
        ascending: true,
      });

    console.log("Error ", data, error);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.log("Error ", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { title, description, status, userName, id } = body;

    const { data, error } = await supabaseServer.from("tasks").insert([
      {
        id: id,
        title,
        description,
        status,
        order_index: Date.now(),
        created_by: userName,
      },
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
