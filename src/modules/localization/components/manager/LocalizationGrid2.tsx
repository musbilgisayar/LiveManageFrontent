// components/manager/LocalizationGrid.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import {
  Edit as EditIcon,
  ContentCopy as CopyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import {
  LocalizationLanguageItem,
  LocalizationTranslationRow,
} from "../../types/LocalizationManager.types";

type Props = {
  locale: string;
  rows: LocalizationTranslationRow[];
  selectedLangs: string[];
  languages: LocalizationLanguageItem[];
  loading: boolean;
  tr: (key: string, fallback: string) => string;
};

export default function LocalizationGrid({
  locale,
  rows,
  selectedLangs,
  languages,
  loading,
  tr,
}: Props) {
  const router = useRouter();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(text);
      window.setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      setCopiedKey(null);
    }
  };

  const columns: GridColDef<LocalizationTranslationRow>[] = useMemo(() => {
    const base: GridColDef<LocalizationTranslationRow>[] = [
      {
        field: "key",
        headerName: tr("localization:grid.key", "Key"),
        flex: 1.25,
        minWidth: 320,
        sortable: true,
        renderCell: (params: GridRenderCellParams<LocalizationTranslationRow>) => {
          const key = params.row.key;
          const namespace = key.includes(":") ? key.split(":")[0] : "";

          return (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                width: "100%",
                minWidth: 0,
              }}
            >
              <Tooltip
                title={
                  copiedKey === key
                    ? tr("common:copied", "Kopyalandı!")
                    : tr("common:copy", "Kopyala")
                }
              >
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    void copyToClipboard(key);
                  }}
                  sx={{
                    opacity: 0.65,
                    flexShrink: 0,
                    transition: "opacity 0.2s ease",
                    "&:hover": { opacity: 1 },
                  }}
                >
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Typography
                variant="body2"
                title={key}
                sx={{
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  fontWeight: 600,
                }}
              >
                {key}
              </Typography>

              {namespace && (
                <Chip
                  label={namespace}
                  size="small"
                  sx={(theme) => ({
                    height: 22,
                    maxWidth: 120,
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: "primary.main",
                    flexShrink: 0,
                  })}
                />
              )}
            </Box>
          );
        },
      },
    ];

    const languageColumns: GridColDef<LocalizationTranslationRow>[] =
      selectedLangs.map((code) => ({
        field: code,
        flex: 1,
        minWidth: 220,
        sortable: false,
        renderHeader: () => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Typography variant="caption" sx={{ fontWeight: 800 }}>
              {languages.find((item) => item.cultureCode === code)?.name || code}
            </Typography>

            <Chip
              label={code}
              size="small"
              variant="outlined"
              sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700 }}
            />
          </Box>
        ),
        valueGetter: (_value, row) =>
          row.values[code] ?? row.values[code.split("-")[0]] ?? "",
        renderCell: (params: GridRenderCellParams<LocalizationTranslationRow>) => {
          const value = String(params.value ?? "");
          const hasValue = value.trim().length > 0;

          return (
            <Tooltip
              title={
                hasValue
                  ? value
                  : tr("localization:missing", "Eksik çeviri")
              }
              arrow
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  width: "100%",
                  minWidth: 0,
                  opacity: hasValue ? 1 : 0.65,
                  color: hasValue ? "text.primary" : "text.secondary",
                }}
              >
                {hasValue ? (
                  <CheckCircleIcon
                    sx={{
                      fontSize: 15,
                      color: "success.main",
                      opacity: 0.55,
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <WarningIcon
                    sx={{
                      fontSize: 16,
                      color: "warning.main",
                      flexShrink: 0,
                    }}
                  />
                )}

                <Typography
                  variant="body2"
                  sx={{
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontStyle: hasValue ? "normal" : "italic",
                  }}
                >
                  {hasValue
                    ? value
                    : tr("localization:notTranslated", "Çevrilmedi")}
                </Typography>
              </Box>
            </Tooltip>
          );
        },
      }));

    const actions: GridColDef<LocalizationTranslationRow>[] = [
      {
        field: "actions",
        headerName: tr("localization:grid.actions", "İşlemler"),
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: "center",
        headerAlign: "center",
        minWidth: 150,
        renderCell: (params: GridRenderCellParams<LocalizationTranslationRow>) => {
          const fullKey = params.row.key;
          const namespace = fullKey.includes(":")
            ? fullKey.split(":")[0]
            : "common";

          return (
            <Tooltip
              title={tr(
                "localization:actions.viewOrEditDetails",
                "Detayları gör / düzenle"
              )}
            >
              <Button
                size="small"
                variant="contained"
                startIcon={<EditIcon />}
                onClick={(event) => {
                  event.stopPropagation();

                  router.push(
                    `/${locale}/localization/detail?key=${encodeURIComponent(
                      fullKey
                    )}&ns=${encodeURIComponent(namespace)}`
                  );
                }}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                  },
                }}
              >
                {tr("localization:actions.detail", "Detay")}
              </Button>
            </Tooltip>
          );
        },
      },
    ];

    return [...base, ...languageColumns, ...actions];
  }, [selectedLangs, languages, router, locale, tr, copiedKey]);

  return (
    <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
      <Box
        sx={(theme) => ({
          width: "100%",
          height: 640,
          "& .MuiDataGrid-root": {
            border: "none",
            borderRadius: 2,
          },
          "& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus": {
            outline: "none",
          },
          "& .MuiDataGrid-columnHeaders": {
            bgcolor: alpha(theme.palette.primary.main, 0.035),
            borderBottom: "1px solid",
            borderColor: "divider",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: 800,
          },
          "& .MuiDataGrid-row": {
            cursor: "pointer",
            transition: "background-color 0.18s ease",
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.035),
            },
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid",
            borderColor: "divider",
          },
          "& .MuiDataGrid-virtualScroller": {
            "&::-webkit-scrollbar": {
              width: 8,
              height: 8,
            },
            "&::-webkit-scrollbar-track": {
              bgcolor: "action.hover",
              borderRadius: 4,
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "action.focus",
              borderRadius: 4,
              "&:hover": {
                bgcolor: "action.active",
              },
            },
          },
        })}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[10, 25, 50, 100]}
          loading={loading}
          disableRowSelectionOnClick
          getRowId={(row) => row.id}
          initialState={{
            pagination: { paginationModel: { pageSize: 25, page: 0 } },
            sorting: { sortModel: [{ field: "key", sort: "asc" }] },
          }}
        />
      </Box>
    </CardContent>
  );
}