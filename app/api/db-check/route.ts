import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  console.log(
    "Database host:",
    process.env.DATABASE_URL
      ? new URL(process.env.DATABASE_URL).hostname
      : "DATABASE_URL is missing"
  );

  try {
    const taskCount = await prisma.tasks.count();

    return NextResponse.json({
      success: true,
      message: "PostgreSQL connected successfully",
      taskCount,
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    return NextResponse.json(
      { success: false, message: "Database connection failed" },
      { status: 500 }
    );
  }
}
