"use client";
import Board from "@/app/(dashboard)/board/_components/Board/Board";
import AddTaskModal from "@/app/(dashboard)/board/_components/AddTaskModal";
import {
  Box,
  Typography,
  Avatar,
  AvatarGroup,
  Snackbar,
  Alert,
} from "@mui/material";
import { useTaskStore } from "@/store/useTaskStore";
import { useEffect } from "react";

// The Notification Component
export function RealtimeNotification() {
  const { notification, setNotification } = useTaskStore();

  console.log("Notification in component:", notification);

  return (
    <Snackbar
      open={!!notification}
      autoHideDuration={4000}
      onClose={() => setNotification(null)}
      // Standard Jira blue-ish color for info notifications
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        onClose={() => setNotification(null)}
        severity="info"
        variant="filled"
        sx={{ width: "100%", fontWeight: 500 }}
      >
        {notification}
      </Alert>
    </Snackbar>
  );
}

export default function BoardPage() {
  const fetchTasks = useTaskStore((state) => state.fetchTasks);

  useEffect(() => {
    // 🚀 Initialize realtime
    useTaskStore.getState().initRealtime();

    // Fetch initial data
    fetchTasks();
  }, [fetchTasks]);
  return (
    <>
      {/* 1. Add the notification component here */}
      <RealtimeNotification />

      {/* LOCAL HEADER */}
      <Box sx={{ px: 3, pt: 3, pb: 2 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Marketing Board
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <AvatarGroup max={4}>
            <Avatar
              sx={{ width: 32, height: 32 }}
              src="https://i.pravatar.cc/150?u=a"
            />
            <Avatar
              sx={{ width: 32, height: 32 }}
              src="https://i.pravatar.cc/150?u=b"
            />
            <Avatar
              sx={{ width: 32, height: 32 }}
              src="https://i.pravatar.cc/150?u=c"
            />
          </AvatarGroup>

          <Box sx={{ flexGrow: 1 }} />

          <AddTaskModal />
        </Box>
      </Box>

      {/* THE KANBAN DRAG AREA */}
      <Box
        sx={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Board />
      </Box>
    </>
  );
}
