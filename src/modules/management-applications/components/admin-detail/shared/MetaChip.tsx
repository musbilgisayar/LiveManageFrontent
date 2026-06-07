"use client";

import React from "react";

import {
  alpha,
  Chip,
  keyframes,
  useTheme,
} from "@mui/material";

import type { Theme } from "@mui/material/styles";

type MetaChipProps = {
  label: string;
};

const shimmerAnimation = keyframes`
  0% {
    transform: translateX(-120%);
    opacity: 0;
  }

  15% {
    opacity: 1;
  }

  100% {
    transform: translateX(220%);
    opacity: 0;
  }
`;

export default function MetaChip({
  label,
}: MetaChipProps) {
  const theme = useTheme<Theme>();

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        position: "relative",
        overflow: "hidden",

        height: 30,
        px: 0.5,

        fontWeight: 800,
        fontSize: "0.72rem",
        letterSpacing: 0.25,

        color: theme.palette.primary.main,

        borderRadius: 999,

        border: `1px solid ${alpha(
          theme.palette.primary.main,
          0.22
        )}`,

        background: `
          linear-gradient(
            135deg,
            ${alpha(theme.palette.primary.main, 0.14)},
            ${alpha(theme.palette.background.paper, 0.9)}
          )
        `,

        backdropFilter: "blur(12px)",

        boxShadow: `
          inset 0 1px 0 ${alpha("#fff", 0.14)},
          0 4px 14px ${alpha(
            theme.palette.primary.main,
            0.12
          )}
        `,

        transition: "all 0.25s ease",

        "&:hover": {
          transform: "translateY(-1px) scale(1.02)",

          borderColor: alpha(
            theme.palette.primary.main,
            0.38
          ),

          boxShadow: `
            inset 0 1px 0 ${alpha("#fff", 0.18)},
            0 10px 26px ${alpha(
              theme.palette.primary.main,
              0.18
            )}
          `,
        },

        "&::before": {
          content: '""',

          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,

          width: "42%",

          background: `
            linear-gradient(
              90deg,
              transparent,
              ${alpha("#fff", 0.24)},
              transparent
            )
          `,

          transform: "translateX(-120%)",

          animation: `${shimmerAnimation} 3.8s linear infinite`,
        },

        "& .MuiChip-label": {
          px: 1.2,
          position: "relative",
          zIndex: 1,
        },
      }}
    />
  );
}