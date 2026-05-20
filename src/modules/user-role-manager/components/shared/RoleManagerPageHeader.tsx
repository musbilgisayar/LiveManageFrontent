"use client";

import type { ReactNode } from "react";

import {
  Box,
  Stack,
  Typography,
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
    <Stack
      spacing={2}
      direction={{
        xs: "column",
        md: "row",
      }}
      alignItems={{
        xs: "flex-start",
        md: "center",
      }}
      justifyContent="space-between"
    >
      <Box>
        <Typography
          variant="h4"
          fontWeight={800}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 1 }}
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
  );
}