"use client";

import React from "react";
import { Box, Stack, Typography } from "@mui/material";

interface AccountingPageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export default function AccountingPageHeader({
  title,
  description,
  actions,
}: AccountingPageHeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h4" fontWeight={900}>
          {title}
        </Typography>

        {description && (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            {description}
          </Typography>
        )}
      </Box>

      {actions && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="flex-end"
          sx={{
            flexShrink: 0,
            "& .MuiButton-root": {
              whiteSpace: "nowrap",
            },
          }}
        >
          {actions}
        </Stack>
      )}
    </Box>
  );
}