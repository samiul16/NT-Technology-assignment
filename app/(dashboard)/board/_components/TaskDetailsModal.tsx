"use client";

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { Task } from "@/types/task";

interface TaskDetailsModalProps {
  task: Task;
  open: boolean;
  onClose: () => void;
}

export default function TaskDetailsModal({
  task,
  open,
  onClose,
}: TaskDetailsModalProps) {
  const status = String(task.status ?? "todo")
    .toLowerCase()
    .replace("_", "");

  const statusLabel =
    status === "inprogress"
      ? "In Progress"
      : status === "done"
      ? "Done"
      : "To Do";

  const rawPriority = String(task.priority ?? "medium").toLowerCase();

  const priorityStyles: Record<
    string,
    { label: string; color: string; background: string }
  > = {
    low: {
      label: "Low",
      color: "#2e7d32",
      background: "#e8f5e9",
    },
    medium: {
      label: "Medium",
      color: "#ed6c02",
      background: "#fff3e0",
    },
    high: {
      label: "High",
      color: "#d32f2f",
      background: "#ffebee",
    },
  };

  const priority = priorityStyles[rawPriority] ?? priorityStyles.medium;

  const dueDate = task.due_date ? new Date(task.due_date) : null;

  const validDueDate =
    dueDate && !Number.isNaN(dueDate.getTime()) ? dueDate : null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDateDay = validDueDate ? new Date(validDueDate) : null;
  dueDateDay?.setHours(0, 0, 0, 0);

  const isOverdue = !!dueDateDay && dueDateDay < today && status !== "done";

  const formattedDueDate = validDueDate
    ? validDueDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="task-details-title"
    >
      {/* Modal header */}
      <DialogTitle
        id="task-details-title"
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
          fontWeight: 700,
          pr: 1.5,
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ pt: 0.5 }}>
          Task Details
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1,
          }}
        >
          {/* Status and priority at the top-right */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 1,
            }}
          >
            <Chip
              size="small"
              label={statusLabel}
              color={
                status === "done"
                  ? "success"
                  : status === "inprogress"
                  ? "primary"
                  : "default"
              }
            />

            <Chip
              size="small"
              label={`${priority.label} Priority`}
              sx={{
                color: priority.color,
                bgcolor: priority.background,
                fontWeight: 700,
              }}
            />
          </Box>

          <IconButton
            aria-label="Close task details"
            onClick={onClose}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
          }}
        >
          {/* Task title and due date */}
          <Box>
            <Typography variant="overline" color="text.secondary">
              Task title
            </Typography>

            <Typography
              variant="h6"
              sx={{
                overflowWrap: "anywhere",
                mb: 1.5,
              }}
            >
              {task.title}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <CalendarTodayIcon
                fontSize="small"
                color={isOverdue ? "error" : "action"}
              />

              <Typography
                variant="body2"
                color={isOverdue ? "error.main" : "text.secondary"}
                fontWeight={isOverdue ? 700 : 400}
              >
                {formattedDueDate
                  ? `${formattedDueDate}${isOverdue ? " — Overdue" : ""}`
                  : "No due date set"}
              </Typography>
            </Box>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                mt: 1,
                overflowWrap: "anywhere",
              }}
            >
              Task ID: {task.id}
            </Typography>
          </Box>

          {/* Task description */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Description
            </Typography>

            <Box
              sx={{
                p: 2,
                bgcolor: "action.hover",
                borderRadius: 1,
                minHeight: 60,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                  lineHeight: 1.8,
                }}
              >
                {task.description?.trim() || "No description provided."}
              </Typography>
            </Box>
          </Box>

          {/* Created timestamp */}
          {"created_at" in task && task.created_at && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Created
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {new Date(task.created_at).toLocaleString()}
              </Typography>
            </Box>
          )}

          {/* Updated timestamp */}
          {"updated_at" in task && task.updated_at && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Last updated
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {new Date(task.updated_at).toLocaleString()}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      {/* Modal footer */}
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
