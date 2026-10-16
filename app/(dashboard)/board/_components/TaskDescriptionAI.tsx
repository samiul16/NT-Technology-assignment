"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

interface AISuggestion {
  description: string;
  checklist: string[];
  acceptanceCriteria: string[];
}

interface TaskDescriptionAIProps {
  title: string;
  onAccept: (description: string) => void;
}

export default function TaskDescriptionAI({
  title,
  onAccept,
}: TaskDescriptionAIProps) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState("");

  const generateDescription = async () => {
    if (!title.trim()) {
      setError("Enter a task title before generating a description.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ title: title.trim() }),
      });

      const result = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || "Failed to generate AI suggestions.");
      }

      setSuggestion(result.data as AISuggestion);
      setDialogOpen(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to generate suggestions."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (!suggestion) return;

    const formattedDescription = [
      suggestion.description,
      "",
      "Action Checklist:",
      ...suggestion.checklist.map((item) => `- ${item}`),
      "",
      "Acceptance Criteria:",
      ...suggestion.acceptanceCriteria.map((item) => `- ${item}`),
    ].join("\n");

    onAccept(formattedDescription);
    setDialogOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Description
        </Typography>

        <Button
          size="small"
          variant="outlined"
          startIcon={
            loading ? (
              <CircularProgress size={15} />
            ) : (
              <AutoAwesomeIcon fontSize="small" />
            )
          }
          onClick={generateDescription}
          disabled={loading}
          sx={{ textTransform: "none" }}
        >
          {loading ? "Generating..." : "Generate with AI"}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AutoAwesomeIcon color="primary" />
          Review AI Suggestions
        </DialogTitle>

        <DialogContent dividers>
          {suggestion && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Alert severity="info" icon={<AutoAwesomeIcon />}>
                Review these suggestions before adding them to your task.
                Nothing will change until you accept.
              </Alert>

              <Box>
                <Typography fontWeight={700} gutterBottom>
                  Suggested Description
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {suggestion.description}
                </Typography>
              </Box>

              <Box>
                <Typography fontWeight={700} gutterBottom>
                  Action Checklist
                </Typography>
                <List dense disablePadding>
                  {suggestion.checklist.map((item, index) => (
                    <ListItem key={index} disableGutters>
                      <CheckCircleOutlineIcon
                        fontSize="small"
                        color="action"
                        sx={{ mr: 1, flexShrink: 0 }}
                      />
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Box>
                <Typography fontWeight={700} gutterBottom>
                  Acceptance Criteria
                </Typography>
                <List dense disablePadding>
                  {suggestion.acceptanceCriteria.map((item, index) => (
                    <ListItem key={index} disableGutters>
                      <ListItemText primary={`• ${item}`} sx={{ my: 0 }} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button color="inherit" onClick={() => setDialogOpen(false)}>
            Reject
          </Button>

          <Button
            variant="contained"
            startIcon={<CheckCircleOutlineIcon />}
            onClick={handleAccept}
            disabled={!suggestion}
          >
            Accept Suggestions
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
