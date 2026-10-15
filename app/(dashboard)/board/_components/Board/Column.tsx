"use client";

import { useDroppable } from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Box, Typography, Stack } from "@mui/material";

import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";

import TaskCard from "./TaskCard";

import { useMemo } from "react";

import { Task } from "@/types/task";

interface ColumnProps {
  columnId: string;
  title: string;
  tasks: Task[];
}

export default function Column({ columnId, title, tasks }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
  });

  // ✅ Filter tasks for this column
  const columnTasks = useMemo(
    () =>
      tasks
        .filter((t: Task) => t.status === columnId)
        .sort((a: Task, b: Task) => a.order_index - b.order_index),
    [tasks, columnId]
  );

  return (
    <Box
      ref={setNodeRef}
      sx={{
        width: 280,
        minWidth: 280,
        display: "flex",
        flexDirection: "column",
        bgcolor: isOver ? "rgba(0, 0, 0, 0.06)" : "rgba(0, 0, 0, 0.04)",
        borderRadius: 2,
        p: 1.5,
        maxHeight: "calc(100vh - 160px)",
        transition: "0.2s ease",
        border: "2px solid",
        borderColor: isOver ? "primary.main" : "transparent",
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          px: 1,
          mb: 2,
          fontWeight: 700,
          color: "text.secondary",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {title}

        <Box
          component="span"
          sx={{
            bgcolor: "action.selected",
            px: 1,
            borderRadius: 1,
            fontSize: "0.75rem",
          }}
        >
          {columnTasks.length}
        </Box>
      </Typography>

      <Box
        sx={{
          overflowY: "auto",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          minHeight: 100,
        }}
      >
        {columnTasks.length > 0 ? (
          <SortableContext
            items={columnTasks.map((t: Task) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {columnTasks.map((task: Task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </SortableContext>
        ) : (
          <Stack
            spacing={1}
            alignItems="center"
            justifyContent="center"
            sx={{
              py: 4,
              px: 2,
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 2,
              opacity: 0.6,
            }}
          >
            <AssignmentOutlinedIcon
              sx={{
                fontSize: 32,
                color: "text.disabled",
              }}
            />

            <Typography
              variant="caption"
              color="text.disabled"
              fontWeight={500}
            >
              No tasks here
            </Typography>
          </Stack>
        )}
      </Box>
    </Box>
  );
}
