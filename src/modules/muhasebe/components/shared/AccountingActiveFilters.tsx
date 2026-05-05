// src/modules/muhasebe/components/shared/AccountingActiveFilters.tsx
"use client";

import React from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";

export interface AccountingActiveFilterItem {
  key: string;
  label: string;
  value: string;
  onDelete: () => void;
}

interface AccountingActiveFiltersProps {
  items: AccountingActiveFilterItem[];
}

export default function AccountingActiveFilters({
  items,
}: AccountingActiveFiltersProps) {
  if (items.length === 0) return null;

  return (
    <Box sx={{ mt: 1.5 }}>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
        <Typography fontSize={11} fontWeight={700} color="text.secondary">
          Aktif filtreler:
        </Typography>

        {items.map((item) => (
          <Chip
            key={item.key}
            size="small"
            label={`${item.label}: ${item.value}`}
            onDelete={item.onDelete}
            sx={{
              height: 26,
              borderRadius: 2,
              fontSize: 11,
              fontWeight: 600,
              bgcolor: "background.paper",
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
            variant="outlined"
          />
        ))}
      </Stack>
    </Box>
  );
}