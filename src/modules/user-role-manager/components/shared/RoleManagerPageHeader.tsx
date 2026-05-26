"use client";

import type { ReactNode } from "react";

import {
  Box,
  Stack,
  Typography,
  alpha,
} from "@mui/material";

type RoleManagerPageHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
};

export default function RoleManagerPageHeader({
  title,
  subtitle,
  actions,
}: RoleManagerPageHeaderProps) {
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 5,
        px: {
          xs: 2.5,
          md: 4,
        },
        py: {
          xs: 3,
          md: 4,
        },
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: (theme) =>
          `0 24px 60px ${alpha(
            theme.palette.common.black,
            theme.palette.mode === "dark" ? 0.32 : 0.08,
          )}`,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -120,
          right: -120,
          width: 260,
          height: 260,
          borderRadius: "50%",
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, 0.08),
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          bottom: -90,
          left: -90,
          width: 180,
          height: 180,
          borderRadius: "50%",
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, 0.04),
          pointerEvents: "none",
        }}
      />

      <Stack
        spacing={2.5}
        direction={{
          xs: "column",
          lg: "row",
        }}
        alignItems={{
          xs: "flex-start",
          lg: "center",
        }}
        justifyContent="space-between"
        sx={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box maxWidth={900}>
          <Typography
            variant="h3"
            fontWeight={900}
            sx={{
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
            }}
          >
            {title}
          </Typography>

          {subtitle && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mt: 1.5,
                maxWidth: 760,
                lineHeight: 1.7,
                fontSize: {
                  xs: 15,
                  md: 16,
                },
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
                lg: "auto",
              },
            }}
          >
            {actions}
          </Box>
        )}
      </Stack>
    </Box>
  );
}