/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { useTaskStore } from "@/store/useTaskStore";
import Column from "./Column";
import TaskCard from "./TaskCard";

import { Box } from "@mui/material";
import { ColumnType, Task } from "@/types/task";
import Cookies from "js-cookie";
import Loading from "@/app/(dashboard)/_component/Loading";
import Toast from "@/app/(dashboard)/_component/Toast";

export default function Board() {
  const { tasks = [], fetchTasks, moveTask, searchQuery } = useTaskStore();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">(
    "success"
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  useEffect(() => {
    const loadTasks = async () => {
      setIsLoading(true);

      try {
        await fetchTasks();
      } catch (error) {
        console.error("Failed to load tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadTasks();
  }, [fetchTasks]);

  // Filter tasks globally
  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDragStart = (e: DragStartEvent) => {
    const task = tasks.find((t) => t.id === e.active.id);

    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;

    setActiveTask(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeTaskObj = tasks.find((t) => t.id === activeId);

    if (!activeTaskObj) return;

    let newStatus: ColumnType;
    let targetIndex: number;

    const isOverAColumn = ["todo", "inprogress", "done"].includes(overId);

    if (isOverAColumn) {
      newStatus = overId as ColumnType;

      const columnTasks = tasks
        .filter((t) => t.status === newStatus)
        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

      targetIndex = columnTasks.length;
    } else {
      const overTaskObj = tasks.find((t) => t.id === overId);

      if (!overTaskObj) return;

      newStatus = overTaskObj.status;

      const columnTasks = tasks
        .filter((t) => t.status === newStatus)
        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

      targetIndex = columnTasks.findIndex((t) => t.id === overId);

      if (targetIndex === -1) return;
    }

    // Allowed status transitions
    const allowedTransitions: Record<ColumnType, ColumnType[]> = {
      todo: ["inprogress"],
      inprogress: ["done"],
      done: ["inprogress"],
    };

    // Reject invalid status transitions.
    // Reordering within the same column is still allowed.
    if (
      activeTaskObj.status !== newStatus &&
      !allowedTransitions[activeTaskObj.status].includes(newStatus)
    ) {
      let message = `${activeTaskObj.status} → ${newStatus} is not allowed`;
      if (activeTaskObj.status === "done" && newStatus === "todo") {
        message = "Cannot move task from Done to To Do. Create a new task.";
      }
      setToastMessage(message);

      setToastSeverity("error");
      setToastOpen(true);
      return;
    }

    // Calculate the new position
    const sortedColumnTasks = tasks
      .filter((t) => t.status === newStatus && t.id !== activeId)
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

    let newOrderIndex: number;

    if (sortedColumnTasks.length === 0) {
      newOrderIndex = 1000;
    } else if (targetIndex <= 0) {
      newOrderIndex = (sortedColumnTasks[0].order_index || 0) / 2;
    } else if (targetIndex >= sortedColumnTasks.length) {
      newOrderIndex =
        (sortedColumnTasks[sortedColumnTasks.length - 1].order_index || 0) +
        1000;
    } else {
      const prev = sortedColumnTasks[targetIndex - 1];
      const next = sortedColumnTasks[targetIndex];

      newOrderIndex = ((prev.order_index || 0) + (next.order_index || 0)) / 2;
    }

    const session = Cookies.get("user-auth");
    const userName = session ? JSON.parse(session).name : "Unknown User";

    await moveTask(activeId, newStatus, Math.round(newOrderIndex), userName);
  };

  if (isLoading) {
    return <Loading message="Loading your tasks..." />;
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            px: 3,
            height: "100%",
            overflowX: "auto",
            pb: 4,
            alignItems: "flex-start",
          }}
        >
          <Column columnId="todo" title="TO DO" tasks={filteredTasks} />

          <Column
            columnId="inprogress"
            title="IN PROGRESS"
            tasks={filteredTasks}
          />

          <Column columnId="done" title="DONE" tasks={filteredTasks} />
        </Box>

        <DragOverlay>
          {activeTask ? (
            <Box
              sx={{
                width: 280,
                transform: "rotate(2deg)",
              }}
            >
              <TaskCard task={activeTask} isOverlay />
            </Box>
          ) : null}
        </DragOverlay>
      </DndContext>
      <Toast
        open={toastOpen}
        message={toastMessage}
        severity={toastSeverity}
        onClose={() => setToastOpen(false)}
      />
    </>
  );
}
