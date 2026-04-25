// 📁 src/modules/roles/components/RoleToolbar.tsx
"use client";

import React from "react";
import { Box, TextField, Button, Stack } from "@mui/material";
import { Plus } from "lucide-react";

type Props = {
  addLabel: string;
  searchPlaceholder?: string;
  onAdd?: () => void;
  onSearch?: (query: string) => void;
};

/**
 * 🔎 RoleToolbar
 * - Arama alanı + Yeni Rol butonu
 * - Kurumsal tema renkleriyle uyumlu
 */
export function RoleToolbar({ addLabel, searchPlaceholder, onAdd, onSearch }: Props) {
  const [query, setQuery] = React.useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onSearch?.(val);
  };

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <TextField
        size="small"
        variant="outlined"
        placeholder={searchPlaceholder}
        value={query}
        onChange={handleSearch}
        sx={{
          flex: 1,
          maxWidth: 300,
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
          },
        }}
      />

      <Button
        variant="contained"
        color="primary"
        startIcon={<Plus size={18} />}
        onClick={onAdd}
        sx={{
          textTransform: "none",
          borderRadius: 2,
          fontWeight: 600,
          px: 2.5,
        }}
      >
        {addLabel}
      </Button>
    </Stack>
  );
}
