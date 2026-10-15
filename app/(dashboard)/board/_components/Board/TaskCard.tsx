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
} from "@mui/material";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditTaskModal from "@/app/(dashboard)/board/_components/EditTaskModal";
import { Task } from "@/types/task";
import { useTaskStore } from "@/store/useTaskStore";

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
    } catch {
      // The store displays an error notification.
    } finally {
      setDeleting(false);
    }
  };

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
          borderColor: "transparent",
          bgcolor: "background.default",
          boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
          "&:hover": {
            borderColor: "primary.main",
            "& .edit-btn, & .delete-btn": {
              opacity: 1,
            },
          },
        }}
      >
        <Typography variant="body2" sx={{ mb: 1.5, fontSize: "0.9rem" }}>
          {task.title}
        </Typography>

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
            Are you sure you want to delete &ldquo;{task.title}&ldquo;? This
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
    </>
  );
}
