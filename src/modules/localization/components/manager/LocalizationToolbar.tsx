"use client";

import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  TextField,
  Toolbar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { LocalizationLanguageItem } from "../../types/LocalizationManager.types";

type Props = {
  namespaceQuery: string;
  namespaceOptions: string[];
  onNamespaceChange: (value: string) => void;
  selectedLangs: string[];
  onSelectedLangsChange: (value: string[]) => void;
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
  return (
    <Toolbar
      disableGutters
      sx={{ mb: 2, gap: 2, flexWrap: "wrap", alignItems: "center" }}
    >
      <Autocomplete
        size="small"
        sx={{ minWidth: 260 }}
        options={namespaceOptions}
        value={namespaceQuery || null}
        onChange={(_, value) => onNamespaceChange(value ?? "")}
        isOptionEqualToValue={(option, value) => option === value}
        renderInput={(params) => (
          <TextField
            {...params}
            label={tr("localization:filters.namespace", "Namespace")}
            placeholder={tr(
              "localization:filters.namespacePlaceholder",
              "Namespace seçin"
            )}
          />
        )}
      />

      <Autocomplete
        multiple
        size="small"
        sx={{ minWidth: 320 }}
        options={cultureOptions}
        value={selectedLangs}
        onChange={(_, value) => onSelectedLangsChange(value)}
        isOptionEqualToValue={(option, value) => option === value}
        getOptionLabel={(option) =>
          languages.find((item) => item.cultureCode === option)?.name || option
        }
        renderOption={(props, option) => {
          const language = languages.find((item) => item.cultureCode === option);
          const { key, ...restProps } = props;

          return (
            <li key={key} {...restProps}>
              <span style={{ marginRight: 8 }}>
                {language?.flagEmoji ?? "🏳️"}
              </span>
              {language?.name ?? option}
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={tr(
              "localization:filters.languages",
              "Görüntülenecek Diller"
            )}
          />
        )}
        disableCloseOnSelect
      />

      <Button
        variant="contained"
        startIcon={loading ? <CircularProgress size={16} /> : <SearchIcon />}
        disabled={loading || !namespaceQuery || selectedLangs.length === 0}
        onClick={onRefresh}
      >
        {tr("common:search", "Ara")}
      </Button>

      <Box sx={{ flex: 1 }} />

      <Button variant="outlined" startIcon={<AddIcon />} onClick={onCreateOpen}>
        {tr("localization:actions.newKey", "Yeni Anahtar")}
      </Button>
    </Toolbar>
  );
}