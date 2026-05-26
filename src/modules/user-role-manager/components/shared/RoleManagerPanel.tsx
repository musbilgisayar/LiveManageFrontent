"use client";

import type { PropsWithChildren, ReactNode } from "react";

import {
  Box,
  Paper,
  Stack,
  Typography,
  alpha,
} from "@mui/material";

type RoleManagerPanelProps = PropsWithChildren<{
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
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        bgcolor: "background.paper",
        boxShadow: (theme) =>
          `0 18px 50px ${alpha(
            theme.palette.common.black,
            theme.palette.mode === "dark" ? 0.28 : 0.06,
          )}`,
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
            px: {
              xs: 2,
              md: 3,
            },
            py: 2.35,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: (theme) =>
              alpha(theme.palette.primary.main, 0.025),
          }}
        >
          <Box minWidth={0}>
            {title && (
              <Typography
                variant="h6"
                fontWeight={900}
                sx={{
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}
              >
                {title}
              </Typography>
            )}

            {subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.6,
                  maxWidth: 720,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          {actions && (
            <Box
              sx={{
                flexShrink: 0,
                width: {
                  xs: "100%",
                  md: "auto",
                },
              }}
            >
              {actions}
            </Box>
          )}
        </Stack>
      )}

      <Box
        sx={{
          p: {
            xs: Math.max(contentPadding - 1, 2),
            md: contentPadding,
          },
        }}
      >
        {children}
      </Box>
    </Paper>
  );
}