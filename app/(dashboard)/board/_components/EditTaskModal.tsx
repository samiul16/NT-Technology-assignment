/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Task } from "@/types/task";
import { useTaskStore } from "@/store/useTaskStore";

import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";

import { Edit as EditIcon } from "@mui/icons-material";

type Priority = "low" | "medium" | "high";

export default function EditTaskModal({ task }: { task: Task }) {
  const updateTask = useTaskStore((state) => state.updateTask);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [priority, setPriority] = useState<Priority>(
    String(task.priority ?? "medium").toLowerCase() as Priority
  );
  const [dueDate, setDueDate] = useState(
    task.due_date ? new Date(task.due_date).toISOString().slice(0, 10) : ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Refresh the form with the latest task values when opening.
  useEffect(() => {
    if (open) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setPriority(String(task.priority ?? "medium").toLowerCase() as Priority);
      setDueDate(
        task.due_date ? new Date(task.due_date).toISOString().slice(0, 10) : ""
      );
      setError("");
    }
  }, [open, task]);

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError("Task title is required.");
      return;
    }

    if (trimmedTitle.length > 200) {
      setError("Task title must be at most 200 characters.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await updateTask(
        task.id,
        trimmedTitle,
        description,
        priority,
        dueDate || null
      );

      setOpen(false);
    } catch {
      setError("Failed to update task. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <IconButton
        size="small"
        aria-label={`Edit ${task.title}`}
        onClick={() => setOpen(true)}
      >
        <EditIcon fontSize="small" />
      </IconButton>

      <Dialog
        open={open}
        onClose={() => {
          if (!submitting) setOpen(false);
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Task</DialogTitle>

        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mt: 1,
            }}
          >
            <TextField
              label="Title"
              fullWidth
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              inputProps={{ maxLength: 200 }}
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <FormControl fullWidth>
              <InputLabel id="edit-task-priority-label">Priority</InputLabel>

              <Select
                labelId="edit-task-priority-label"
                value={priority}
                label="Priority"
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Due Date"
              type="date"
              fullWidth
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              slotProps={{
                inputLabel: { shrink: true },
              }}
              helperText="Leave empty to remove the due date."
            />

            {error && (
              <Box role="alert" sx={{ color: "error.main", fontSize: 14 }}>
                {error}
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setOpen(false)}
            color="inherit"
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting || !title.trim()}
            startIcon={
              submitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
          >
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
