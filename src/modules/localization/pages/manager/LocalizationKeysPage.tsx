//src/modules/localization/pages/manager/LocalizationKeysPage.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { API_BASE as CONFIG_API_BASE } from "@/lib/config";
import { useI18nNs } from "@/app/context/i18nContext";

const API_VERSION = "1.0";
const API_BASE = CONFIG_API_BASE || "";

type LocalizationKeysPageProps = {
  locale: string;
};

type KeyRow = {
  id: string;
  key: string;
  ns: string;
  name: string;
};

type FetchError = Error & {
  response?: Response;
  body?: unknown;
  rawText?: string;
};

const fetchJson = async <T,>(input: RequestInfo, init?: RequestInit): Promise<T> => {
  const res = await fetch(input, {
    ...init,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "x-correlation-id":
        (crypto as any)?.randomUUID?.() ?? Math.random().toString(36).slice(2),
      "x-client-version": "lm-frontend/keys-1.0.1",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const rawText = await res.text();
  let payload: any = null;

  if (rawText) {
    try {
      payload = JSON.parse(rawText);
    } catch {
      payload = rawText;
    }
  }

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`) as FetchError;
    err.response = res;
    err.body = payload;
    err.rawText = rawText;
    throw err;
  }

  return payload as T;
};

function prettyApiError(e: any): string {
  const status = e?.body?.status ?? e?.response?.status;
  const upstreamMsg =
    e?.body?.data?.message ??
    e?.body?.data?.title ??
    e?.body?.data?.detail ??
    e?.body?.message ??
    (typeof e?.body === "string" ? e.body : null) ??
    e?.message;

  switch (status) {
    case 400:
      return `Geçersiz istek. ${upstreamMsg ?? ""}`.trim();
    case 401:
      return "Yetkisiz istek (401).";
    case 403:
      return "Bu işlemi yapma yetkiniz yok (403).";
    case 404:
      return "Kaynak bulunamadı (404).";
    case 409:
      return "Çakışma (409).";
    case 422:
      return `İş kuralı hatası (422). ${upstreamMsg ?? ""}`.trim();
    case 500:
      return "Sunucu hatası (500).";
    case 502:
      return "Backend bağlantı hatası (502).";
    default:
      return upstreamMsg ? String(upstreamMsg) : "Beklenmeyen bir hata oluştu.";
  }
}

function toRow(keyValue: string): KeyRow {
  const idx = keyValue.indexOf(":");
  const ns = idx >= 0 ? keyValue.slice(0, idx) : "";
  const name = idx >= 0 ? keyValue.slice(idx + 1) : keyValue;

  return {
    id: keyValue,
    key: keyValue,
    ns,
    name,
  };
}

function extractKeys(response: any): string[] {
  if (Array.isArray(response)) {
    return response.filter((x) => typeof x === "string");
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  if (Array.isArray(response.data)) {
    return response.data.filter((x: unknown) => typeof x === "string");
  }

  if (Array.isArray(response.items)) {
    return response.items.filter((x: unknown) => typeof x === "string");
  }

  if (response.ok === true && Array.isArray(response.data)) {
    return response.data.filter((x: unknown) => typeof x === "string");
  }

  for (const value of Object.values(response)) {
    if (Array.isArray(value)) {
      return value.filter((x: unknown) => typeof x === "string");
    }
  }

  return [];
}

export default function LocalizationKeysPage({
  locale,
}: LocalizationKeysPageProps) {
  const lang = (locale ?? "tr").toString();
  const { t, ready } = useI18nNs(["localization", "common"]);

  const [allKeys, setAllKeys] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    msg: string;
    sev: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    msg: "",
    sev: "info",
  });

  const mountedRef = useRef(false);

  const tr = useCallback(
    (key: string, fallback: string) => {
      const value = t(key);
      return value === `[${key}]` ? fallback : value;
    },
    [t]
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    console.log("[LocalizationKeysPage] i18n durumu", {
      ready,
      locale: lang,
    });
  }, [ready, lang]);

  const fetchKeys = useCallback(async () => {
    if (!mountedRef.current) return;

    setLoading(true);

    const url = `${API_BASE}/api/v${API_VERSION}/localization/manager/keys/all`;

    try {
      const response = await fetchJson<any>(url, {
        headers: {
          "Accept-Language": lang,
        },
      });

      if (!mountedRef.current) return;

      const keys = extractKeys(response);
      setAllKeys(keys);

      console.log("[LocalizationKeysPage] Anahtar listesi yüklendi", {
        locale: lang,
        keyCount: keys.length,
        url,
      });
    } catch (error: any) {
      if (!mountedRef.current) return;

      console.error("[LocalizationKeysPage] Anahtar listesi yüklenemedi", {
        url,
        message: error?.message,
        status: error?.response?.status,
        body: error?.body,
        rawText: error?.rawText,
      });

      setAllKeys([]);
      setToast({
        open: true,
        msg: prettyApiError(error),
        sev: "error",
      });
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [lang]);

  useEffect(() => {
    void fetchKeys();
  }, [fetchKeys]);

  const rows: KeyRow[] = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const source = Array.isArray(allKeys) ? allKeys : [];
    const list = normalizedQuery
      ? source.filter((item) => item.toLowerCase().includes(normalizedQuery))
      : source;

    return list.map(toRow);
  }, [allKeys, query]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "ns",
        headerName: tr("localization:keys.grid.namespace", "Namespace"),
        minWidth: 160,
        flex: 0.5,
      },
      {
        field: "name",
        headerName: tr("localization:keys.grid.key", "Key"),
        minWidth: 360,
        flex: 1.2,
      },
      {
        field: "key",
        headerName: tr("localization:keys.grid.fullKey", "Full Key"),
        minWidth: 420,
        flex: 1.4,
      },
    ],
    [tr]
  );

  return (
    <Box>
      <Breadcrumb
        title={tr("localization:keys.page.title", "Localization Keys")}
        subtitle={tr(
          "localization:keys.page.subtitle",
          "Sistemde kayıtlı tüm çeviri anahtarları"
        )}
        items={[
          {
            title: tr("common:dashboard", "Dashboard"),
            to: `/${lang}/dashboards/modern`,
          },
          { title: tr("localization:breadcrumb.section", "Localization") },
          { title: tr("localization:keys.breadcrumb.current", "Keys") },
        ]}
      />

      {!ready && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {tr(
            "common:loadingTranslations",
            "Çeviriler henüz yüklenmedi, geçici metinler gösteriliyor."
          )}
        </Alert>
      )}

      <Toolbar disableGutters sx={{ mb: 2, gap: 2, flexWrap: "wrap" }}>
        <TextField
          size="small"
          label={tr("localization:keys.filters.search", "Ara (ns veya key)")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ minWidth: 320 }}
        />

        <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
          <Button
            onClick={() => void fetchKeys()}
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
            disabled={loading}
          >
            {tr("common:refresh", "Yenile")}
          </Button>
        </Stack>
      </Toolbar>

      <Card>
        <CardContent>
          <div style={{ width: "100%", height: 640 }}>
            <DataGrid
              rows={rows}
              columns={columns}
              disableRowSelectionOnClick
              checkboxSelection={false}
              pageSizeOptions={[10, 25, 50, 100]}
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