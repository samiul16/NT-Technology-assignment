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

export default function Board() {
  const { tasks = [], fetchTasks, moveTask, searchQuery } = useTaskStore();

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  useEffect(() => {
    fetchTasks();
  }, []);

  console.log("tasks in board page", tasks);

  // ✅ Filter tasks globally
  const filteredTasks = tasks?.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDragStart = (e: DragStartEvent) => {
    const task = tasks?.find((t) => t.id === e.active.id);

    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;

    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTaskObj = tasks.find((t) => t.id === activeId);

    if (!activeTaskObj) return;

    let newStatus: ColumnType;
    let targetIndex: number;

    const isOverAColumn = ["todo", "inprogress", "done"].includes(overId);

    if (isOverAColumn) {
      newStatus = overId as ColumnType;

      const columnTasks = tasks
        .filter((t) => t.status === newStatus)
        .sort((a, b) => a.order_index - b.order_index);

      targetIndex = columnTasks.length;
    } else {
      const overTaskObj = tasks.find((t) => t.id === overId);

      if (!overTaskObj) return;

      newStatus = overTaskObj.status;

      const columnTasks = tasks
        .filter((t) => t.status === newStatus)
        .sort((a, b) => a.order_index - b.order_index);

      targetIndex = columnTasks.findIndex((t) => t.id === overId);
    }

    const sortedColumnTasks = tasks
      .filter((t) => t.status === newStatus && t.id !== activeId)
      .sort((a, b) => a.order_index - b.order_index);

    let newOrderIndex: number;

    if (sortedColumnTasks.length === 0) {
      newOrderIndex = 1000;
    } else if (targetIndex <= 0) {
      newOrderIndex = sortedColumnTasks[0].order_index / 2;
    } else if (targetIndex >= sortedColumnTasks.length) {
      newOrderIndex =
        sortedColumnTasks[sortedColumnTasks.length - 1].order_index + 1000;
    } else {
      const prev = sortedColumnTasks[targetIndex - 1];

      const next = sortedColumnTasks[targetIndex];

      newOrderIndex = (prev.order_index + next.order_index) / 2;
    }

    const session = Cookies.get("user-auth");

    const userName = session ? JSON.parse(session).name : "Unknown User";

    await moveTask(activeId, newStatus, Math.round(newOrderIndex), userName);
  };

  return (
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
        {/* ✅ Pass filtered tasks */}
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
  );
}
