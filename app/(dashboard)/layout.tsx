"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  GlobalStyles,
  Drawer,
  CircularProgress,
  Typography,
} from "@mui/material";

import Sidebar from "@/app/(dashboard)/_component/layout/Sidebar";
import Navbar from "@/app/(dashboard)/_component/layout/Navbar";
import { useAuthStore } from "@/store/useAuthStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initialized = useAuthStore((state) => state.initialized);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const signOut = useAuthStore((state) => state.signOut);

  const [mode, setMode] = useState<"light" | "dark">("light");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!initialized) {
      void checkAuth();
    }
  }, [initialized, checkAuth]);

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.replace("/login");
    }
  }, [initialized, isAuthenticated, router]);

  const handleDrawerToggle = () => {
    setMobileOpen((previous) => !previous);
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/login");
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#0052CC" },
          background: {
            default: mode === "light" ? "#FFFFFF" : "#0f172a",
            paper: mode === "light" ? "#F4F5F7" : "#1d2125",
          },
        },
        shape: { borderRadius: 3 },
      }),
    [mode]
  );

  // Show a loading state instead of a blank page while checking authentication.
  if (!initialized || !isAuthenticated || !user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography color="text.secondary">
            {!initialized
              ? "Checking your session..."
              : "Redirecting to login..."}
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={{ ".MuiDialog-root": { zIndex: 9999 } }} />

      <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        {/* Mobile sidebar */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: 240 },
          }}
        >
          <Sidebar mode={mode} user={user} />
        </Drawer>

        {/* Desktop sidebar */}
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <Sidebar mode={mode} user={user} />
        </Box>

        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <Navbar
            mode={mode}
            setMode={setMode}
            user={user}
            onLogout={handleLogout}
            onMenuClick={handleDrawerToggle}
          />

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
