"use client";

import type { PropsWithChildren, ReactNode }
  from "react";

import {
  Box,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

type RoleManagerPanelProps =
  PropsWithChildren<{
    title?: ReactNode;

    subtitle?: ReactNode;

    actions?: ReactNode;

    contentPadding?: number;
  }>;

export default function RoleManagerPanel({
  title,
  subtitle,
  actions,
  children,
  contentPadding = 3,
}: RoleManagerPanelProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: (theme) =>
          `1px solid ${theme.palette.divider}`,
        overflow: "hidden",
      }}
    >
      {(title || subtitle || actions) && (
        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          spacing={2}
          alignItems={{
            xs: "flex-start",
            md: "center",
          }}
          justifyContent="space-between"
          sx={{
            px: 3,
            py: 2.5,
            borderBottom: (theme) =>
              `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box>
            {title && (
              <Typography
                variant="h6"
                fontWeight={700}
              >
                {title}
              </Typography>
            )}

            {subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          {actions && (
            <Box>
              {actions}
            </Box>
          )}
        </Stack>
      )}

      <Box
        sx={{
          p: contentPadding,
        }}
      >
        {children}
      </Box>
    </Paper>
  );
}