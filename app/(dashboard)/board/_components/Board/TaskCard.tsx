// TaskCard.tsx
"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, Typography, Box, Avatar } from "@mui/material";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import EditTaskModal from "@/app/(dashboard)/board/_components/EditTaskModal";
import { Task } from "@/types/task";

export default function TaskCard({
  task,
  isOverlay,
}: {
  task: Task;
  isOverlay?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        p: 1.5,
        cursor: "grab",
        border: "1px solid",
        borderColor: "transparent",
        bgcolor: "background.default",
        boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
        "&:hover": {
          borderColor: "primary.main",
          "& .edit-btn": { opacity: 1 },
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
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            MC-{task.id.slice(0, 2).toUpperCase()}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box className="edit-btn" sx={{ opacity: 0, transition: "0.2s" }}>
            <EditTaskModal task={task} />
          </Box>
          <Avatar sx={{ width: 20, height: 20, fontSize: 10 }}>U</Avatar>
        </Box>
      </Box>
    </Card>
  );
}
