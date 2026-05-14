// components/manager/LocalizationToolbar.tsx
"use client";

import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Autocomplete,
  Chip,
  IconButton,
  Tooltip,
  InputAdornment,
  Paper,
  alpha,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { LocalizationLanguageItem } from "../../types/LocalizationManager.types";

type Props = {
  namespaceQuery: string;
  namespaceOptions: string[];
  onNamespaceChange: (value: string) => void;
  selectedLangs: string[];
  onSelectedLangsChange: (langs: string[]) => void;
  cultureOptions: string[];
  languages: LocalizationLanguageItem[];
  loading: boolean;
  onRefresh: () => void;
  onCreateOpen: () => void;
  tr: (key: string, fallback: string) => string;
};

export default function LocalizationToolbar({
  namespaceQuery,
  namespaceOptions,
  onNamespaceChange,
  selectedLangs,
  onSelectedLangsChange,
  cultureOptions,
  languages,
  loading,
  onRefresh,
  onCreateOpen,
  tr,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        p: { xs: 2, md: 2.5 },
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        bgcolor: "background.paper",
        boxShadow: `0 14px 34px ${alpha(theme.palette.common.black, 0.05)}`,
      })}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={tr("localization:search.placeholder", "Anahtar ara...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
          <Autocomplete
            fullWidth
            size="small"
            options={namespaceOptions}
            value={namespaceQuery || null}
            onChange={(_, newValue) => onNamespaceChange(newValue || "")}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={tr("localization:filter.namespace", "Namespace")}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Autocomplete
            multiple
            fullWidth
            size="small"
            options={cultureOptions}
            value={selectedLangs}
            onChange={(_, newValue) => onSelectedLangsChange(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={tr("localization:filter.languages", "Diller")}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...tagProps } = getTagProps({ index });

                return (
                  <Chip
                    key={key}
                    label={
                      languages.find((l) => l.cultureCode === option)?.name ||
                      option
                    }
                    size="small"
                    {...tagProps}
                  />
                );
              })
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2.5 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "flex-start", md: "flex-end" },
              gap: 1,
            }}
          >
            <Tooltip title={tr("common:refresh", "Yenile")}>
              <span>
                <IconButton onClick={onRefresh} disabled={loading} size="small">
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onCreateOpen}
              size="small"
              sx={{
                minWidth: 132,
                textTransform: "none",
                borderRadius: 2,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                },
              }}
            >
              {tr("localization:actions.create", "Yeni Anahtar")}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}