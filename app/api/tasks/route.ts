import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

const STATUSES = ["TODO", "IN_PROGRESS", "DONE"] as const;
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;

export async function GET() {
  try {
    const tasks = await prisma.tasks.findMany({
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error("Failed to fetch tasks:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const title = typeof body.title === "string" ? body.title.trim() : "";

    if (!title || title.length > 200) {
      return NextResponse.json(
        {
          success: false,
          message: "Title is required and must be at most 200 characters.",
        },
        { status: 400 }
      );
    }

    const validStatuses = ["TODO", "IN_PROGRESS", "DONE"];
    const validPriorities = ["LOW", "MEDIUM", "HIGH"];

    const status = body.status ?? "TODO";
    const priority = body.priority ?? "MEDIUM";

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid task status." },
        { status: 400 }
      );
    }

    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { success: false, message: "Invalid task priority." },
        { status: 400 }
      );
    }

    const task = await prisma.tasks.create({
      data: {
        title,
        description:
          typeof body.description === "string" ? body.description : null,
        status,
        priority,
        due_date: body.due_date ? new Date(body.due_date) : null,
        user_id: user.id,
      },
    });

    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create task." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await req.json();

    const tasks = await prisma.tasks.deleteMany({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error("DELETE /api/tasks error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete tasks" },
      { status: 500 }
    );
  }
}
