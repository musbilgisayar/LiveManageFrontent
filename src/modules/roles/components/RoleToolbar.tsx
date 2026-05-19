"use client";

import { useState } from "react";

import {
  alpha,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  useTheme,
} from "@mui/material";

import {
  IconPlus,
  IconRefresh,
  IconSearch,
} from "@tabler/icons-react";

type Props = {
  addLabel: string;
  searchPlaceholder?: string;
  refreshLabel?: string;
  onAdd?: () => void;
  onSearch?: (query: string) => void;
  onRefresh?: () => void;
};

export function RoleToolbar({
  addLabel,
  searchPlaceholder,
  refreshLabel = "Yenile",
  onAdd,
  onSearch,
  onRefresh,
}: Props) {
  const theme = useTheme();

  const [query, setQuery] = useState("");

  const handleSearch = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;

    setQuery(value);
    onSearch?.(value);
  };

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.5}
      alignItems={{ xs: "stretch", sm: "center" }}
      justifyContent="flex-end"
      sx={{ width: "100%" }}
    >
      <TextField
        size="small"
        variant="outlined"
        placeholder={searchPlaceholder}
        value={query}
        onChange={handleSearch}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconSearch size={18} />
            </InputAdornment>
          ),
        }}
        sx={{
          minWidth: { xs: "100%", sm: 260 },
          "& .MuiOutlinedInput-root": {
            borderRadius: 3,
            backgroundColor: alpha(
              theme.palette.background.paper,
              0.85,
            ),
          },
        }}
      />

      {onRefresh ? (
        <Tooltip title={refreshLabel}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<IconRefresh size={18} />}
            onClick={onRefresh}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {refreshLabel}
          </Button>
        </Tooltip>
      ) : null}

      <Button
        variant="contained"
        color="primary"
        startIcon={<IconPlus size={18} />}
        onClick={onAdd}
        sx={{
          borderRadius: 3,
          textTransform: "none",
          fontWeight: 800,
          px: 2.5,
          whiteSpace: "nowrap",
          boxShadow: `0 12px 24px ${alpha(
            theme.palette.primary.main,
            0.24,
          )}`,
        }}
      >
        {addLabel}
      </Button>
    </Stack>
  );
}