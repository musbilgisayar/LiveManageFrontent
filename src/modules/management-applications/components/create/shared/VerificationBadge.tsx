"use client";

import React from "react";
import { alpha, Box, Stack, Typography, useTheme } from "@mui/material";
import type { Theme } from "@mui/material/styles";

type VerificationBadgeProps = {
  ok: boolean;
  icon: React.ReactNode;
  label: string;
  hint: string;
};

export default function VerificationBadge({
  ok,
  icon,
  label,
  hint,
}: VerificationBadgeProps) {
  const theme = useTheme<Theme>();
  const isSuccess = ok;

  // Premium renk paleti
  const colors = {
    success: {
      main: theme.palette.success.main,
      light: alpha(theme.palette.success.main, 0.12),
      border: alpha(theme.palette.success.main, 0.2),
      text: theme.palette.success.dark,
    },
    warning: {
      main: theme.palette.warning.main,
      light: alpha(theme.palette.warning.main, 0.12),
      border: alpha(theme.palette.warning.main, 0.2),
      text: theme.palette.warning.dark,
    },
  };

  const currentColor = isSuccess ? colors.success : colors.warning;

  return (
    <Box
      sx={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
        borderRadius: 2.5,
        transition: "all 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1)",
        cursor: "default",

        // Gradient background
        background: `linear-gradient(135deg, ${currentColor.light} 0%, ${alpha(
          currentColor.light,
          0.3
        )} 100%)`,

        // Border with glow effect
        border: `1px solid ${currentColor.border}`,
        boxShadow: `0 2px 8px ${alpha(currentColor.main, 0.08)}`,

        // Hover efekti
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `0 8px 20px ${alpha(currentColor.main, 0.12)}`,
          borderColor: alpha(currentColor.main, 0.3),
        },

        // Shimmer efekti sadece success durumunda
        ...(isSuccess && {
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: -50,
            width: "100%",
            height: "100%",
            background: `linear-gradient(90deg, transparent, ${alpha(
              currentColor.main,
              0.08
            )}, transparent)`,
            transform: "skewX(-25deg)",
            animation: "shimmer 3s infinite",
          },
        }),

        // Keyframe animations
        "@keyframes shimmer": {
          "0%": { transform: "translateX(-100%) skewX(-25deg)" },
          "100%": { transform: "translateX(200%) skewX(-25deg)" },
        },

        "@keyframes pulse": {
          "0%": {
            opacity: 0.6,
            transform: "scale(0.8)",
          },
          "70%": {
            opacity: 0,
            transform: "scale(1.5)",
          },
          "100%": {
            opacity: 0,
            transform: "scale(1.5)",
          },
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{
          px: 1.75,
          py: 1.25,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Icon with pulse animation for success */}
        <Box
          sx={{
            display: "inline-flex",
            color: currentColor.main,
            position: "relative",

            // Pulse animation for success state
            ...(isSuccess && {
              "&::after": {
                content: '""',
                position: "absolute",
                top: -4,
                left: -4,
                right: -4,
                bottom: -4,
                borderRadius: "50%",
                border: `2px solid ${currentColor.main}`,
                opacity: 0,
                animation: "pulse 2s ease-out infinite",
              },
            }),
          }}
        >
          <Box
            sx={{
              transform: "scale(1)",
              transition: "transform 0.2s ease",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          >
            {icon}
          </Box>
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="body2"
            fontWeight={800}
            sx={{
              color: currentColor.text,
              letterSpacing: "-0.01em",
              lineHeight: 1.4,
              mb: 0.25,
            }}
          >
            {label}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              color: alpha(theme.palette.text.primary, 0.6),
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              fontSize: "0.7rem",
            }}
          >
            {/* Status dot */}
            <Box
              component="span"
              sx={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                bgcolor: currentColor.main,
                display: "inline-block",
                animation: isSuccess ? "pulse 1.5s ease-out infinite" : "none",
              }}
            />
            {hint}
          </Typography>
        </Box>

        {/* Status badge corner */}
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 6,
            height: 6,
            borderRadius: "50%",
            bgcolor: currentColor.main,
            boxShadow: `0 0 0 2px ${alpha(currentColor.main, 0.2)}`,
            opacity: 0.6,
          }}
        />
      </Stack>
    </Box>
  );
}
