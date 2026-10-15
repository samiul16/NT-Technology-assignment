/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useState, useEffect } from "react";
import { Task } from "@/types/task";
import { useTaskStore } from "@/store/useTaskStore";
import Cookies from "js-cookie";
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";

export default function EditTaskModal({ task }: { task: Task }) {
  const { updateTask } = useTaskStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [userName, setUserName] = useState("Anonymous");

  useEffect(() => {
    const authData = Cookies.get("user-auth");
    if (authData) {
      const user = JSON.parse(authData);
      setUserName(user.name);
    }
  }, []);

  const handleSubmit = async () => {
    // Matching store signature: (taskId, title, description, userName)
    await updateTask(task.id, title, description, userName);
    setOpen(false);
  };

  return (
    <>
      <IconButton size="small" onClick={() => setOpen(true)}>
        <EditIcon fontSize="small" />
      </IconButton>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Task</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Title"
              fullWidth
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
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
