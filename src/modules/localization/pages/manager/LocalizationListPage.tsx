//src/modules/localization/pages/manager/LocalizationListPage.tsx
"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import RefreshIcon from "@mui/icons-material/Refresh";
import Breadcrumb from "@/app/[locale]/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb";
import { useRouter } from "next/navigation";
import { useI18nNs } from "@/app/context/i18nContext";

import NewKeyDialog from "@/modules/localization/components/NewKeyDialog";
import {
  getLanguages,
  getTranslationsByNamespace,
  prettyApiError,
  LanguageItem,
  TranslationDto,
} from "@/modules/localization/services/localizationService";
import { API_BASE as CONFIG_API_BASE } from "@/lib/config";

const API_VERSION = "1.0";
const API_BASE = CONFIG_API_BASE || "";

type LocalizationListPageProps = {
  locale: string;
};

interface TranslationRow {
  id: string;
  key: string;
  __versions?: Record<string, string | null>;
  [cultureCode: string]: any;
}

const groupByKey = (items: TranslationDto[]): TranslationRow[] => {
  const map = new Map<string, TranslationRow>();

  const put = (
    row: TranslationRow,
    code: string,
    val: string,
    ver: string | null,
  ) => {
    (row as any)[code] = val;
    row.__versions = row.__versions ?? {};
    row.__versions[code] = ver;
  };

  for (const raw of items) {
    if (!raw.key || !raw.cultureCode) continue;

    const key = raw.key;
    const longCode = raw.cultureCode;
    const shortCode = longCode.includes("-")
      ? longCode.split("-")[0]
      : longCode;

    let row = map.get(key);
    if (!row) {
      row = { id: key, key, __versions: {} };
      map.set(key, row);
    }

    const value = raw.value ?? "";
    const version = raw.version ?? null;

    put(row, longCode, value, version);
    if (!(shortCode in row)) {
      put(row, shortCode, value, version);
    }
  }

  return Array.from(map.values());
};

export default function LocalizationListPage({
  locale,
}: LocalizationListPageProps) {
  const router = useRouter();
  const lang = (locale ?? "tr").toString();
  const { t, ready } = useI18nNs(["localization", "common"]);

  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [rows, setRows] = useState<TranslationRow[]>([]);
  const [namespaceQuery, setNamespaceQuery] = useState("banner");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    msg: string;
    sev: "success" | "error" | "info" | "warning";
  }>({ open: false, msg: "", sev: "info" });

  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const mountedRef = useRef(false);

  const tr = useCallback(
    (key: string, fallback: string) => {
      const value = t(key);
      return value === `[${key}]` ? fallback : value;
    },
    [t],
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    console.log("[LocalizationListPage] i18n durumu", {
      ready,
      locale: lang,
      namespaceQuery,
    });
  }, [ready, lang, namespaceQuery]);

  useEffect(() => {
    (async () => {
      try {
        const langs = await getLanguages();
        if (!mountedRef.current) return;

        setLanguages(langs);

        const defaults = langs
          .filter((l) => l.isDefault)
          .map((l) => l.cultureCode);

        if (defaults.length) {
          setSelectedLangs(defaults);
        } else if (langs.length) {
          setSelectedLangs([langs[0].cultureCode]);
        }
      } catch {
        if (!mountedRef.current) return;

        setToast({
          open: true,
          msg: tr(
            "localization:messages.languagesLoadFailed",
            "Dil listesi alınamadı.",
          ),
          sev: "error",
        });
      }
    })();
  }, [tr]);

  const cultureOptions = useMemo(
    () => Array.from(new Set(languages.map((l) => l.cultureCode))),
    [languages],
  );

  const fetchNamespaceForCultures = useCallback(
    async (ns: string, cultures: string[]) => {
      const trimmed = ns?.trim();

      if (!trimmed || cultures.length === 0) {
        setRows([]);
        return;
      }

      setLoading(true);

      try {
        const all: TranslationDto[] = await getTranslationsByNamespace(
          trimmed,
          cultures,
        );
        const merged = groupByKey(all);

        if (!mountedRef.current) return;
        setRows(merged);

        console.log("[LocalizationListPage] Namespace verileri yüklendi", {
          namespace: trimmed,
          cultures,
          rowCount: merged.length,
        });
      } catch (error: any) {
        if (!mountedRef.current) return;

        setRows([]);
        setToast({ open: true, msg: prettyApiError(error), sev: "error" });

        console.error("[LocalizationListPage] Namespace verileri yüklenemedi", {
          namespace: trimmed,
          cultures,
          error: error?.message ?? String(error),
        });
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (!namespaceQuery) return;
    void fetchNamespaceForCultures(namespaceQuery, selectedLangs);
  }, [namespaceQuery, selectedLangs, fetchNamespaceForCultures]);

  const handleCreateNewKey = useCallback(
    async (ns: string, key: string, values: Record<string, string>) => {
      const trimmedNs = ns.trim();
      const trimmedKey = key.trim();

      if (!trimmedNs || !trimmedKey) {
        setToast({
          open: true,
          msg: tr(
            "localization:messages.namespaceAndKeyRequired",
            "Namespace ve key zorunludur.",
          ),
          sev: "warning",
        });
        return;
      }

      setSaving(true);

      try {
        const composedKey = `${trimmedNs}:${trimmedKey}`;

        for (const language of languages) {
          const culture = language.cultureCode;
          const value = values[culture] ?? "";

          const url = `${API_BASE}/api/v${API_VERSION}/${culture}/localization/manager/upsert`;
          const body = {
            key: composedKey,
            culture,
            value,
            expectedRowVersion: null,
            audit: {
              modifiedBy: "admin",
              reason: "Create new key from list page",
              sourceIp: "127.0.0.1",
            },
          };

          const res = await fetch(url, {
            method: "POST",
            headers: {
              accept: "application/json",
              "Content-Type": "application/json",
              "x-cache-invalidate": trimmedNs,
            },
            body: JSON.stringify(body),
          });

          let payload: any = null;
          try {
            payload = await res.json();
          } catch {
            // intentionally empty
          }

          if (!res.ok) {
            const err: any = new Error(`HTTP ${res.status}`);
            err.response = res;
            err.body = payload;
            throw err;
          }
        }

        setToast({
          open: true,
          msg: tr(
            "localization:messages.newKeyCreated",
            "Yeni anahtar oluşturuldu.",
          ),
          sev: "success",
        });

        console.log("[LocalizationListPage] Yeni anahtar oluşturuldu", {
          namespace: trimmedNs,
          key: trimmedKey,
        });

        void fetchNamespaceForCultures(trimmedNs, selectedLangs);
      } catch (error: any) {
        setToast({ open: true, msg: prettyApiError(error), sev: "error" });

        console.error("[LocalizationListPage] Yeni anahtar oluşturulamadı", {
          namespace: trimmedNs,
          key: trimmedKey,
          error: error?.message ?? String(error),
        });
      } finally {
        setSaving(false);
        setCreateOpen(false);
      }
    },
    [languages, selectedLangs, fetchNamespaceForCultures, tr],
  );

  const columns: GridColDef<TranslationRow>[] = useMemo(() => {
    const base: GridColDef<TranslationRow>[] = [
      {
        field: "key",
        headerName: tr("localization:grid.key", "Key"),
        flex: 1.2,
        minWidth: 220,
      },
    ];

    const langs: GridColDef<TranslationRow>[] = selectedLangs.map((code) => ({
      field: code,
      headerName:
        languages.find((l) => l.cultureCode === code)?.name || code,
      flex: 1,
      minWidth: 180,
      valueGetter: (_val: unknown, row: TranslationRow) =>
        (row as any)[code] ?? (row as any)[code.split("-")[0]] ?? "",
    }));

    const actions: GridColDef<TranslationRow>[] = [
      {
        field: "actions",
        headerName: tr("localization:grid.actions", "İşlemler"),
        sortable: false,
        align: "center",
        minWidth: 160,
        renderCell: (params) => {
          const fullKey = String(params.row.key);
          const ns = fullKey.split(":")[0] || "common";

          return (
            <Tooltip
              title={tr(
                "localization:actions.viewOrEditDetails",
                "Detayları gör / düzenle",
              )}
            >
              <Button
                size="small"
                variant="outlined"
                onClick={() =>
                  router.push(
                    `/${lang}/superadmin/localization/${encodeURIComponent(
                      fullKey,
                    )}?ns=${encodeURIComponent(ns)}`,
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

    return [...base, ...langs, ...actions];
  }, [selectedLangs, languages, router, lang, tr]);

  return (
    <Box>
      <Breadcrumb
        title={tr("localization:page.title", "Çeviri Yönetimi")}
        subtitle={tr(
          "localization:page.subtitle",
          "Anahtarlar ve diller bazında çevirileri görüntüleyin",
        )}
        items={[
          {
            title: tr("common:dashboard", "Dashboard"),
            to: `/${lang}/dashboards/modern`,
          },
          { title: tr("localization:breadcrumb.section", "Localization") },
        ]}
      />

      {!ready && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {tr(
            "common:loadingTranslations",
            "Çeviriler henüz yüklenmedi, geçici metinler gösteriliyor.",
          )}
        </Alert>
      )}

      <Toolbar
        disableGutters
        sx={{ mb: 2, gap: 2, flexWrap: "wrap", alignItems: "center" }}
      >
        <TextField
          size="small"
          label={tr(
            "localization:filters.namespace",
            "Namespace (ör. banner)",
          )}
          value={namespaceQuery}
          onChange={(e) => setNamespaceQuery(e.target.value)}
          sx={{ minWidth: 240 }}
        />

        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
          disabled={loading}
          onClick={() => void fetchNamespaceForCultures(namespaceQuery, selectedLangs)}
        >
          {tr("common:refresh", "Yenile")}
        </Button>

        <Autocomplete
          multiple
          size="small"
          sx={{ minWidth: 320 }}
          options={cultureOptions}
          value={selectedLangs}
          onChange={(_, value) => setSelectedLangs(value)}
          isOptionEqualToValue={(opt, val) => opt === val}
          renderOption={(props, option) => {
            const language = languages.find((l) => l.cultureCode === option);
            const { key, ...restProps } = props;

            return (
              <li key={key} {...restProps}>
                <span style={{ marginRight: 8 }}>{language?.flagEmoji ?? "🏳️"}</span>
                {language?.name ?? option}
              </li>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={tr(
                "localization:filters.languages",
                "Görüntülenecek Diller",
              )}
            />
          )}
          getOptionLabel={(opt) =>
            languages.find((l) => l.cultureCode === opt)?.name || opt
          }
          disableCloseOnSelect
        />

        <Box sx={{ flex: 1 }} />

        <Button variant="outlined" onClick={() => setCreateOpen(true)}>
          {tr("localization:actions.newKey", "Yeni Anahtar")}
        </Button>
      </Toolbar>

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

      <NewKeyDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreateNewKey}
        languages={languages}
        defaultNs={namespaceQuery}
        saving={saving}
      />
    </Box>
  );
}