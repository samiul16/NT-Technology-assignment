import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@/src/generated/prisma/client";
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

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (name.length < 2 || name.length > 120) {
      return NextResponse.json(
        {
          success: false,
          message: "Name must be between 2 and 120 characters.",
        },
        { status: 400 }
      );
    }

    if (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must be at least 8 characters and no more than 72 UTF-8 bytes.",
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.users.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    const role = await prisma.roles.findUnique({
      where: { name: "USER" },
      select: { id: true, name: true },
    });

    if (!role) {
      return NextResponse.json(
        { success: false, message: "Default USER role is not configured." },
        { status: 500 }
      );
    }

    const password_hash = await bcrypt.hash(password, 12);

    const user = await prisma.users.create({
      data: {
        name,
        email,
        password_hash,
        role_id: role.id,
      },
      include: { role: true },
    });

    const publicUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
    };

    const token = await createAuthToken(publicUser);
    await setAuthCookie(token);

    return NextResponse.json(
      { success: true, user: publicUser },
      { status: 201 }
    );
  } catch (error) {
    // Handle concurrent requests for the same unique email.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error as unknown as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    console.error("Sign-up failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to create account." },
      { status: 500 }
    );
  }
}
