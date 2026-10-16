"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

interface DuplicateMatch {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  confidence: "high" | "medium";
  reason: string;
}

interface TaskDuplicateCheckerProps {
  title: string;
  description: string;
  onContinue: () => Promise<void> | void;
  disabled?: boolean;
}

export default function TaskDuplicateChecker({
  title,
  description,
  onContinue,
  disabled = false,
}: TaskDuplicateCheckerProps) {
  const [checking, setChecking] = useState(false);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [matches, setMatches] = useState<DuplicateMatch[]>([]);
  const [error, setError] = useState("");

  const continueCreating = async () => {
    setCreating(true);
    setError("");

    try {
      await onContinue();
      setDialogOpen(false);
    } catch {
      // The parent save handler should display its own error.
    } finally {
      setCreating(false);
    }
  };

  const checkAndCreate = async () => {
    if (!title.trim()) {
      setError("Enter a task title before creating the task.");
      return;
    }

    setChecking(true);
    setError("");

    try {
      const response = await fetch("/api/ai/detect-duplicates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || "Unable to check for duplicates.");
      }

      const foundMatches: DuplicateMatch[] = result.data.matches ?? [];

      setMatches(foundMatches);

      if (foundMatches.length > 0) {
        setDialogOpen(true);
      } else {
        await continueCreating();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to check for duplicates."
      );
    } finally {
      setChecking(false);
    }
  };

  return (
    <>
      {error && (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Button
        type="button"
        variant="contained"
        fullWidth
        onClick={checkAndCreate}
        disabled={disabled || checking || creating || !title.trim()}
        startIcon={
          checking || creating ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            <AutoAwesomeIcon />
          )
        }
      >
        {checking
          ? "Checking for duplicates by AI..."
          : creating
          ? "Creating task..."
          : "Check by AI & Create"}
      </Button>

      <Dialog
        open={dialogOpen}
        onClose={() => {
          if (!creating) setDialogOpen(false);
        }}
        fullWidth
        maxWidth="sm"
        aria-labelledby="duplicate-task-title"
      >
        <DialogTitle
          id="duplicate-task-title"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <WarningAmberOutlinedIcon color="warning" />
          Possible Duplicate Tasks
        </DialogTitle>

        <DialogContent dividers>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Some existing tasks may overlap with this task. Review them before
            deciding whether to continue.
          </Alert>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {matches.map((match) => (
              <Box
                key={match.id}
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <Typography fontWeight={700} sx={{ flex: 1 }}>
                    {match.title}
                  </Typography>

                  <Chip
                    size="small"
                    label={
                      match.confidence === "high"
                        ? "High match"
                        : "Possible match"
                    }
                    color={match.confidence === "high" ? "error" : "warning"}
                  />
                </Box>

                {match.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ whiteSpace: "pre-wrap", mb: 1 }}
                  >
                    {match.description}
                  </Typography>
                )}

                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Why it matched:</strong> {match.reason}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Status: {match.status} · Priority: {match.priority}
                </Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          <Button
            color="inherit"
            onClick={() => setDialogOpen(false)}
            disabled={creating}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={continueCreating}
            disabled={creating}
            startIcon={
              creating ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <CheckCircleOutlineIcon />
              )
            }
          >
            {creating ? "Creating..." : "Create Anyway"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
