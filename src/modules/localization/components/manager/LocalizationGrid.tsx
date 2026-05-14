"use client";

import { Button, Card, CardContent, Tooltip } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
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

  const columns: GridColDef<LocalizationTranslationRow>[] = useMemo(() => {
    const base: GridColDef<LocalizationTranslationRow>[] = [
      {
        field: "key",
        headerName: tr("localization:grid.key", "Key"),
        flex: 1.2,
        minWidth: 240,
      },
    ];

    const languageColumns: GridColDef<LocalizationTranslationRow>[] =
      selectedLangs.map((code) => ({
        field: code,
        headerName:
          languages.find((item) => item.cultureCode === code)?.name || code,
        flex: 1,
        minWidth: 180,
        valueGetter: (_, row) =>
          row.values[code] ?? row.values[code.split("-")[0]] ?? "",
      }));

    const actions: GridColDef<LocalizationTranslationRow>[] = [
      {
        field: "actions",
        headerName: tr("localization:grid.actions", "İşlemler"),
        sortable: false,
        align: "center",
        minWidth: 160,
        renderCell: (params) => {
          const fullKey = params.row.key;
          const namespace = fullKey.split(":")[0] || "common";

          return (
            <Tooltip
              title={tr(
                "localization:actions.viewOrEditDetails",
                "Detayları gör / düzenle"
              )}
            >
              <Button
                size="small"
                variant="outlined"
                onClick={() =>
                  router.push(
                    `/${locale}/localization/detail?key=${encodeURIComponent(
                      fullKey
                    )}&ns=${encodeURIComponent(namespace)}`
                  )
                }
              >
                {tr("localization:actions.detail", "Detay")}
              </Button>
            </Tooltip>
          );
        },
      },
    ];

    return [...base, ...languageColumns, ...actions];
  }, [selectedLangs, languages, router, locale, tr]);

  return (
    <Card>
      <CardContent>
        <div style={{ width: "100%", height: 640 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSizeOptions={[10, 25, 50]}
            loading={loading}
            disableRowSelectionOnClick
            getRowId={(row) => row.id}
          />
        </div>
      </CardContent>
    </Card>
  );
}