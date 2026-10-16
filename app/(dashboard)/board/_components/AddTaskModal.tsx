/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { useTaskStore } from "@/store/useTaskStore";
import { ColumnType, CreateTaskRequest, Task } from "@/types/task";
import Cookies from "js-cookie";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Toast from "../../_component/Toast";
import TaskDescriptionAI from "./TaskDescriptionAI";
import TaskDuplicateChecker from "./TaskDuplicateChecker";

type Priority = "low" | "medium" | "high";

export default function AddTaskModal() {
  const { addTask } = useTaskStore();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ColumnType>("todo");
  const [priority, setPriority] = useState<Priority>("medium");
  const [userName, setUserName] = useState("Anonymous");
  const [submitting, setSubmitting] = useState(false);
  const [dueDate, setDueDate] = useState("");

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");

  useEffect(() => {
    const authData = Cookies.get("user-auth");

    if (authData) {
      try {
        const user = JSON.parse(authData);
        setUserName(user.name ?? "Anonymous");
      } catch {
        setUserName("Anonymous");
      }
    }
  }, []);

  const handleCreateTask = async () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle || submitting) return;

    setSubmitting(true);

    try {
      await addTask(
        {
          title: trimmedTitle,
          description,
          status,
          priority: priority.toUpperCase() as "LOW" | "MEDIUM" | "HIGH",
          due_date: dueDate,
        },
        userName
      );

      setTitle("");
      setDescription("");
      setStatus("todo");
      setPriority("medium");
      setOpen(false);

      setToastMessage("Task created successfully!");
      setToastSeverity("success");
      setToastOpen(true);
    } catch {
      setToastMessage("Failed to create task. Please try again.");
      setToastSeverity("error");
      setToastOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setOpen(true)}
        sx={{ textTransform: "none", fontWeight: 600 }}
      >
        Add Task
      </Button>

      <Dialog
        open={open}
        onClose={() => {
          if (!submitting) setOpen(false);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Create New Task</DialogTitle>

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
              label="Task Title"
              fullWidth
              autoFocus
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <TaskDescriptionAI title={title} onAccept={setDescription} />

            <TextField
              label="Task Description"
              fullWidth
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a description or generate one with AI..."
            />

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                label="Status"
                onChange={(e) => setStatus(e.target.value as ColumnType)}
              >
                <MenuItem value="todo">To Do</MenuItem>
                <MenuItem value="inprogress">In Progress</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priority}
                label="Priority"
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>

            {/* Due date field */}
            <TextField
              label="Due Date"
              type="date"
              fullWidth
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
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

          <TaskDuplicateChecker
            title={title}
            description={description}
            onContinue={handleCreateTask}
            disabled={!title.trim() || submitting}
          />
        </DialogActions>
      </Dialog>

      <Toast
        open={toastOpen}
        message={toastMessage}
        severity={toastSeverity}
        onClose={() => setToastOpen(false)}
      />
    </>
  );
}
