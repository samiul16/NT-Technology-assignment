"use client";
import {
  Box,
  CircularProgress,
  Typography,
  LinearProgress,
} from "@mui/material";

export default function Loading() {
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f4f5f7",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
      }}
    >
      <Box sx={{ position: "relative", mb: 4 }}>
        {/* Modern Jira-style Pulse Logo */}
        <Box
          sx={{
            width: 60,
            height: 60,
            bgcolor: "primary.main",
            borderRadius: 1.5,
            animation: "pulse 1.5s infinite ease-in-out",
            display: "flex",
            alignItems: "center",
            justifyItems: "center",
            boxShadow: "0 0 20px rgba(0, 82, 204, 0.3)",
          }}
        />
        <style jsx global>{`
          @keyframes pulse {
            0% {
              transform: scale(0.95);
              opacity: 0.8;
            }
            50% {
              transform: scale(1.05);
              opacity: 1;
            }
            100% {
              transform: scale(0.95);
              opacity: 0.8;
            }
          }
        `}</style>
      </Box>

      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ mb: 1, color: "#172b4d" }}
      >
        Loading your workspace...
      </Typography>

      <Box sx={{ width: 200 }}>
        <LinearProgress />
      </Box>
    </Box>
  );
}
