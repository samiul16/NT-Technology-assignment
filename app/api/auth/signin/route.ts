import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createAuthToken, setAuthCookie } from "@/lib/auth";

export const runtime = "nodejs";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(req: Request) {
  try {
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    if (!isObject(body)) {
      return NextResponse.json(
        { success: false, message: "Request body must be an object." },
        { status: 400 }
      );
    }

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (
      !email ||
      email.length > 255 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !password ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return NextResponse.json(
        { success: false, message: "Enter a valid email and password." },
        { status: 400 }
      );
    }

    const user = await prisma.users.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const publicUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
    };

    const token = await createAuthToken(publicUser);
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: publicUser,
    });
  } catch (error) {
    console.error("Sign-in failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to sign in." },
      { status: 500 }
    );
  }
}
