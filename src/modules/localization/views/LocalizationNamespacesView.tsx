// src/modules/localization/views/LocalizationNamespacesView.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Stack,
  TextField,
  Toolbar,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import RefreshIcon from "@mui/icons-material/Refresh";

import Breadcrumb from "@/app/[locale]/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb";

 
 

import { useI18n } from "@/app/context/i18nContext";
import { useLocalizationNamespaces } from "../hooks/useLocalizationNamespaces";

type LocalizationNamespacesViewProps = {
  locale: string;
};

export default function LocalizationNamespacesView({
  locale,
}: LocalizationNamespacesViewProps) {
  const lang = (locale ?? "tr-TR").toString();
 
  const { t } = useI18n(["localization", "common", "detailPage"]);

  const {
    filteredRows,
    query,
    setQuery,
    loading,
    errorMessage,
    setErrorMessage,
    refresh,
  } = useLocalizationNamespaces(lang);

  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    if (errorMessage) {
      setToastOpen(true);
    }
  }, [errorMessage]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "name",
        headerName: t("localization:namespaces.grid.name"),
        minWidth: 300,
        flex: 1,
      },
    ],
    [t]
  );

  return (
    <Box>
      <Breadcrumb
        title={t("localization:namespaces.title")}
        subtitle={t("localization:namespaces.subtitle")}
        items={[
          {
            title: t("localization:namespaces.breadcrumb.dashboard"),
            to: `/${lang}/dashboards/modern`,
          },
          {
            title: t("localization:namespaces.breadcrumb.localization"),
          },
          {
            title: t("localization:namespaces.breadcrumb.namespaces"),
          },
        ]}
      />

      <Toolbar disableGutters sx={{ mb: 2, gap: 2, flexWrap: "wrap" }}>
        <TextField
          size="small"
          label={t("localization:namespaces.search.label")}
          placeholder={t("localization:namespaces.search.placeholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{
            minWidth: {
              xs: "100%",
              sm: 320,
            },
          }}
        />

        <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
          <Button
            onClick={() => void refresh()}
            variant="contained"
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <RefreshIcon />
              )
            }
          >
            {t("localization:namespaces.actions.refresh")}
          </Button>
        </Stack>
      </Toolbar>

      <Card>
        <CardContent>
          <Box sx={{ width: "100%", height: 620 }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              loading={loading}
              disableRowSelectionOnClick
              checkboxSelection={false}
              pageSizeOptions={[10, 25, 50, 100]}
              getRowId={(row) => row.id}
            />
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={toastOpen}
        autoHideDuration={3500}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        onClose={() => {
          setToastOpen(false);
          setErrorMessage(null);
        }}
      >
        <Alert
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
          onClose={() => {
            setToastOpen(false);
            setErrorMessage(null);
          }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}