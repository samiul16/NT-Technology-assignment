/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  GlobalStyles,
  Drawer,
} from "@mui/material";
import Sidebar from "@/app/(dashboard)/_component/layout/Sidebar";
import Navbar from "@/app/(dashboard)/_component/layout/Navbar";
import { User } from "@/types/user";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false); // Mobile state

  useEffect(() => {
    setMounted(true);
    const session = Cookies.get("user-auth");
    if (!session) {
      router.push("/login");
    } else {
      setUser(JSON.parse(session));
    }
  }, [router]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    Cookies.remove("user-auth");
    router.push("/login");
    router.refresh();
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

  if (!mounted || !user) return null;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={{ ".MuiDialog-root": { zIndex: 9999 } }} />

      <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        {/* MOBILE SIDEBAR (Drawer) */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }} // Better open performance on mobile
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: 240 },
          }}
        >
          <Sidebar mode={mode} user={user} />
        </Drawer>

        {/* DESKTOP SIDEBAR */}
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
            onMenuClick={handleDrawerToggle} // Pass toggle to Navbar
          />

          <Box
            sx={{
              flex: 1,
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
