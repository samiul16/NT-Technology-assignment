"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Stack,
  Paper,
} from "@mui/material";
import { DUMMY_USERS } from "@/data/dummy-users";
import { User } from "@/types/user";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@rayadvertising.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    await new Promise((res) => setTimeout(res, 800));

    const user = DUMMY_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      Cookies.set(
        "user-auth",
        JSON.stringify({
          id: user.id,
          name: user.name,
          role: user.role,
          email: user.email,
        }),
        { expires: 7 }
      );
      router.push("/board");
      router.refresh();
    } else {
      setError("Invalid email or password");
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* LEFT SECTION: BRANDING & ILLUSTRATION (Hidden on mobile) */}
      <Box
        sx={{
          flex: 1.2,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #0052CC 0%, #0747A6 100%)",
          color: "white",
          p: 6,
          position: "relative",
        }}
      >
        <Box sx={{ maxWidth: 450, textAlign: "center", zIndex: 2 }}>
          <Typography variant="h3" fontWeight={800} gutterBottom>
            Ray Advertising
          </Typography>
          <Typography
            variant="h6"
            sx={{ opacity: 0.8, mb: 4, fontWeight: 400 }}
          >
            The ultimate workspace for marketing teams to manage tasks, track
            timelines, and deliver projects faster.
          </Typography>

          {/* DUMMY KANBAN ILLUSTRATION */}
          {/* DUMMY KANBAN ILLUSTRATION */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              bgcolor: "rgba(0,0,0,0.15)", // Darkened container for better contrast
              p: 2.5,
              borderRadius: 4,
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            {[1, 2, 3].map((col) => (
              <Box key={col} sx={{ flex: 1, textAlign: "left" }}>
                {/* Gray Column Title Placeholder */}
                <Box
                  sx={{
                    height: 8,
                    width: 40,
                    bgcolor: "rgba(255,255,255,0.2)",
                    mb: 2,
                    borderRadius: 1,
                  }}
                />

                {/* Gray Task Cards */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    mb: 1.5,
                    bgcolor: "#F4F5F7", // Light "Atlassian" Gray
                    height: 45,
                    borderRadius: 1.5,
                    borderLeft: "4px solid",
                    borderColor:
                      col === 1 ? "#FFAB00" : col === 2 ? "#36B37E" : "#0052CC", // Priority colors
                  }}
                />
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    bgcolor: "#EBECF0", // Slightly darker gray for variety
                    height: 65,
                    borderRadius: 1.5,
                  }}
                />
                <Box
                  sx={{
                    height: 30,
                    mt: 1.5,
                    bgcolor: "rgba(255,255,255,0.05)",
                    borderRadius: 1,
                    border: "1px dashed rgba(255,255,255,0.2)",
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>

        {/* Decorative Background Elements */}
        <Box
          sx={{
            position: "absolute",
            top: -50,
            left: -50,
            width: 200,
            height: 200,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.05)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: 20,
            right: 20,
            width: 150,
            height: 150,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.05)",
          }}
        />
      </Box>

      {/* RIGHT SECTION: LOGIN FORM */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "background.default",
          p: 4,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          <Stack spacing={1} sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              Welcome back
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter your credentials to access your project dashboard.
            </Typography>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Email Address"
                variant="outlined"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                InputProps={{ sx: { borderRadius: 2 } }}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                InputProps={{ sx: { borderRadius: 2 } }}
              />

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Typography
                  variant="caption"
                  color="primary"
                  sx={{ cursor: "pointer", fontWeight: 600 }}
                >
                  Forgot password?
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                type="submit"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(0, 82, 204, 0.2)",
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Sign In"
                )}
              </Button>
            </Stack>
          </form>

          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Don&apos;t have an account?{" "}
              <Typography
                component="span"
                variant="body2"
                color="primary"
                sx={{ cursor: "pointer", fontWeight: 600 }}
              >
                Contact Admin
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
