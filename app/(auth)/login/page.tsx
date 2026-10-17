"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAuthStore } from "@/store/useAuthStore";

type Mode = "signin" | "signup";
type FieldErrors = Partial<
  Record<"name" | "email" | "password" | "confirmPassword", string>
>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const signIn = useAuthStore((state) => state.signIn);
  const signUp = useAuthStore((state) => state.signUp);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("nt-tech@example.com");
  const [password, setPassword] = useState("12345678");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "error"
  );

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setErrors({});
    setMessage("");
    setPassword("");
    setConfirmPassword("");
  };

  const validate = (): boolean => {
    const nextErrors: FieldErrors = {};
    const normalizedEmail = email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (mode === "signup") {
      const trimmedName = name.trim();

      if (!trimmedName) {
        nextErrors.name = "Name is required.";
      } else if (trimmedName.length < 2 || trimmedName.length > 120) {
        nextErrors.name = "Name must be between 2 and 120 characters.";
      }
    }

    if (!normalizedEmail) {
      nextErrors.email = "Email is required.";
    } else if (
      normalizedEmail.length > 255 ||
      !emailPattern.test(normalizedEmail)
    ) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (mode === "signup" && password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    } else if (
      mode === "signup" &&
      new TextEncoder().encode(password).length > 72
    ) {
      nextErrors.password = "Password must not exceed 72 UTF-8 bytes.";
    }

    if (mode === "signup" && password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (!validate()) return;

    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        await signUp(name.trim(), email, password);
      }

      setMessage(
        mode === "signin"
          ? "Signed in successfully. Redirecting..."
          : "Account created successfully. Redirecting..."
      );
      setMessageType("success");

      const next = searchParams.get("next");
      const destination =
        next?.startsWith("/") &&
        !next.startsWith("//") &&
        !next.startsWith("/\\")
          ? next
          : "/board";

      router.replace(destination);
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to complete your request. Please try again."
      );
      setMessageType("error");
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Branding panel */}
      <Box
        sx={{
          flex: 1.2,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
          p: 6,
          color: "white",
          background: "linear-gradient(135deg, #0052CC 0%, #0747A6 100%)",
        }}
      >
        <Box sx={{ maxWidth: 460, zIndex: 1 }}>
          <Typography variant="h3" fontWeight={800} gutterBottom>
            NT Technology
          </Typography>

          <Typography variant="h6" sx={{ opacity: 0.85, mb: 4 }}>
            Your workspace to manage tasks, track timelines, and deliver
            projects faster.
          </Typography>

          <Paper
            elevation={0}
            sx={{
              display: "flex",
              gap: 2,
              p: 2.5,
              borderRadius: 3,
              bgcolor: "rgba(0,0,0,0.15)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            {[
              { title: "To do", color: "#FFAB00" },
              { title: "In progress", color: "#0052CC" },
              { title: "Done", color: "#36B37E" },
            ].map((column) => (
              <Box key={column.title} sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="caption"
                  sx={{ color: "white", fontWeight: 700 }}
                >
                  {column.title}
                </Typography>
                {[1, 2].map((item) => (
                  <Box
                    key={item}
                    sx={{
                      mt: 1.5,
                      height: item === 1 ? 65 : 45,
                      bgcolor: "#F4F5F7",
                      borderRadius: 1.5,
                      borderLeft: `4px solid ${column.color}`,
                    }}
                  />
                ))}
              </Box>
            ))}
          </Paper>
        </Box>

        <Box
          sx={{
            position: "absolute",
            width: 240,
            height: 240,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.05)",
            top: -80,
            left: -80,
          }}
        />
      </Box>

      {/* Authentication panel */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "background.default",
          p: { xs: 2.5, sm: 4 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          <Stack spacing={1} sx={{ mb: 3 }}>
            <Typography variant="h4" fontWeight={700}>
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </Typography>
            <Typography color="text.secondary">
              {mode === "signin"
                ? "Sign in to access your project dashboard."
                : "Enter your details to get started."}
            </Typography>
          </Stack>

          <Box
            sx={{
              display: "flex",
              p: 0.5,
              mb: 3,
              bgcolor: "action.hover",
              borderRadius: 2,
              gap: 0.5,
            }}
          >
            <Button
              fullWidth
              variant={mode === "signin" ? "contained" : "text"}
              onClick={() => switchMode("signin")}
              disabled={isLoading}
              sx={{ textTransform: "none", borderRadius: 1.5 }}
            >
              Sign In
            </Button>
            <Button
              fullWidth
              variant={mode === "signup" ? "contained" : "text"}
              onClick={() => switchMode("signup")}
              disabled={isLoading}
              sx={{ textTransform: "none", borderRadius: 1.5 }}
            >
              Sign Up
            </Button>
          </Box>

          {message && (
            <Alert severity={messageType} sx={{ mb: 2, borderRadius: 2 }}>
              {message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.2}>
              {mode === "signup" && (
                <TextField
                  fullWidth
                  label="Full Name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  error={Boolean(errors.name)}
                  helperText={errors.name || " "}
                  autoComplete="name"
                  disabled={isLoading}
                  inputProps={{ maxLength: 120 }}
                />
              )}

              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                error={Boolean(errors.email)}
                helperText={errors.email || " "}
                autoComplete="email"
                disabled={isLoading}
                inputProps={{ maxLength: 255 }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                error={Boolean(errors.password)}
                helperText={
                  errors.password ||
                  (mode === "signup" ? "At least 8 characters." : " ")
                }
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                disabled={isLoading}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          onClick={() => setShowPassword((value) => !value)}
                          edge="end"
                          disabled={isLoading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {mode === "signup" && (
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  error={Boolean(errors.confirmPassword)}
                  helperText={errors.confirmPassword || " "}
                  autoComplete="new-password"
                  disabled={isLoading}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={
                              showConfirmPassword
                                ? "Hide confirm password"
                                : "Show confirm password"
                            }
                            onClick={() =>
                              setShowConfirmPassword((value) => !value)
                            }
                            edge="end"
                            disabled={isLoading}
                          >
                            {showConfirmPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              )}

              <Button
                fullWidth
                variant="contained"
                type="submit"
                size="large"
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : mode === "signin" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>
            </Stack>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ mt: 3 }}
          >
            {mode === "signin"
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <Box
              component="button"
              type="button"
              onClick={() =>
                switchMode(mode === "signin" ? "signup" : "signin")
              }
              disabled={isLoading}
              sx={{
                border: 0,
                p: 0,
                bgcolor: "transparent",
                color: "primary.main",
                font: "inherit",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </Box>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
