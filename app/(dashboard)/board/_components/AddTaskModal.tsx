/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { useTaskStore } from "@/store/useTaskStore";
import { ColumnType, Task } from "@/types/task";
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

export default function AddTaskModal() {
  const { addTask } = useTaskStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ColumnType>("todo");
  const [userName, setUserName] = useState("Anonymous");
  const [submitting, setSubmitting] = useState(false);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");

  useEffect(() => {
    const authData = Cookies.get("user-auth");
    if (authData) {
      const user = JSON.parse(authData);
      setUserName(user.name); // Get actual user name
    }
  }, []);

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) return;

    try {
      await addTask(
        {
          title: trimmedTitle,
          description,
          status,
        } as Task,
        userName
      );

      setTitle("");
      setDescription("");
      setStatus("todo");
      setOpen(false);

      setToastMessage("Task created successfully!");
      setToastSeverity("success");
      setToastOpen(true);
    } catch {
      setToastMessage("Failed to create task. Please try again.");
      setToastSeverity("error");
      setToastOpen(true);
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
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Create New Task</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Task Title"
              fullWidth
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!title || submitting}
          >
            {submitting ? "Creating..." : "Create Task"}
          </Button>
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
