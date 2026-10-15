"use client";
import Board from "@/app/(dashboard)/board/_components/Board/Board";
import AddTaskModal from "@/app/(dashboard)/board/_components/AddTaskModal";
import { Box, Typography, Avatar, AvatarGroup } from "@mui/material";

export default function BoardPage() {
  return (
    <>
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
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <Board />
      </Box>
    </>
  );
}
