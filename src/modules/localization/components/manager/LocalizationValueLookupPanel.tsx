"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  alpha,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  ContentCopy as CopyIcon,
  FindInPage as FindInPageIcon,
  OpenInNew as OpenInNewIcon,
  Search as SearchIcon,
  TravelExplore as TravelExploreIcon,
} from "@mui/icons-material";
import {
  LocalizationLanguageItem,
  LocalizationValueLookupResult,
} from "../../types/LocalizationManager.types";

type Props = {
  locale: string;
  query: string;
  onQueryChange: (value: string) => void;
  results: LocalizationValueLookupResult[];
  loading: boolean;
  selectedLangs: string[];
  namespaceQuery: string;
  languages: LocalizationLanguageItem[];
  onSearch: () => void;
  onClear: () => void;
  tr: (key: string, fallback: string) => string;
};

export default function LocalizationValueLookupPanel({
  locale,
  query,
  onQueryChange,
  results,
  loading,
  selectedLangs,
  namespaceQuery,
  languages,
  onSearch,
  onClear,
  tr,
}: Props) {
  const theme = useTheme();
  const router = useRouter();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const selectedLanguageNames = useMemo(
    () =>
      selectedLangs.map(
        (code) =>
          languages.find((item) => item.cultureCode === code)?.name ?? code
      ),
    [languages, selectedLangs]
  );

  const copyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      setCopiedKey(null);
    }
  };

  const openDetail = (result: LocalizationValueLookupResult) => {
    router.push(
      `/${locale}/localization/detail?key=${encodeURIComponent(
        result.fullKey
      )}&ns=${encodeURIComponent(result.namespace || namespaceQuery || "common")}`
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        mx: { xs: 1, sm: 2 },
        mt: 2,
        p: { xs: 2, md: 2.5 },
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: alpha(theme.palette.info.main, 0.035),
      }}
    >
      <Stack spacing={2.25}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: alpha(theme.palette.info.main, 0.12),
                  color: "info.main",
                  flexShrink: 0,
                }}
              >
                <TravelExploreIcon fontSize="small" />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight={900}>
                  {tr(
                    "localization:valueLookup.title",
                    "Açıklamaya Göre Key Bul"
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {tr(
                    "localization:valueLookup.subtitle",
                    "Seçili dillerde metin değerinden namespace ve key arayın."
                  )}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
            justifyContent={{ xs: "flex-start", md: "flex-end" }}
          >
            {namespaceQuery && (
              <Chip
                size="small"
                label={`${tr(
                  "localization:valueLookup.scopeNamespace",
                  "Namespace"
                )}: ${namespaceQuery}`}
                sx={{ fontWeight: 700 }}
              />
            )}
            {selectedLanguageNames.slice(0, 3).map((name) => (
              <Chip key={name} size="small" variant="outlined" label={name} />
            ))}
            {selectedLanguageNames.length > 3 && (
              <Chip
                size="small"
                variant="outlined"
                label={`+${selectedLanguageNames.length - 3}`}
              />
            )}
          </Stack>
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
          <TextField
            fullWidth
            multiline
            minRows={1}
            maxRows={4}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
                onSearch();
              }
            }}
            placeholder={tr(
              "localization:valueLookup.placeholder",
              "Örnek: Kullanıcı listesi yüklenemedi."
            )}
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

          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
            <Button
              variant="contained"
              onClick={onSearch}
              disabled={loading || !query.trim() || selectedLangs.length === 0}
              startIcon={
                loading ? <CircularProgress size={16} /> : <FindInPageIcon />
              }
              sx={{ minWidth: 132, textTransform: "none", borderRadius: 2 }}
            >
              {tr("localization:valueLookup.actions.search", "Key Bul")}
            </Button>

            <Button
              variant="outlined"
              onClick={onClear}
              disabled={loading || (!query && results.length === 0)}
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              {tr("common:clear", "Temizle")}
            </Button>
          </Stack>
        </Stack>

        {results.length > 0 && (
          <Stack spacing={1.25}>
            <Divider />
            <Typography variant="caption" color="text.secondary" fontWeight={800}>
              {tr("localization:valueLookup.results", "Bulunan Keyler")} (
              {results.length})
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  lg: "repeat(2, minmax(0, 1fr))",
                },
                gap: 1.25,
              }}
            >
              {results.map((result) => (
                <Box
                  key={result.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    minWidth: 0,
                  }}
                >
                  <Stack spacing={1.25}>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="flex-start"
                      justifyContent="space-between"
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          alignItems="center"
                          sx={{ mb: 0.5 }}
                        >
                          {result.namespace && (
                            <Chip
                              size="small"
                              label={result.namespace}
                              sx={{
                                height: 22,
                                fontSize: "0.68rem",
                                fontWeight: 800,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: "primary.main",
                              }}
                            />
                          )}
                          <Chip
                            size="small"
                            variant="outlined"
                            label={result.cultureCode || "-"}
                            sx={{ height: 22, fontSize: "0.68rem" }}
                          />
                        </Stack>

                        <Typography
                          variant="body2"
                          title={result.fullKey}
                          sx={{
                            fontFamily:
                              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                            fontWeight: 800,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {result.fullKey}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={0.5} flexShrink={0}>
                        <Tooltip
                          title={
                            copiedKey === result.fullKey
                              ? tr("common:copied", "Kopyalandı")
                              : tr("common:copy", "Kopyala")
                          }
                        >
                          <IconButton
                            size="small"
                            onClick={() => void copyKey(result.fullKey)}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip
                          title={tr(
                            "localization:actions.viewOrEditDetails",
                            "Detayları gör / düzenle"
                          )}
                        >
                          <IconButton size="small" onClick={() => openDetail(result)}>
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {result.value}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Box>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
