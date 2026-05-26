//src/modules/users/components/detail/cards/PasswordCardLayout.tsx
"use client";

import { ReactNode } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import BlankCard from "@/app/components/shared/BlankCard";

type Props = {
  title: string;
  description: string;
  error?: string | null;
  successMessage?: string | null;
  warningMessage?: string | null;
  validationError?: string | null;
  saving?: boolean;
  submitDisabled?: boolean;
  submitText: string;
  onSubmit: () => void | Promise<void>;
  children: ReactNode;
};

export default function PasswordCardLayout({
  title,
  description,
  error,
  successMessage,
  warningMessage,
  validationError,
  saving = false,
  submitDisabled = false,
  submitText,
  onSubmit,
  children,
}: Props) {
  return (
    <BlankCard>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {title}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {description}
                </Typography>
              </Box>

              {warningMessage && <Alert severity="warning">{warningMessage}</Alert>}
              {error && <Alert severity="error">{error}</Alert>}
              {successMessage && <Alert severity="success">{successMessage}</Alert>}

              {children}

              {validationError && !error && (
                <Typography variant="body2" color="error">
                  {validationError}
                </Typography>
              )}

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button variant="contained" onClick={onSubmit} disabled={submitDisabled}>
                  {saving ? <CircularProgress size={18} color="inherit" /> : submitText}
                </Button>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </BlankCard>
  );
}
