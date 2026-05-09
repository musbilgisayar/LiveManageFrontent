"use client";

import React from "react";
import { alpha, Box, Stack, Typography, useTheme } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { IconCheck } from "@tabler/icons-react";

type SelectionCardProps = {
  selected: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
};

export default function SelectionCard({
  selected,
  title,
  description,
  icon,
  onClick,
}: SelectionCardProps) {
  const theme = useTheme<Theme>();

  return (
    <Box
      onClick={onClick}
      role="button"
      tabIndex={0}
      sx={{
        position: "relative",
        p: 2,
        minHeight: 128,
        borderRadius: 4,
        border: `1px solid ${
          selected
            ? alpha(theme.palette.primary.main, 0.42)
            : alpha(theme.palette.divider, 0.76)
        }`,
        bgcolor: selected
          ? alpha(theme.palette.primary.main, 0.055)
          : alpha(theme.palette.background.default, 0.28),
        cursor: "pointer",
        transition: "all 160ms ease",
        "&:hover": {
          transform: "translateY(-1px)",
          borderColor: alpha(theme.palette.primary.main, 0.34),
          bgcolor: alpha(theme.palette.primary.main, 0.045),
        },
      }}
    >
      {selected && (
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 28,
            height: 28,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            bgcolor: "primary.main",
            color: "primary.contrastText",
          }}
        >
          <IconCheck size={16} stroke={2.8} />
        </Box>
      )}

      <Stack spacing={1.25}>
        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: 3.25,
            display: "grid",
            placeItems: "center",
            bgcolor: selected
              ? alpha(theme.palette.primary.main, 0.1)
              : alpha(theme.palette.grey[500], 0.08),
            color: selected ? "primary.main" : "text.primary",
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography fontWeight={900} fontSize={15.5}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.35}>
            {description}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}