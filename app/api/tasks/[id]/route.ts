import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const validStatuses = ["TODO", "IN_PROGRESS", "DONE"];
const validPriorities = ["LOW", "MEDIUM", "HIGH"];

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const task = await prisma.tasks.findFirst({
      where: { id },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error("GET /api/tasks/[id] error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch task." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const existingTask = await prisma.tasks.findFirst({
      where: { id },
    });

    if (!existingTask) {
      return NextResponse.json(
        { success: false, message: "Task not found or access denied." },
        { status: 404 }
      );
    }

    const data: {
      title?: string;
      description?: string | null;
      status?: "TODO" | "IN_PROGRESS" | "DONE";
      priority?: "LOW" | "MEDIUM" | "HIGH";
      due_date?: Date | null;
    } = {};

    if (body.title !== undefined) {
      if (
        typeof body.title !== "string" ||
        !body.title.trim() ||
        body.title.trim().length > 200
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid task title." },
          { status: 400 }
        );
      }

      data.title = body.title.trim();
    }

    if (body.description !== undefined) {
      if (body.description !== null && typeof body.description !== "string") {
        return NextResponse.json(
          { success: false, message: "Invalid task description." },
          { status: 400 }
        );
      }

      data.description = body.description;
    }

    if (body.status !== undefined) {
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { success: false, message: "Invalid task status." },
          { status: 400 }
        );
      }

      data.status = body.status;
    }

    if (body.priority !== undefined) {
      if (!validPriorities.includes(body.priority)) {
        return NextResponse.json(
          { success: false, message: "Invalid task priority." },
          { status: 400 }
        );
      }

      data.priority = body.priority;
    }

    if (body.due_date !== undefined) {
      if (body.due_date === null || body.due_date === "") {
        data.due_date = null;
      } else {
        const date = new Date(body.due_date);

        if (Number.isNaN(date.getTime())) {
          return NextResponse.json(
            { success: false, message: "Invalid due date." },
            { status: 400 }
          );
        }

        data.due_date = date;
      }
    }

    const task = await prisma.tasks.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error("PATCH /api/tasks/[id] error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update task." },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const result = await prisma.tasks.deleteMany({
      where: { id },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { success: false, message: "Task not found or access denied." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE /api/tasks/[id] error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete task." },
      { status: 500 }
    );
  }
}
