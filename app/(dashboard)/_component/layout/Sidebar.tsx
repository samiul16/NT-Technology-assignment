"use client";
import { Box, Typography } from "@mui/material";
import { User } from "@/types/user";

interface SidebarProps {
  mode: "light" | "dark";
  user: User;
}

const MENU_ITEMS = [
  { label: "Kanban board", roles: ["admin", "manager", "user"] },
  { label: "Tasks", roles: ["admin", "manager"] },
  { label: "Timeline", roles: ["admin", "manager"] },
  { label: "Issues", roles: ["admin"] },
  { label: "Settings", roles: ["admin"] },
];

export default function Sidebar({ mode, user }: SidebarProps) {
  const visibleItems = MENU_ITEMS.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <Box
      sx={{
        width: 240,
        height: "100%", // Take full height of parent
        borderRight: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        p: 2,
        bgcolor: mode === "light" ? "#F4F5F7" : "#161B22",
      }}
    >
      {/* Brand Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 4 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            bgcolor: "primary.main",
            borderRadius: 1,
          }}
        />
        <Box>
          <Typography variant="subtitle2" fontWeight={700} color="text.primary">
            Ray Marketing
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Software project
          </Typography>
        </Box>
      </Box>

      <Typography
        variant="caption"
        fontWeight={700}
        color="text.secondary"
        sx={{ mb: 1, px: 1 }}
      >
        PLANNING
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {visibleItems.map((item) => (
          <Box
            key={item.label}
            sx={{
              p: 1,
              px: 1.5,
              borderRadius: 1,
              cursor: "pointer",
              color: "text.secondary",
              "&:hover": { bgcolor: "action.hover" },
              // Example logic for active state:
              ...(item.label === "Kanban board" && {
                bgcolor: "action.selected",
                color: "primary.main",
                fontWeight: 600,
              }),
            }}
          >
            {item.label}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
