"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  TextField,
  IconButton,
  Breadcrumbs,
  Link,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Badge,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuIcon from "@mui/icons-material/Menu"; // Added Menu Icon
import { User } from "@/types/user";
import { useTaskStore } from "@/store/useTaskStore";
import { useDebounce } from "@/hooks/useDebounce";

interface NavbarProps {
  mode: "light" | "dark";
  setMode: (mode: "light" | "dark") => void;
  user: User;
  onLogout: () => void;
  onMenuClick?: () => void; // Used to open the drawer
}

export default function Navbar({
  mode,
  setMode,
  user,
  onLogout,
  onMenuClick,
}: NavbarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const setSearchQuery = useTaskStore((state) => state.setSearchQuery);

  const [localSearch, setLocalSearch] = useState("");

  // debounce input
  const debouncedSearch = useDebounce(localSearch, 300);

  // update store only after debounce
  useEffect(() => {
    setSearchQuery(debouncedSearch);
  }, [debouncedSearch]);

  return (
    <Box
      sx={{
        height: 56,
        px: { xs: 1, sm: 3 }, // Smaller padding on mobile
        borderBottom: "1px solid",
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        bgcolor: "background.default",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {/* HAMBURGER MENU: Visible only on mobile/tablet (xs, sm) */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 1, display: { md: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        {/* BREADCRUMBS: Hidden on extra small screens to save space */}
        <Breadcrumbs
          sx={{
            fontSize: "0.85rem",
            display: { xs: "none", sm: "flex" },
          }}
        >
          <Link underline="hover" color="inherit" href="#">
            Projects
          </Link>
          <Typography color="text.primary" sx={{ fontSize: "0.85rem" }}>
            Marketing
          </Typography>
        </Breadcrumbs>
      </Box>

      <Box
        sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1 } }}
      >
        {/* SEARCH: Shrinks on mobile */}
        <TextField
          size="small"
          placeholder="Search tasks..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <SearchIcon fontSize="small" sx={{ mr: 1, opacity: 0.5 }} />
            ),
          }}
          sx={{
            width: { xs: 100, sm: 200 },
            "& .MuiOutlinedInput-root": {
              height: 32,
            },
          }}
        />

        <IconButton
          size="small"
          onClick={() => setMode(mode === "light" ? "dark" : "light")}
        >
          {mode === "dark" ? (
            <Brightness7Icon fontSize="small" />
          ) : (
            <Brightness4Icon fontSize="small" />
          )}
        </IconButton>

        {/* Hide Notifications on very small screens if needed, or keep it */}
        <IconButton size="small">
          <Badge color="error" variant="dot">
            <NotificationsNoneIcon fontSize="small" />
          </Badge>
        </IconButton>

        <Divider
          orientation="vertical"
          flexItem
          sx={{
            mx: 1,
            height: 24,
            my: "auto",
            display: { xs: "none", sm: "block" },
          }}
        />

        {/* User Info & Avatar */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: 1 }}>
          {/* User Name/Role hidden on small screens */}
          <Box
            sx={{ textAlign: "right", display: { xs: "none", md: "block" } }}
          >
            <Typography variant="body2" fontWeight={600} lineHeight={1}>
              {user?.name}
            </Typography>
            <Typography
              variant="caption"
              color="primary"
              sx={{ textTransform: "uppercase", fontSize: 9 }}
            >
              {user?.role}
            </Typography>
          </Box>

          <IconButton
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ p: 0 }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: "0.8rem",
                bgcolor: "primary.main",
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2">{user?.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => setAnchorEl(null)}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>{" "}
            Profile Settings
          </MenuItem>
          <MenuItem onClick={onLogout} sx={{ color: "error.main" }}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" color="error" />
            </ListItemIcon>{" "}
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}
