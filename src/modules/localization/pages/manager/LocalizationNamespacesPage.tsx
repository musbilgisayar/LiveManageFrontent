//src/modules/localization/pages/LocalizationNamespacesPage.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Alert,
  Stack,
  TextField,
  Toolbar,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import RefreshIcon from "@mui/icons-material/Refresh";
import Breadcrumb from "@/app/[locale]/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb";
import { API_BASE as CONFIG_API_BASE } from "@/lib/config";

const API_VERSION = "1.0";
const API_BASE = CONFIG_API_BASE || "";

type LocalizationNamespacesPageProps = {
  locale: string;
};

type NamespaceRow = {
  id: string;
  name: string;
  keyCount?: number;
  createdAt?: string;
};

const fetchJson = async <T,>(input: RequestInfo, init?: RequestInit): Promise<T> => {
  const res = await fetch(input, {
    ...init,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "x-correlation-id":
        (crypto as any)?.randomUUID?.() ?? Math.random().toString(36).slice(2),
      "x-client-version": "lm-frontend/namespaces-1.0.0",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(`HTTP ${res.status}`) as Error & {
      response?: Response;
      body?: any;
    };
    (error as any).response = res;
    (error as any).body = json;
    throw error;
  }

  return json as T;
};

function prettyApiError(e: any): string {
  const status = e?.body?.status ?? e?.response?.status;
  const msg =
    e?.body?.message ??
    e?.body?.data?.message ??
    e?.body?.title ??
    e?.body?.detail ??
    e?.message;

  return `[${status ?? "Error"}] ${msg ?? "Bilinmeyen hata"}`;
}

function useIsMounted() {
  const ref = useRef(false);

  useEffect(() => {
    ref.current = true;
    return () => {
      ref.current = false;
    };
  }, []);

  return ref;
}

export default function LocalizationNamespacesPage({
  locale,
}: LocalizationNamespacesPageProps) {
  const lang = (locale ?? "tr").toString();

  const [rows, setRows] = useState<NamespaceRow[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    msg: string;
    sev: "success" | "error" | "info";
  }>({
    open: false,
    msg: "",
    sev: "info",
  });

  const isMounted = useIsMounted();

  const fetchNamespaces = useCallback(async () => {
    if (!isMounted.current) return;

    setLoading(true);
    const url = `${API_BASE}/api/v${API_VERSION}/${lang}/localization/manager/namespaces`;

    try {
      const raw = await fetchJson<any>(url);
      if (!isMounted.current) return;

      let list: string[] = [];

      if (Array.isArray(raw)) list = raw;
      else if (Array.isArray(raw.data)) list = raw.data;
      else if (Array.isArray(raw.items)) list = raw.items;
      else {
        console.error("⚠️ Beklenmedik namespace formatı:", raw);
        throw new Error("Namespace listesi beklenen formatta değil.");
      }

      const mapped: NamespaceRow[] = list.map((name) => ({
        id: name,
        name,
      }));

      setRows(mapped);
    } catch (e: any) {
      console.error("[LocalizationNamespacesPage] fetch error:", e);
      if (!isMounted.current) return;

      setToast({
        open: true,
        msg: prettyApiError(e),
        sev: "error",
      });
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [lang, isMounted]);

  useEffect(() => {
    void fetchNamespaces();
  }, [fetchNamespaces]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return normalizedQuery
      ? rows.filter((row) => row.name.toLowerCase().includes(normalizedQuery))
      : rows;
  }, [query, rows]);

  const columns: GridColDef[] = useMemo(
    () => [{ field: "name", headerName: "Namespace", minWidth: 250, flex: 1 }],
    []
  );

  return (
    <Box>
      <Breadcrumb
        title="Namespaces"
        subtitle="Çeviri alanlarını (namespace) yönetin"
        items={[
          { title: "Dashboard", to: `/${lang}/dashboards/modern` },
          { title: "Localization" },
          { title: "Namespaces" },
        ]}
      />

      <Toolbar disableGutters sx={{ mb: 2, gap: 2, flexWrap: "wrap" }}>
        <TextField
          size="small"
          label="Ara (namespace adı)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ minWidth: 320 }}
        />

        <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
          <Button
            onClick={() => void fetchNamespaces()}
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
            disabled={loading}
          >
            Yenile
          </Button>
        </Stack>
      </Toolbar>

      <Card>
        <CardContent>
          <div style={{ width: "100%", height: 600 }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              disableRowSelectionOnClick
              checkboxSelection={false}
              pageSizeOptions={[10, 25, 50]}
              loading={loading}
              getRowId={(row) => row.id}
            />
          </div>
        </CardContent>
      </Card>

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast((current) => ({ ...current, open: false }))}
          severity={toast.sev}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}