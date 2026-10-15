import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const title = typeof body.title === "string" ? body.title.trim() : "";

    if (!title || title.length > 200) {
      return NextResponse.json(
        { success: false, message: "Title must be 1–200 characters" },
        { status: 400 }
      );
    }

    const description =
      body.description === undefined || body.description === null
        ? null
        : body.description;

    if (description !== null && typeof description !== "string") {
      return NextResponse.json(
        { success: false, message: "Description must be a string or null" },
        { status: 400 }
      );
    }

    if (description !== null && description.length > 10000) {
      return NextResponse.json(
        { success: false, message: "Description is too long" },
        { status: 400 }
      );
    }

    const status = body.status ?? "TODO";
    const priority = body.priority ?? "MEDIUM";

    if (!STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid task status" },
        { status: 400 }
      );
    }

    if (!PRIORITIES.includes(priority)) {
      return NextResponse.json(
        { success: false, message: "Invalid task priority" },
        { status: 400 }
      );
    }

    let dueDate: Date | null = null;

    if (body.due_date !== undefined && body.due_date !== null) {
      if (typeof body.due_date !== "string" || body.due_date.trim() === "") {
        return NextResponse.json(
          { success: false, message: "Invalid due date" },
          { status: 400 }
        );
      }

      dueDate = new Date(body.due_date);

      if (Number.isNaN(dueDate.getTime())) {
        return NextResponse.json(
          { success: false, message: "Invalid due date" },
          { status: 400 }
        );
      }
    }

    const task = await prisma.tasks.create({
      data: {
        title,
        description,
        status,
        priority,
        due_date: dueDate,
      },
    });

    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    console.error("Failed to create task:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create task" },
      { status: 500 }
    );
  }
}
