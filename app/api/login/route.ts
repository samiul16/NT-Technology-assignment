import { NextResponse } from "next/server";

import { users } from "@/lib/dummyUsers";

import { signToken } from "@/lib/jwt";

export async function POST(req: Request) {
  const { userId } = await req.json();

  const user = users.find((u) => u.id === userId);

  if (!user) {
    return NextResponse.json(
      {
        error: "User not found",
      },
      {
        status: 404,
      }
    );
  }

  const token = signToken(user);

  return NextResponse.json({
    token,
  });
}
