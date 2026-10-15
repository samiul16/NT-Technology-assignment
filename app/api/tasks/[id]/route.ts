import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const STATUSES = ["TODO", "IN_PROGRESS", "DONE"] as const;
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isValidId(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id
  );
}

function invalidIdResponse() {
  return NextResponse.json(
    { success: false, message: "Invalid task ID" },
    { status: 400 }
  );
}

function notFoundResponse() {
  return NextResponse.json(
    { success: false, message: "Task not found" },
    { status: 404 }
  );
}

// GET /api/tasks/:id
export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;

  if (!isValidId(id)) return invalidIdResponse();

  try {
    const task = await prisma.tasks.findUnique({
      where: { id },
    });

    if (!task) return notFoundResponse();

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error("Failed to fetch task:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks/:id
export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;

  if (!isValidId(id)) return invalidIdResponse();

  try {
    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      );
    }

    const data: {
      title?: string;
      description?: string | null;
      status?: (typeof STATUSES)[number];
      priority?: (typeof PRIORITIES)[number];
      due_date?: Date | null;
    } = {};

    if ("title" in body) {
      if (
        typeof body.title !== "string" ||
        body.title.trim().length === 0 ||
        body.title.trim().length > 200
      ) {
        return NextResponse.json(
          { success: false, message: "Title must be 1–200 characters" },
          { status: 400 }
        );
      }

      data.title = body.title.trim();
    }

    if ("description" in body) {
      if (body.description !== null && typeof body.description !== "string") {
        return NextResponse.json(
          { success: false, message: "Description must be a string or null" },
          { status: 400 }
        );
      }

      if (
        typeof body.description === "string" &&
        body.description.length > 10000
      ) {
        return NextResponse.json(
          { success: false, message: "Description is too long" },
          { status: 400 }
        );
      }

      data.description = body.description;
    }

    if ("status" in body) {
      if (!STATUSES.includes(body.status)) {
        return NextResponse.json(
          { success: false, message: "Invalid task status" },
          { status: 400 }
        );
      }

      data.status = body.status;
    }

    if ("priority" in body) {
      if (!PRIORITIES.includes(body.priority)) {
        return NextResponse.json(
          { success: false, message: "Invalid task priority" },
          { status: 400 }
        );
      }

      data.priority = body.priority;
    }

    if ("due_date" in body) {
      if (body.due_date === null) {
        data.due_date = null;
      } else if (
        typeof body.due_date === "string" &&
        body.due_date.trim() !== "" &&
        !Number.isNaN(Date.parse(body.due_date))
      ) {
        data.due_date = new Date(body.due_date);
      } else {
        return NextResponse.json(
          { success: false, message: "Invalid due date" },
          { status: 400 }
        );
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided to update" },
        { status: 400 }
      );
    }

    const existingTask = await prisma.tasks.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingTask) return notFoundResponse();

    const task = await prisma.tasks.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    console.error("Failed to update task:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update task" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/:id
export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;

  if (!isValidId(id)) return invalidIdResponse();

  try {
    const existingTask = await prisma.tasks.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingTask) return notFoundResponse();

    await prisma.tasks.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete task:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete task" },
      { status: 500 }
    );
  }
}
