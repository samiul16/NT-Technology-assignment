"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  Card,
  Typography,
  Box,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Chip,
} from "@mui/material";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import TaskDetailsModal from "../TaskDetailsModal";

import BookmarkIcon from "@mui/icons-material/Bookmark";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EditTaskModal from "@/app/(dashboard)/board/_components/EditTaskModal";
import { Task } from "@/types/task";
import { useTaskStore } from "@/store/useTaskStore";

const priorityStyles = {
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

export default function TaskCard({
  task,
  isOverlay,
}: {
  task: Task;
  isOverlay?: boolean;
}) {
  const deleteTask = useTaskStore((state) => state.deleteTask);

  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: isOverlay || deleting,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      await deleteTask(task.id);
      setDeleteDialogOpen(false);
    } catch {
      // The store displays an error notification.
    } finally {
      setDeleting(false);
    }
  };

  const rawPriority = String(task.priority ?? "medium").toLowerCase();

  const priority =
    priorityStyles[rawPriority as keyof typeof priorityStyles] ??
    priorityStyles.medium;

  const dueDate = task.due_date ? new Date(task.due_date) : null;

  const validDueDate =
    dueDate && !Number.isNaN(dueDate.getTime()) ? dueDate : null;

  // Compare calendar dates so a task due today is not marked overdue.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDateDay = validDueDate ? new Date(validDueDate) : null;

  dueDateDay?.setHours(0, 0, 0, 0);

  const isOverdue =
    !!dueDateDay &&
    dueDateDay.getTime() < today.getTime() &&
    String(task.status).toLowerCase() !== "done";

  const formattedDueDate = validDueDate
    ? validDueDate.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        sx={{
          p: 1.5,
          cursor: isOverlay ? "default" : "grab",
          border: "1px solid",
          borderColor: isOverdue ? "#ef5350" : "transparent",
          bgcolor: "background.default",
          boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
          "&:hover": {
            borderColor: isOverdue ? "#d32f2f" : "primary.main",
            "& .edit-btn, & .delete-btn, & .view-btn": {
              opacity: 1,
            },
          },
        }}
      >
        <Typography
          variant="body2"
          sx={{
            mb: 1.5,
            fontSize: "0.9rem",
            fontWeight: 600,
            overflowWrap: "anywhere",
          }}
        >
          {task.title}
        </Typography>

        {/* Priority and due date */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
            mb: 1.5,
          }}
        >
          <Chip
            label={`${priority.label} priority`}
            size="small"
            sx={{
              height: 23,
              fontSize: "0.7rem",
              fontWeight: 700,
              color: priority.color,
              bgcolor: priority.background,
              borderRadius: 1,
            }}
          />

          {formattedDueDate && (
            <Tooltip
              title={isOverdue ? "This task is overdue" : "Task due date"}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  color: isOverdue ? "#d32f2f" : "text.secondary",
                }}
              >
                <CalendarTodayIcon sx={{ fontSize: 13 }} />

                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: isOverdue ? 700 : 500,
                  }}
                >
                  {isOverdue
                    ? `Overdue · ${formattedDueDate}`
                    : formattedDueDate}
                </Typography>
              </Box>
            </Tooltip>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <BookmarkIcon sx={{ fontSize: 16, color: "#4bade8" }} />

            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
            >
              MC-{task.id.slice(0, 2).toUpperCase()}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {!isOverlay && (
              <>
                <Box
                  className="edit-btn"
                  sx={{ opacity: 0, transition: "0.2s" }}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => event.stopPropagation()}
                >
                  <EditTaskModal task={task} />
                </Box>

                <Tooltip title="Delete task">
                  <span>
                    <IconButton
                      className="delete-btn"
                      size="small"
                      color="error"
                      disabled={deleting}
                      aria-label={`Delete ${task.title}`}
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={(event) => {
                        event.stopPropagation();
                        setDeleteDialogOpen(true);
                      }}
                      sx={{ opacity: 0, transition: "0.2s" }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>

                <Tooltip title="View task details">
                  <IconButton
                    className="view-btn"
                    size="small"
                    aria-label={`View ${task.title}`}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.stopPropagation();
                      setDetailsOpen(true);
                    }}
                    sx={{ opacity: 0, transition: "0.2s" }}
                  >
                    <VisibilityOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}

            <Avatar sx={{ width: 20, height: 20, fontSize: 10 }}>U</Avatar>
          </Box>
        </Box>
      </Card>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          if (!deleting) setDeleteDialogOpen(false);
        }}
        aria-labelledby="delete-task-dialog-title"
        aria-describedby="delete-task-dialog-description"
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle id="delete-task-dialog-title">Delete task?</DialogTitle>

        <DialogContent>
          <DialogContentText id="delete-task-dialog-description">
            Are you sure you want to delete &ldquo;{task.title}&rdquo;? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
            color="inherit"
          >
            Cancel
          </Button>

          <Button
            onClick={() => void handleDelete()}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <TaskDetailsModal
        task={task}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />
    </>
  );
}
